import { NavigationContainer, useNavigation } from '@react-navigation/native';
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
import ComponentDeviceNav from './ComponentDeviceNav';
import { DeviceContext } from './UtilsBle';
import { isHrm, isPowermeter, isTrainer } from './UtilsBleBase';
import * as RootNavigation from './RootNavigation';
import ComponentPlayerSetup from './ComponentPlayerSetup';

const SEARCH_FLAGS_PM = 1;
const SEARCH_FLAGS_TRAINER = 2;
const SEARCH_FLAGS_HRM = 4;
const SEARCH_FLAGS_PLAYER_DATA = 8;


export const DeviceContextInstance = React.createContext<DeviceContext>(new DeviceContext());

const ManagerBluetooth = (props:{children:any}) => {

  let [bleManager, setBleManager] = useState<BleManager|null>(null);
  let [bleState, setBleState] = useState<string>('');
  let [blePermissionsValid, setBlePermissionsValid] = useState<boolean>(false);
  let [deviceCtx, setDeviceCtx] = useState<DeviceContext>(new DeviceContext());

  // searching
  let [searchResults, setSearchResults] = useState<Device[]>([]);
  let [lastDeviceDetected, setLastDeviceDetected] = useState<Device|null>(null);
  let [searchingFlags, setSearchingFlags] = useState<number>(0);

  const isSearchingPowermeter = searchingFlags & SEARCH_FLAGS_PM;
  const isSearchingTrainer = searchingFlags & SEARCH_FLAGS_TRAINER;
  const isSearchingHrm = searchingFlags & SEARCH_FLAGS_HRM;



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


  const onStartScan = (uuidFilter:string, searchFlags:number) => {
    
    setSearchResults([]);
    setSearchingFlags(searchFlags);
    bleManager?.connectedDevices([uuidFilter]).then((connectedDevices) => {
      console.log("there are ", connectedDevices.length, " devices already connected");
      connectedDevices.forEach((dev) => onDeviceDetected(null, dev, uuidFilter));
    })
    bleManager?.startDeviceScan([uuidFilter],{scanMode:ScanMode.Balanced}, (err, newDevice) => onDeviceDetected(err, newDevice, uuidFilter));
  }

  const onSearchPowermeter = () => {
    onStartScan('1818', SEARCH_FLAGS_PM);
  }
  const onSearchTrainer = () => {
    onStartScan('1826', SEARCH_FLAGS_TRAINER);
  }
  const onSearchHrm = () => {
    onStartScan('180d', SEARCH_FLAGS_HRM);
  }

  const onPickPowermeter = (device:Device) => {
    deviceCtx.setPowermeter(device);
  }
  const onPickTrainer = (device:Device) => {
    deviceCtx.setTrainer(device);
  }
  const onPickHrm = (device:Device) => {
    deviceCtx.setHrm(device);
  }
  const onSetupPlayer = () => {
    setSearchingFlags(SEARCH_FLAGS_PLAYER_DATA);
  }


  const onFinishScan = (selectedDevice:Device|null) => {
    bleManager?.stopDeviceScan();
    setSearchResults([]);
    setSearchingFlags(0);
    setLastDeviceDetected(null);

    if(!selectedDevice || !selectedDevice.serviceUUIDs || !Array.isArray(selectedDevice.serviceUUIDs)) {
      return;
    }
    // we need to figure out where this device should go.
    selectedDevice.serviceUUIDs.forEach((uuid) => {
      if(isPowermeter(uuid) && isSearchingPowermeter) {
        onPickPowermeter(selectedDevice);
      }
      if(isTrainer(uuid) && isSearchingTrainer) {
        onPickTrainer(selectedDevice)
      }
      if(isHrm(uuid) && isSearchingHrm) {
        onPickHrm(selectedDevice)
      }
    })
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

  const onPlayerChangeDone = () => {
    // nothing to do
    setSearchingFlags(0);
  }

  console.log("search results ", searchResults);
  const bleReady = bleState === 'PoweredOn';
  return (
    <>
      <DeviceContextInstance.Provider value={deviceCtx}>
        <ComponentDeviceNav {...{deviceContext: deviceCtx, onSetupPlayer, requestLocation, bleReady, blePermissionsValid, onSearchPowermeter, onSearchHrm, onSearchTrainer}} />

        {( searchingFlags & ~SEARCH_FLAGS_PLAYER_DATA) !== 0 && (
          <View>
            <ComponentButton onPress={() => onFinishScan(null)} title="Cancel Search" />
            {searchResults.length > 0 && searchResults.map((searchResult, index) => {
              return <ComponentButton key={index} onPress={() => onFinishScan(searchResult)} title={searchResult.name || "Unknown Device"} />
            })}
            {searchResults.length <= 0 && (
              <Text>Searching...</Text>
            )}
          </View>
        )}
        {(searchingFlags & SEARCH_FLAGS_PLAYER_DATA) ? (
          <View style={{backgroundColor:'green'}}>
            <ComponentPlayerSetup onDone={onPlayerChangeDone} />
          </View>
        ) : <></>}
        {searchingFlags === 0 && props.children}
      </DeviceContextInstance.Provider>
    </>
  );
};

export default ManagerBluetooth;
