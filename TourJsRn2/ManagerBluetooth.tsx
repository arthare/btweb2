import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  PermissionsAndroid,
} from 'react-native';
import { BleError, BleManager, Device, ScanMode } from 'react-native-ble-plx';
import { State } from 'react-native-gesture-handler';
import ComponentButton from './ComponentButton';

const ManagerBluetooth = (props:{children:any}) => {

  let [bleManager, setBleManager] = useState<BleManager|null>(null);
  let [bleState, setBleState] = useState<string>('');
  let [blePermissionsValid, setBlePermissionsValid] = useState<boolean>(false);
  let [selectedPowermeter, setSelectedPowermeter] = useState<Device|null>(null);

  // searching
  let [searchResults, setSearchResults] = useState<Device[]>([]);
  let [lastDeviceDetected, setLastDeviceDetected] = useState<Device|null>(null);

  const navStyle = {
    minHeight: 32,
    justifyContent: 'center' as any,
    paddingLeft: 16,
    flex: 0,
    flexDirection: 'row' as any,
  }


  useEffect(() => {
    // startup setup
    PermissionsAndroid.check('android.permission.ACCESS_FINE_LOCATION').then((havePermission) => {
      setBlePermissionsValid(true);
    });
    

    return function cleanup() {
      if(bleManager) {
        bleManager.destroy()
      }
    }

  }, []);

  useEffect(() => {
    // react to permissions state changing
    const manager = new BleManager();
    setBleManager(manager);

    manager.onStateChange((state) => {
      console.log("state = ", state);
      setBleState(state);
    })
    manager.state().then((state) => {
      setBleState(state);
    })

  }, [blePermissionsValid])

  useEffect(() => {
    // react to bluetooth state changing
    console.log("bluetooth state changed ", bleState);
  }, [bleState])

  const onDeviceDetected = (err:BleError|null, newDevice:Device|null, activeFilter:string) => {
    console.log("found ", newDevice, " active filter ", activeFilter, searchResults);
    if(!newDevice || !newDevice.serviceUUIDs) {
      return;
    }
    const matchingUuid = newDevice.serviceUUIDs.find((uuid) => uuid.includes(activeFilter));
    if(matchingUuid) {
      console.log("matching uuid ", matchingUuid);
      setLastDeviceDetected(newDevice);
    } else {
      console.log(newDevice.name, " didn't match filter of ", activeFilter);
    }
  }
  useEffect(() => {
    // a device has changed!  let's add it to the search results
    if(lastDeviceDetected) {

      const hash:{[key:string]:Device} = {};
      searchResults.forEach((device) => {
        hash[device.id] = device;
      });
      hash[lastDeviceDetected.id] = lastDeviceDetected;

      const newSearchResults = Object.keys(hash).map((id) => hash[id]);
      setSearchResults(newSearchResults);
    }
  }, [lastDeviceDetected])



  const onPickPowermeter = () => {
    setSearchResults([]);
    bleManager?.startDeviceScan(['1818'],{scanMode:ScanMode.Balanced}, (err, newDevice) => onDeviceDetected(err, newDevice, '1818'));
  }
  const onPickTrainer = () => {
    setSearchResults([]);
    bleManager?.startDeviceScan(['1826'],null, (err, newDevice) => onDeviceDetected(err, newDevice, '1826'));
  }
  const onPickHrm = () => {
    setSearchResults([]);
    bleManager?.startDeviceScan(['180d'],null, (err, newDevice) => onDeviceDetected(err, newDevice, '180d'));
  }

  const onFinishScan = (fnSet:(dev:Device)=>void, arg:Device) => {
    console.log("they're picking ", arg.name, " for ", fnSet.name)
    fnSet(arg); // update the device they've told us to
    bleManager?.stopDeviceScan();
    setSearchResults([]);
  }

  const requestLocation = () => {
    PermissionsAndroid.request(
      'android.permission.ACCESS_FINE_LOCATION',
      {
        title: "TourJS Bluetooth Permission",
        message:
          "TourJS needs location permission because Google considers bluetooth access to be the same as location access.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      }
    ).then((granted) => {
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setBlePermissionsValid(true);
      } else {
        console.log("Location permission denied");
      }
    })
  }

  console.log("search results ", searchResults);
  const bleReady = bleState === 'PoweredOn';
  return (
    <>
      <View style={navStyle}>
        {!blePermissionsValid && (
          <ComponentButton title="Location Services Required" onPress={requestLocation}></ComponentButton>
        )}
        {blePermissionsValid && (<>
          {!bleReady && (
            <Text>Turn On Bluetooth</Text>
          )}
          {bleReady && (
            <ComponentButton title="PM" onPress={onPickPowermeter} />
          )}
          {bleReady && (
            <ComponentButton title="Trainer" onPress={onPickTrainer} />
          )}
          {bleReady && (
            <ComponentButton title="HRM" onPress={onPickHrm} />
          )}

        </>)}
      </View>

      {searchResults.length > 0 && (
        <View>
          {searchResults.map((searchResult, index) => {
            return <ComponentButton key={index} onPress={() => onFinishScan(setSelectedPowermeter, searchResult)} title={searchResult.name || "Unknown Device"} />
          })}
        </View>
      )}
      {searchResults.length <= 0 && props.children}
    </>
  );
};

export default ManagerBluetooth;
