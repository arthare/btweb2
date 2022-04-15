
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {  faBolt, faHeart } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react';
import { AppPlayerContextType } from '../ContextPlayer';
import { AppPlayerContextInstance } from '../index-contextLoaders';
import { getDeviceFactory } from '../tourjs-client-shared/DeviceFactory';
import { ConnectedDeviceInterface } from '../tourjs-client-shared/WebBluetoothDevice';

import './PowerDevicePicker.scss';
import { AppAuthContextType } from '../ContextAuth';
import NoBleHelper from './NoBleHelper';


enum BluetoothDevicePickerState {
  Unset,
  Working,
  Connected,
}
function BluetoothDevicePicker(props:{playerContext:AppPlayerContextType, icon:any, deviceName:string, fnOnAttemptConnect:()=>Promise<ConnectedDeviceInterface>, fnGetLastData:()=>string, fnDisconnect:()=>void}) {

  let [state, setState] = useState<BluetoothDevicePickerState>(BluetoothDevicePickerState.Unset);
  let [lastData, setLastData] = useState<string>('');
  
  const onAttemptConnect = async () => {
    setState(BluetoothDevicePickerState.Working);
    try {
      await props.fnOnAttemptConnect();
      setState(BluetoothDevicePickerState.Connected);
    } catch(e) {
      setState(BluetoothDevicePickerState.Unset);
    }
    
  }

  let iconClass = '';
  switch(state) {
    case BluetoothDevicePickerState.Connected:
      iconClass = 'Connected';
      break;
    case BluetoothDevicePickerState.Unset:
      iconClass = 'Unset';
      break;
    case BluetoothDevicePickerState.Working:
      iconClass = 'Working';
      break;
  }

  useEffect(() => {
    if(props.playerContext) {
      props.playerContext.on('deviceDataChange', () => {
        setLastData(props.fnGetLastData());
      })
    }
  }, [props.playerContext])

  return (
    <div className="BluetoothDevicePicker__Container" onClick={() => onAttemptConnect()}>
      <div className="BluetoothDevicePicker__Image" onClick={() => onAttemptConnect()}>
        <FontAwesomeIcon className={`BluetoothDevicePicker__Image--Icon ${iconClass}`} icon={props.icon} />
      </div>
      <div className="BluetoothDevicePicker__Text">
        <h3>{props.deviceName}</h3>
        {state === BluetoothDevicePickerState.Unset && (
          <p>Click to connect</p>
        )}
        {state === BluetoothDevicePickerState.Working && (
          <p>Trying to connect... click icon to try again</p>
        )}
        {state === BluetoothDevicePickerState.Connected && (
          <p>Connected - {lastData}</p>
        )}
      </div>
    </div>
  )
}

enum PowerDevicePickerState {
  NoAliasYet,
  Ready,
}

export default function PowerDevicePicker(props:{authContext:AppAuthContextType, playerContext:AppPlayerContextType}) {

  let [state, setState] = useState<PowerDevicePickerState>(PowerDevicePickerState.NoAliasYet);
  let [bleSupported, setBleSupported] = useState<boolean>(false);

  const onConnectPm = async ():Promise<ConnectedDeviceInterface> => {
    const device = await getDeviceFactory().findPowermeter();
    props.playerContext.setPowerDevice(device);
    return device;
  }
  const onConnectHrm = async ():Promise<ConnectedDeviceInterface> => {
    const device = await getDeviceFactory().findHrm();
    props.playerContext.setHrmDevice(device);
    return device;
  }


  useEffect(() => {

    const handleAliasChange = () => {
      if(props.authContext.getSelectedAlias()) {
        setState(PowerDevicePickerState.Ready);
      } else {
        setState(PowerDevicePickerState.NoAliasYet);
      }
    }

    if(props.playerContext) {
      props.authContext.on('aliasChange', handleAliasChange);
    }

    return function cleanup() {
      props.authContext.off('aliasChange', handleAliasChange);
    }
  }, [props.playerContext]);

  return (
    <div className="PowerDevicePicker__Container">
      <h2>Device Setup</h2>
      {state === PowerDevicePickerState.Ready && (<>
        <BluetoothDevicePicker playerContext={props.playerContext} 
                              icon={faBolt} 
                              deviceName="Power Meter" 
                              fnOnAttemptConnect={onConnectPm} 
                              fnGetLastData={() => props.playerContext.localUser.getLastPower().toFixed() + 'W'}
                              fnDisconnect={()=>props.playerContext.disconnectPowerDevice()} 
                              />
        <BluetoothDevicePicker playerContext={props.playerContext} 
                              icon={faHeart} 
                              deviceName="Heart Rate Monitor" 
                              fnOnAttemptConnect={onConnectHrm} 
                              fnGetLastData={() => props.playerContext.localUser.getLastHrm(new Date().getTime()).toFixed() + 'bpm'}
                              fnDisconnect={()=>props.playerContext.disconnectHrmDevice()} 
                              />
      </>)}
      {state === PowerDevicePickerState.NoAliasYet && (<>
        <p>You still have to pick the profile you're riding with today.</p>
      </>)}
    </div>
  )
}