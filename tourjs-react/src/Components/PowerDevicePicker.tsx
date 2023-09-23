
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
import { msPromise } from '../tourjs-client-shared/DeviceUtils';


enum BluetoothDevicePickerState {
  Unset,
  UnsetAfterConnect,
  Working,
  Connected,
}
function BluetoothDevicePicker(props:{children?:any, playerContext:AppPlayerContextType, myDevice:ConnectedDeviceInterface, icon:any, deviceName:string, fnOnAttemptConnect:()=>Promise<ConnectedDeviceInterface>, fnGetLastData:()=>any, fnDisconnect:()=>void}) {

  let [state, setState] = useState<BluetoothDevicePickerState>(BluetoothDevicePickerState.Unset);
  let [lastData, setLastData] = useState<string>('');
  let [counter, setCounter] = useState<number>(0);
  let [counterTimer, setCounterTimer] = useState<NodeJS.Timeout>(null);
  
  const onAttemptConnect = async () => {
    setState(BluetoothDevicePickerState.Working);
    try {
      await props.fnOnAttemptConnect();
      setState(BluetoothDevicePickerState.Connected);
    } catch(e) {
      setState(BluetoothDevicePickerState.UnsetAfterConnect);
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
    if(state === BluetoothDevicePickerState.Connected) {
      // start the counter
      let counter = 0;
      console.log("clearing old interval timer", counterTimer);
      clearInterval(counterTimer);
      let timeout = setInterval(() => {
        counter++;
        console.log("counter going to ", counter);
        setCounter(counter);
      }, 250)
      setCounterTimer(timeout);
    } else {
      clearInterval(counterTimer);
      setCounterTimer(null);
      setCounter(0);
    }

    return function cleanup() {
      clearInterval(counterTimer);
    }
  }, [state])

  useEffect(() => {
    if(state === BluetoothDevicePickerState.Connected && counter > 0 && props.playerContext.localUser && props.myDevice?.userWantsToKeep()) {
      const tmNow = new Date().getTime();
      const data = props.fnGetLastData();
      if(data?.power !== undefined) {
        const msAge = tmNow - data.tmLastUpdate;
        setLastData(`${data.power.toFixed(0)}W - ${(msAge/1000).toFixed(1)}s ago`);
      } else {
        setLastData(data);
      }
    } else {
      setLastData('');
    }
  }, [counter, state, props.myDevice, props.playerContext.localUser])

  useEffect(() => {
    if(props.playerContext) {
      if(props.myDevice && props.myDevice.userWantsToKeep() && state === BluetoothDevicePickerState.Unset) {
        // this fella already has a device
        setState(BluetoothDevicePickerState.Connected);
      }
    }

  }, [props.playerContext, state, props.myDevice])

  return (
    <div className="BluetoothDevicePicker__Container" onClick={() => onAttemptConnect()}>
      <div className="BluetoothDevicePicker__Image">
        <FontAwesomeIcon className={`BluetoothDevicePicker__Image--Icon ${iconClass}`} icon={props.icon} />
      </div>
      <div className="BluetoothDevicePicker__Text">
        <h3>{props.deviceName}</h3>
        {state === BluetoothDevicePickerState.Unset && (
          <p>Click to connect</p>
        )}
        {state === BluetoothDevicePickerState.UnsetAfterConnect && (
          <p>Last Connect attempt failed with status {props.children}.  Click to connect again.</p>
        )}
        {state === BluetoothDevicePickerState.Working && (
          <p>Trying to connect... click icon to try again - {props.children && props.children}</p>
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
  const [pmStatus, setPmStatus] = useState<string>('');

  const onStatusData = (str:string) => {
    setPmStatus(str);
    console.log("Status string from pm connection: ", str);
  }

  const onConnectPm = async ():Promise<ConnectedDeviceInterface> => {
    try {
      if(props.playerContext.powerDevice !== null) {
        onStatusData("Disconnecting old device");
        props.playerContext.disconnectPowerDevice();
        await msPromise(1000);
      }
      
      
      const device = await getDeviceFactory().findPowermeter(onStatusData);
      props.playerContext.setPowerDevice(device);
      return device;
    } catch(e) {
      console.log(e, " while trying to connect to PM");
      setPmStatus(e.message);
      throw e;
    }
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
                              myDevice={props.playerContext.powerDevice}
                              icon={faBolt} 
                              deviceName="Power Meter" 
                              fnOnAttemptConnect={onConnectPm} 
                              fnGetLastData={() => props.playerContext.localUser.getLastPower()}
                              fnDisconnect={()=>props.playerContext.disconnectPowerDevice()} 
                              >{pmStatus}</BluetoothDevicePicker>
        <BluetoothDevicePicker playerContext={props.playerContext} 
                              myDevice={props.playerContext.hrmDevice}
                              icon={faHeart} 
                              deviceName="Heart Rate Monitor" 
                              fnOnAttemptConnect={onConnectHrm} 
                              fnGetLastData={() => props.playerContext.localUser.getLastHrm(new Date().getTime()).toFixed() + 'bpm'}
                              fnDisconnect={()=>props.playerContext.disconnectHrmDevice()} 
                              ></BluetoothDevicePicker>
      </>)}
      {state === PowerDevicePickerState.NoAliasYet && (<>
        <p>You still have to pick the profile you're riding with today.</p>
      </>)}
    </div>
  )
}