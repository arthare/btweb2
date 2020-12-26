
import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
} from 'react-native';
import { StoredData } from './App';
import ComponentButton from './ComponentButton';
import { PlayerSetup, PlayerSetupInstance, SensorReading, TrainerMode, TrainerSensorReading } from './ComponentPlayerSetup';
import { DeviceContext } from './UtilsBle';
import * as RootNavigation from './RootNavigation.js';

const ComponentDeviceNav = (props:{deviceContext:DeviceContext, 
                                   blePermissionsValid:boolean, 
                                   bleReady:boolean, 
                                   onSetupPlayer:()=>void, 
                                   requestLocation:()=>void, 
                                   onSearchHrm:()=>void, 
                                   onSearchPowermeter:()=>void, 
                                   onSearchTrainer:()=>void,
                                   onFakeHrm:()=>void,
                                   onFakePowermeter:()=>void,
                                   onFakeTrainer:()=>void}) => {

  let playerCtx = useContext<PlayerSetup>(PlayerSetupInstance);

  let [lastPower, setLastPower] = useState<SensorReading|null>(null);
  let [lastHrm, setLastHrm] = useState<SensorReading|null>(null);
  let [playerData, setPlayerData] = useState<StoredData>(playerCtx.playerData);
  let [lastTrainer, setLastTrainer] = useState<TrainerSensorReading|null>(null);

  const navStyle = {
    minHeight: 32,
    justifyContent: 'center' as any,
    paddingLeft: 16,
    flex: 0,
    flexDirection: 'row' as any,
  }
  useEffect(() => {
    // set up listeners to the device context
    props.deviceContext.addEventListener('power', setLastPower);
    props.deviceContext.addEventListener('trainer', setLastTrainer);
    props.deviceContext.addEventListener('hrm', setLastHrm);

    let handlePlayerChange = () => {

      // ooo, the player data changed.  Let's update the async storage
      setPlayerData(playerCtx.playerData);
    };
    
    playerCtx.on('playerDataChange', handlePlayerChange)
    
    return function cleanup() {
      props.deviceContext.removeEventListener('power', setLastPower);
      props.deviceContext.removeEventListener('trainer', setLastTrainer);
      props.deviceContext.removeEventListener('hrm', setLastHrm);
      playerCtx.off('playerDataChange', handlePlayerChange);
    }
  }, []);

  let pmTitle = "+PM";
  if(lastPower) {
    pmTitle = lastPower.value.toFixed(0) + 'W';
  }

  let trainerTitle = "+Trainer";
  if(lastTrainer) {
    switch(lastTrainer.lastMode) {
      case TrainerMode.Erg:
        trainerTitle = `Erg\n${lastTrainer.lastErg.toFixed(0)}W`;
        break;
      case TrainerMode.Resistance:
        trainerTitle = `Dumb\n${lastTrainer.lastResistance.toFixed(0)}%`;
        break;
      case TrainerMode.Sim:
        trainerTitle = `Sim\n${lastTrainer.lastSlope.toFixed(1)}`;
        break;
      case TrainerMode.Unknown:
        trainerTitle = "Connecting...";
        break;
    }
  }

  let hrmTitle = "+HRM";
  if(lastHrm) {
    hrmTitle = lastHrm.value.toFixed(0) + 'bpm';
  }



  return (
    <View style={navStyle}>
      {!props.blePermissionsValid && (
        <ComponentButton title="Location Services Required" onPress={props.requestLocation} onLongPress={()=>{}}></ComponentButton>
      )}
      {props.blePermissionsValid && (<>
        {!props.bleReady && (
          <Text>Turn On Bluetooth</Text>
        )}
        {props.bleReady && (<>
          <ComponentButton title={`Name: ${playerData.name}\nHandicap: ${playerData.handicap}W`} onPress={props.onSetupPlayer} onLongPress={()=>{}} />
          <ComponentButton title={pmTitle} onPress={props.onSearchPowermeter} onLongPress={props.onFakePowermeter} />
          <ComponentButton title={trainerTitle} onPress={props.onSearchTrainer} onLongPress={props.onFakeTrainer} />
          <ComponentButton title={hrmTitle} onPress={props.onSearchHrm} onLongPress={props.onFakeHrm} />
        </>)}

      </>)}
    </View>
  );
};

export default ComponentDeviceNav;
