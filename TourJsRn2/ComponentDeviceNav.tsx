
import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import { StoredData } from './App';
import ComponentButton from './ComponentButton';
import { PlayerSetup, PlayerSetupInstance, SensorReading, TrainerMode, TrainerSensorReading } from './ComponentPlayerSetup';
import { DeviceContext, STATUS_CONNECTED, STATUS_DISCONNECTED, STATUS_HEALTHY, STATUS_UNHEALTHY, STATUS_UNUSED, WhichStatus } from './UtilsBle';
import * as RootNavigation from './RootNavigation.js';
import { RaceResultSubmission } from './common/communication';
import {apiPostInternal} from './common/communication';

class DeviceStatus {
  tmLast:number;
  tmLastLeftSwap:number;
  lastLeft:boolean;
  lastFlag:number;

  constructor() {
    this.tmLast = new Date().getTime();
    this.tmLastLeftSwap = this.tmLast;
    this.lastLeft = true;
    this.lastFlag = STATUS_UNUSED;
  }

  update(flags:number) {
    const tmNow = new Date().getTime();
    this.tmLast = tmNow;
    if(tmNow - this.tmLastLeftSwap > 500) {
      this.lastLeft = !this.lastLeft;
      this.tmLastLeftSwap = tmNow;
    }
    this.lastFlag = flags;
  }

