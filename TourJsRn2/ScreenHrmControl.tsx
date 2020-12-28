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

import {HeartRateEngine, ZeroToOne, ZeroToOneIsh} from './common/heart-rate-engine';
import ComponentButton from './ComponentButton';
import ComponentKeyValue from './ComponentKeyValue';
import { PlayerSetupInstance, SensorReading } from './ComponentPlayerSetup';
import { DeviceContextInstance } from './ManagerBluetooth';
import Canvas from 'react-native-canvas';
import {GCanvasView, GImage} from '@flyskywhy/react-native-gcanvas';
import { assert2 } from './common/Utils';
import setupContextWithTheseCoords from './pojs/setupContextWithTheseCoords';

let frame = 0;
let tmLastUpdate = 0;
let rafs = 0;
let frames = 0;
let animRequest:number|null = null;
const ScreenHrmControl = () => {

  const deviceCtx = useContext(DeviceContextInstance);
  const playerSetup = useContext(PlayerSetupInstance);

  let [lastBpm, setLastBpm] = useState<SensorReading|null>(null);
  let [lastPower, setLastPower] = useState<SensorReading|null>(null);
  let [hrmEngine, setHrmEngine] = useState<HeartRateEngine|null>(null);
  let [targetBpm, setTargetBpm] = useState<number>(140);
  let [gainFactor, setGainFactor] = useState<number>(100);
  let [lastTargetPower, setLastTargetPower] = useState<number>(0);
  let [lastTargetHandicap, setLastTargetHandicap] = useState<number>(75);
  let [updateCount, setUpdateCount] = useState<number>(0);

  let [canvas, setCanvas] = useState<GCanvasView|null>(null);
  let [ctx, setCtx] = useState<any>(null);
  let [canvasReady, setCanvasReady] = useState<boolean>(false);
  

  useEffect(() => {
    const tmNow = new Date().getTime();
    if(hrmEngine && lastBpm && lastPower && lastBpm.value > 0 && lastBpm.value < 180) {
      const dt = (tmNow - tmLastUpdate) / 1000;
      const {newTargetHandicap} = hrmEngine.tick(playerSetup.getLocalUser(), 
                                                  tmNow, 
                                                  dt, 
                                                  targetBpm, 
                                                  new ZeroToOneIsh(lastTargetHandicap/100), 
                                                  new ZeroToOneIsh(gainFactor / 100));
      tmLastUpdate = tmNow;

      const user = playerSetup.getLocalUser();

      const pwr = user.getHandicap() * newTargetHandicap.val;
      deviceCtx.setTargetWatts(pwr);

      setLastTargetPower(pwr);
      setLastTargetHandicap(newTargetHandicap.val * 100);
      setUpdateCount(updateCount + 1);
      //paintFrame();
    }
  }, [lastBpm, lastPower, hrmEngine])

  const handleRaf = () => {


    const paintFrame = () => {
      const curCanvas = canvas;
      if(curCanvas && canvasReady && ctx) {
        const tmNow = new Date().getTime();
    
        const maxBpm = 190;
        const minBpm = 40;
        const minMsAgo = -90000;
        const maxMsAgo = 10000;
        const tmSpan = maxMsAgo - minMsAgo;
        const lastHrm = playerSetup.getLocalUserHistory(tmNow - tmSpan);

        ctx.resetTransform();
        ctx.scale(canvas.width / 90, -(canvas.height / (maxBpm - minBpm)));
        ctx.translate(-minMsAgo/1000, -(maxBpm));
        ctx.fillStyle = 'black';
        ctx.fillRect(minMsAgo/1000, minBpm, 90, maxBpm-minBpm);

        ctx.strokeStyle = 'white';
        ctx.setLineDash([1,1]);
        ctx.beginPath();
        ctx.moveTo(minMsAgo/1000, targetBpm);
        ctx.lineTo(maxMsAgo/1000, targetBpm);
        ctx.stroke();
        if(lastHrm.length >= 2) {
          // let's draw a line!
          ctx.setLineDash([]);
          ctx.strokeStyle = 'red';
          const tmLeft:number = tmNow - tmSpan;
          ctx.beginPath();
          lastHrm.forEach((hist, index) => {
            const sAgo = (hist.tm - tmNow)/1000;
            const pctX = (hist.tm - tmLeft) / tmSpan;
    
            if(index === 0) {
              ctx.moveTo(sAgo, hist.hrm);
            } else {
              ctx.lineTo(sAgo, hist.hrm);
            }
          });
          ctx.stroke();
        }
        
      }
    }
    frames++;
    paintFrame();
    rafs++;
    assert2(rafs === frames);
    if(animRequest !== null) {
      // animation request will be set to null when we want to shut down
      animRequest = (requestAnimationFrame(handleRaf));
    }
  }
  

  useEffect(() => {
    playerSetup.setPlayerDataLock(true, "HRM-Mode");
    // we need to subscribe to HRM changes
    deviceCtx.addEventListener('hrm', setLastBpm);
    deviceCtx.addEventListener('power', setLastPower);

    return function cleanup() {
      cancelAnimationFrame(animRequest as any);
      animRequest = null;
      playerSetup.setPlayerDataLock(false, "");
      deviceCtx.removeEventListener('hrm', setLastBpm);
      deviceCtx.removeEventListener('power', setLastPower);
    }
  }, []);

  useEffect(() => {
    // when the HRM reading changes, need to feed it to the engine.  if the engine doesn't exist, 
    //paintFrame();
    if(lastBpm && lastBpm.value !== 0 && lastBpm.value < 180 && !hrmEngine) {
      // our first nonzero plausible heartrate!
      setHrmEngine(new HeartRateEngine(lastBpm.value));
    }
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

  let initCanvas = (canvas) => {
    console.log("we got a canvas!");
    setCanvas(canvas);
  }
  let canvasIsReady = (a,b,c,d) => {
    const ctx = (canvas.getContext('2d'));
    setCtx(ctx);
    setCanvasReady(true);
  }

  useEffect(() => {
    if(canvas && canvasReady && ctx && animRequest === null) {
      animRequest = (requestAnimationFrame(handleRaf));
    }
  }, [canvas, canvasReady, ctx]);

  return (
    <>
      {hrmEngine && (
      <View style={{flexDirection: 'row', flex: 1}}>
        <View style={{flexDirection: 'column', flexBasis: 0, flexGrow: 1, flexShrink: 1, paddingLeft: 8, paddingRight: 8}}>
          <View style={{flex:0, flexDirection:'row'}}>
            <ComponentButton title="-5" onPress={()=>delta(-5)} onLongPress={()=>{}} />
            <ComponentButton title="-1" onPress={()=>delta(-1)} onLongPress={()=>{}} />
            <ComponentButton title="+1" onPress={()=>delta(1)} onLongPress={()=>{}} />
            <ComponentButton title="+5" onPress={()=>delta(5)} onLongPress={()=>{}} />
          </View>

          <ComponentKeyValue keyStyle={textStyle} valueStyle={valueStyle} keyTitle={"Target bpm"} valueTitle={targetBpm.toFixed(0) + "bpm"} />
          <ComponentKeyValue keyStyle={textStyle} valueStyle={valueStyle} keyTitle={"Target W"} valueTitle={lastTargetPower.toFixed(0) + "W"} />
          <ComponentKeyValue keyStyle={textStyle} valueStyle={valueStyle} keyTitle={"Target %W"} valueTitle={lastTargetHandicap.toFixed(0) + "%"} />
        </View>
        <GCanvasView style={{flexBasis: 0, flexGrow: 1, flexShrink: 1}}
                     onCanvasCreate={initCanvas}
                     onIsReady={canvasIsReady} />
      </View>
      )}
      
      {!hrmEngine && (<>
        <Text>You need nonzero power (last: {lastPower && lastPower.value.toFixed(0)}W) and heartrate under 180 (last: {lastBpm && lastBpm.value.toFixed(0)}) to get started</Text>
      </>)}
    </>
  );
};

export default ScreenHrmControl;
