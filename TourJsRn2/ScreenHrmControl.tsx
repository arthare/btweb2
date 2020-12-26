import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { CanvasHTMLAttributes, useContext, useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';

import {HeartRateEngine, ZeroToOne} from './common/heart-rate-engine';
import ComponentButton from './ComponentButton';
import ComponentKeyValue from './ComponentKeyValue';
import { PlayerSetupInstance, SensorReading } from './ComponentPlayerSetup';
import { DeviceContextInstance } from './ManagerBluetooth';
import Canvas from 'react-native-canvas';

let frame = 0;
let tmLastUpdate = 0;
const ScreenHrmControl = () => {

  const deviceCtx = useContext(DeviceContextInstance);
  const playerSetup = useContext(PlayerSetupInstance);

  let [lastBpm, setLastBpm] = useState<SensorReading|null>(null);
  let [lastPower, setLastPower] = useState<SensorReading|null>(null);
  let [hrmEngine, setHrmEngine] = useState<HeartRateEngine|null>(null);
  let [targetBpm, setTargetBpm] = useState<number>(140);
  let [expectedHandicap, setExpectedHandicap] = useState<number>(75);
  let [gainFactor, setGainFactor] = useState<number>(100);
  let [lastTargetPower, setLastTargetPower] = useState<number>(0);
  let [lastTargetHandicap, setLastTargetHandicap] = useState<number>(75);
  let [updateCount, setUpdateCount] = useState<number>(0);

  let canvas = useRef();
  

  useEffect(() => {
    const tmNow = new Date().getTime();
    if(hrmEngine && lastBpm && lastPower && lastBpm.value > 0 && lastBpm.value < 180) {
      const dt = (tmNow - tmLastUpdate) / 1000;
      const {newTargetHandicap} = hrmEngine.tick(playerSetup.getLocalUser(), 
                                                  tmNow, 
                                                  dt, 
                                                  targetBpm, 
                                                  new ZeroToOne(expectedHandicap/100), 
                                                  new ZeroToOne(gainFactor / 100));
      tmLastUpdate = tmNow;

      const user = playerSetup.getLocalUser();

      const pwr = user.getHandicap() * newTargetHandicap.val;
      deviceCtx.setTargetWatts(pwr);

      setLastTargetPower(pwr);
      setLastTargetHandicap(newTargetHandicap.val * 100);
      setUpdateCount(updateCount + 1);
    }
  }, [lastBpm, lastPower, hrmEngine])

  const paintFrame = () => {
    const curCanvas = canvas.current as any;
    if(curCanvas) {
      const ctx = curCanvas.getContext('2d');
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, curCanvas.width, curCanvas.height);
  
      const tmNow = new Date().getTime();
      const lastHrm = playerSetup.getLocalUserHistory(tmNow - 120000);
  
      if(lastHrm.length >= 2) {
        // let's draw a line!
        ctx.strokeStyle = 'red';
        const tmLeft:number = lastHrm[0].tm;
        const tmRight:number = lastHrm[lastHrm.length - 1].tm;
        const tmSpan = tmRight - tmLeft;
        const maxBpm:number = Math.max(200, ...lastHrm.map((sample) => sample.hrm));
        const minBpm:number = 40;
        const bpmSpan = maxBpm - minBpm;
        ctx.beginPath();
        lastHrm.forEach((hist, index) => {
          const pctX = (hist.tm - tmLeft) / tmSpan;
          const pctY = (hist.hrm - minBpm) / bpmSpan;
  
          if(index === 0) {
            ctx.moveTo(0, pctY * curCanvas.height);
          } else {
            ctx.lineTo(pctX*curCanvas.width, pctY*curCanvas.height);
          }
        });
        ctx.stroke();
      }
      
    }
  }

  useEffect(() => {
    playerSetup.setPlayerDataLock(true);
    // we need to subscribe to HRM changes
    deviceCtx.addEventListener('hrm', setLastBpm);
    deviceCtx.addEventListener('power', setLastPower);

    return function cleanup() {
      playerSetup.setPlayerDataLock(false);
      deviceCtx.removeEventListener('hrm', setLastBpm);
      deviceCtx.removeEventListener('power', setLastPower);
    }
  }, []);

  useEffect(() => {
    // when the HRM reading changes, need to feed it to the engine.  if the engine doesn't exist, 
    if(lastBpm && lastBpm.value !== 0 && lastBpm.value < 180 && !hrmEngine) {
      // our first nonzero plausible heartrate!
      setHrmEngine(new HeartRateEngine(lastBpm.value));
    }
    paintFrame();
  }, [lastBpm])

  const delta = (change:number) => {
    setTargetBpm(Math.max(40, targetBpm + change));
  }

  const textStyle = {
    fontSize:24,
  };
  const valueStyle = {
    fontSize: 36,
  }


  return (
    <>
      <Text>HRM Control</Text>
      {hrmEngine && (
      <View style={{flexDirection: 'row', flex: 1}}>
        <View style={{flexDirection: 'column', flexBasis: 0, flexGrow: 1, flexShrink: 1, maxWidth: '50%', backgroundColor: 'red'}}>
          <View style={{flex:0, flexDirection:'row'}}>
            <ComponentButton title="-5" onPress={()=>delta(-5)} onLongPress={()=>{}} />
            <ComponentButton title="-1" onPress={()=>delta(-1)} onLongPress={()=>{}} />
            <ComponentButton title="+1" onPress={()=>delta(1)} onLongPress={()=>{}} />
            <ComponentButton title="+5" onPress={()=>delta(5)} onLongPress={()=>{}} />
          </View>

          <Text style={textStyle}>Target bpm: {targetBpm.toFixed(0)}</Text>
          <ComponentKeyValue keyStyle={textStyle} valueStyle={valueStyle} keyTitle={"Target bpm"} valueTitle={targetBpm.toFixed(0) + "bpm"} />
          <ComponentKeyValue keyStyle={textStyle} valueStyle={valueStyle} keyTitle={"Target W"} valueTitle={lastTargetPower.toFixed(0) + "W"} />
          <ComponentKeyValue keyStyle={textStyle} valueStyle={valueStyle} keyTitle={"Target %W"} valueTitle={lastTargetHandicap.toFixed(0) + "%"} />
        </View>
        <Canvas ref={canvas} style={{flexDirection: 'column', flexBasis: 0, flexGrow: 1, flexShrink: 1, backgroundColor: 'black', height: '100%'}} />
      </View>
      )}
      
      {!hrmEngine && (<>
        <Text>You need nonzero power (last: {lastPower && lastPower.value.toFixed(0)}W) and heartrate under 180 (last: {lastBpm && lastBpm.value.toFixed(0)}) to get started</Text>
      </>)}
    </>
  );
};

export default ScreenHrmControl;