  getStyle():{style:any,textStyle:any} {

    const commonStyle = {
      borderWidth: 4,
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 'auto',
    }
    const commonTextStyle = {
      fontSize: 12,
      color: 'black' as any,
    }

    if(this.lastFlag & STATUS_DISCONNECTED) {
      // we only ever hit disconnected when something WAS connected, so make this big and red to attract the user's attention
      return { 
        style: {
          ...commonStyle,
          'borderWidth': 4,
          'borderColor': 'red',
        },
        textStyle: {
          ...commonTextStyle,
        },
      }
    } else if(this.lastFlag & STATUS_UNHEALTHY) {
      return { 
        style: {
          ...commonStyle,
          'borderColor': 'yellow',
        },
        textStyle: {
          ...commonTextStyle,
        }
      }
    } else if(this.lastFlag & STATUS_HEALTHY) {
      // if we're healthy, just keep alternating border colors to let the user know we're good
      return {
        style: {
          ...commonStyle,
          'borderColor': this.lastLeft ? 'lightgreen' : 'green',
        },
        textStyle: {
          ...commonTextStyle,
        }
      }
    } else if(this.lastFlag & STATUS_CONNECTED) {
      // connected but not "healthy"?  this means we're in the process of connecting.  hopefully we'll get data soon
      return {
        style: {
          ...commonStyle,
          'backgroundColor': 'yellow',
        },
        textStyle: {
          ...commonTextStyle,
        }
      }
    } else {
      return {
        style: {},
        textStyle: {},
      }
    }
  }
}
type DeviceStatusMap = {
  pmStatus: DeviceStatus;
  trainerStatus: DeviceStatus;
  hrmStatus:DeviceStatus;
}

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

  const defaultDeviceStatus = {
    pmStatus: new DeviceStatus(),
    trainerStatus: new DeviceStatus(),
    hrmStatus: new DeviceStatus(),
  }

  let playerCtx = useContext<PlayerSetup>(PlayerSetupInstance);

  let [lastPower, setLastPower] = useState<SensorReading|null>(null);
  let [lastHrm, setLastHrm] = useState<SensorReading|null>(null);
  let [playerData, setPlayerData] = useState<StoredData>(playerCtx.playerData);
  let [lastTrainer, setLastTrainer] = useState<TrainerSensorReading|null>(null);
  let [lastDeviceChange, setLastDeviceChange] = useState<DeviceStatusMap>(defaultDeviceStatus);

  const navStyle = {
    paddingLeft: 4,
    paddingRight: 4,
    minHeight: 32,
    justifyContent: 'center' as any,
    opacity: 1.0,
  }

  useEffect(() => {
    // set up listeners to the device context

    const handleChange = (which:WhichStatus) => {
      let oldVal = lastDeviceChange[which] || new DeviceStatus();
      oldVal.update(props.deviceContext.getDeviceFlags(which));
      const updated = {
        ...lastDeviceChange,
      }
      updated[which] = oldVal;
      setLastDeviceChange(updated);
    }

    props.deviceContext.addEventListener('power', setLastPower);
    props.deviceContext.addEventListener('trainer', setLastTrainer);
    props.deviceContext.addEventListener('hrm', setLastHrm);
    props.deviceContext.addEventListener('change', handleChange);

    let handlePlayerChange = () => {

      // ooo, the player data changed.  Let's update the async storage
      setPlayerData(playerCtx.playerData);
    };
    
    playerCtx.on('playerDataChange', handlePlayerChange)
    
    return function cleanup() {
      props.deviceContext.removeEventListener('power', setLastPower);
      props.deviceContext.removeEventListener('trainer', setLastTrainer);
      props.deviceContext.removeEventListener('hrm', setLastHrm);
      props.deviceContext.removeEventListener('change', handleChange);
      playerCtx.off('playerDataChange', handlePlayerChange);
    }
  }, []);

  let pmTitle = "+PM";
  if(lastPower) {
    pmTitle = lastPower.value.toFixed(0) + 'W';
  }

  let trainerTitle = "+FTMS";
  if(lastTrainer) {
    switch(lastTrainer.lastMode) {
      case TrainerMode.Erg:
        trainerTitle = `⛒${lastTrainer.lastErg.toFixed(0)}W`;
        break;
      case TrainerMode.Resistance:
        trainerTitle = `Dumb\n${lastTrainer.lastResistance.toFixed(0)}%`;
        break;
      case TrainerMode.Sim:
        trainerTitle = `Sim\n${lastTrainer.lastSlope.toFixed(1)}`;
        break;
      case TrainerMode.Unknown:
        trainerTitle = "📻...";
        break;
    }
  }

  let hrmTitle = "+HRM";
  if(lastHrm) {
    hrmTitle = lastHrm.value.toFixed(0) + '♡';
  }

  const onDownloadPwx = () => {
    // let's just post to the TourJS server
    const user = playerCtx.getLocalUser();
    const samples = playerCtx.getLocalUserHistory(0);

    let ixLastNonzeroPower = samples.length - 1;
    while(ixLastNonzeroPower > 0 && samples[ixLastNonzeroPower].power <= 0) {
      ixLastNonzeroPower--;
    }

    let deviceName = '';
    if(props.deviceContext.pmDevice) {
      deviceName += `PM ${props.deviceContext.pmDevice.name()}`
    }
    if(props.deviceContext.trainerDevice) {
      deviceName += `Trainer ${props.deviceContext.trainerDevice.name()}`
    }
    if(props.deviceContext.hrmDevice) {
      deviceName += `HRM ${props.deviceContext.hrmDevice.name()}`
    }

    const strStart = new Date(samples[0].tm).toLocaleString();
    const strEnd = new Date(samples[ixLastNonzeroPower].tm).toLocaleString();
    const activityName = "TourJS-Android";
    const submission:RaceResultSubmission = {
      rideName: `${user.getName()} doing ${activityName} from ${strStart} to ${strEnd}`,
      riderName: user.getName(),
      tmStart: samples[0].tm,
      tmEnd: samples[ixLastNonzeroPower].tm,
      activityName,
      handicap: user.getHandicap(),
      samples,
      deviceName,
      bigImageMd5: user.getBigImageMd5() || '',
    }
    if(submission.bigImageMd5) {
      return apiPostInternal('https://tourjs.ca/tourjs-api', 'submit-ride-result', submission).then((urlToHit:string) => {
        Linking.canOpenURL(urlToHit).then((supported) => {
          if(supported) {
            Linking.openURL(urlToHit);
          }
        })
      }, (failure) => {
        console.log("submission failure");
        debugger;
      })
    }

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
          <View style={{flexDirection: 'row', flexGrow:1}}>
            <ComponentButton style={{flex: 1}} title={`Name: ${playerData.name}\nHandicap: ${playerData.handicap}W`} onPress={props.onSetupPlayer} onLongPress={()=>{}} />
          </View>
          <View style={{flex: 1, flexGrow: 0, flexShrink: 0, flexBasis: 40, flexDirection: 'row', backgroundColor: 'red'}}>
            <ComponentButton {...lastDeviceChange.pmStatus.getStyle()}      title={pmTitle} onPress={props.onSearchPowermeter} onLongPress={props.onFakePowermeter} />
            <ComponentButton {...lastDeviceChange.trainerStatus.getStyle()} title={trainerTitle} onPress={props.onSearchTrainer} onLongPress={props.onFakeTrainer} />
            <ComponentButton {...lastDeviceChange.hrmStatus.getStyle()}     title={hrmTitle} onPress={props.onSearchHrm} onLongPress={props.onFakeHrm} />
            {playerCtx.isLocked() && playerCtx.getLocalUser()?.getBigImageMd5() && (
              <ComponentButton title="PWX" onPress={onDownloadPwx} onLongPress={()=>{}} />
            )}
          </View>
          
        </>)}

      </>)}
    </View>
  );
};

export default ComponentDeviceNav;
