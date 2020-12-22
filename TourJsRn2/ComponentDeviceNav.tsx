
import React, { useContext, useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';
import ComponentButton from './ComponentButton';
import { DeviceContext } from './UtilsBle';

const ComponentDeviceNav = (props:{deviceContext:DeviceContext, blePermissionsValid:boolean, bleReady:boolean, requestLocation:()=>void, onSearchHrm:()=>void, onSearchPowermeter:()=>void, onSearchTrainer:()=>void}) => {

  let [lastPower, setLastPower] = useState<number>(-1);
  let [lastHrm, setLastHrm] = useState<number>(-1);

  const navStyle = {
    minHeight: 32,
    justifyContent: 'center' as any,
    paddingLeft: 16,
    flex: 0,
    flexDirection: 'row' as any,
  }
  useEffect(() => {
    // set up listeners to the device context
    const handleWatts = (watts:number) => {
      setLastPower(watts);
    }
    const handleHrm = (hrm:number) => {
      setLastHrm(hrm);
    }
    props.deviceContext.emitter.addListener('power', handleWatts);
    props.deviceContext.emitter.addListener('hrm', handleHrm);

    return function cleanup() {
      props.deviceContext.emitter.removeListener('power', handleWatts);
      props.deviceContext.emitter.removeListener('hrm', handleHrm);
    }
  }, []);

  let pmTitle = "+PM";
  if(lastPower >= 0) {
    pmTitle = lastPower.toFixed(0) + 'W';
  }

  let trainerTitle = "+Trainer";
  let hrmTitle = "+HRM";
  if(lastHrm >= 0) {
    hrmTitle = lastHrm.toFixed(0) + 'bpm';
  }

  return (
    <View style={navStyle}>
      {!props.blePermissionsValid && (
        <ComponentButton title="Location Services Required" onPress={props.requestLocation}></ComponentButton>
      )}
      {props.blePermissionsValid && (<>
        {!props.bleReady && (
          <Text>Turn On Bluetooth</Text>
        )}
        {props.bleReady && (
          <ComponentButton title={pmTitle} onPress={props.onSearchPowermeter} />
        )}
        {props.bleReady && (
          <ComponentButton title={trainerTitle} onPress={props.onSearchTrainer} />
        )}
        {props.bleReady && (
          <ComponentButton title={hrmTitle} onPress={props.onSearchHrm} />
        )}

      </>)}
    </View>
  );
};

export default ComponentDeviceNav;
