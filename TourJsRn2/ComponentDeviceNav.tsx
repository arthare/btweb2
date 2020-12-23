
import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
} from 'react-native';
import { StoredData } from './App';
import ComponentButton from './ComponentButton';
import { PlayerSetup, PlayerSetupInstance } from './ComponentPlayerSetup';
import { DeviceContext } from './UtilsBle';
import * as RootNavigation from './RootNavigation.js';

const ComponentDeviceNav = (props:{deviceContext:DeviceContext, blePermissionsValid:boolean, bleReady:boolean, onSetupPlayer:()=>void, requestLocation:()=>void, onSearchHrm:()=>void, onSearchPowermeter:()=>void, onSearchTrainer:()=>void}) => {

  let playerCtx = useContext<PlayerSetup>(PlayerSetupInstance);

  let [lastPower, setLastPower] = useState<number>(-1);
  let [lastHrm, setLastHrm] = useState<number>(-1);
  let [playerData, setPlayerData] = useState<StoredData>(playerCtx.playerData);


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

    let handlePlayerChange = () => {

      // ooo, the player data changed.  Let's update the async storage
      setPlayerData(playerCtx.playerData);
    };
    
    playerCtx.on('playerDataChange', handlePlayerChange)
    
    return function cleanup() {
      props.deviceContext.emitter.removeListener('power', handleWatts);
      props.deviceContext.emitter.removeListener('hrm', handleHrm);
      playerCtx.off('playerDataChange', handlePlayerChange);
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
        {props.bleReady && (<>
          <ComponentButton title={`Name: ${playerData.name}\nHandicap: ${playerData.handicap}W`} onPress={props.onSetupPlayer} />
          <ComponentButton title={pmTitle} onPress={props.onSearchPowermeter} />
          <ComponentButton title={trainerTitle} onPress={props.onSearchTrainer} />
          <ComponentButton title={hrmTitle} onPress={props.onSearchHrm} />
        </>)}

      </>)}
    </View>
  );
};

export default ComponentDeviceNav;
