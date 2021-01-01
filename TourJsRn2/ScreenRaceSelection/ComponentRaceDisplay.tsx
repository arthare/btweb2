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
} from 'react-native';
import { RaceState } from '../common/RaceState';
import {GCanvasView, GImage} from '@flyskywhy/react-native-gcanvas';
import { CanvasRenderingContext2D } from 'react-native-canvas';

let animRequest:number|null = null;

const paintFrame = (raceState:RaceState, canvas:GCanvasView, canvasReady:boolean, ctx:CanvasRenderingContext2D) => {
  console.log("painting frame");
  ctx.fillStyle = Math.random() > 0.5 ? 'red' : 'green';
  ctx.fillRect(0,0,100,100);



  // if our frame-drawing sequence hasn't been canceled, then run it again!
  if(animRequest !== null) {
    animRequest = requestAnimationFrame(() => paintFrame(raceState, canvas, canvasReady, ctx));
  }
}

const ComponentRaceDisplay = (props:{raceState:RaceState}) => {

  let [canvas, setCanvas] = useState<GCanvasView|null>(null);
  let [ctx, setCtx] = useState<any>(null);
  let [canvasReady, setCanvasReady] = useState<boolean>(false);
  
  let initCanvas = (canvas) => {
    setCanvas(canvas);
  }
  let canvasIsReady = (a,b,c,d) => {
    const ctx = (canvas.getContext('2d'));
    setCtx(ctx);
    setCanvasReady(true);
  }

  useEffect(() => {
    
    return function cleanup() {
      if(animRequest !== null) {
        cancelAnimationFrame(animRequest as any);
        animRequest = null;
      }
    }
  }, []);

  useEffect(() => {
    // something that materially affects the animation has changed.
    // need to cancel current animation sequence and start a new one with a fresh closure
    if(animRequest !== null) {
      // cancel the old one
      console.log("canceling old animation sequence");
      cancelAnimationFrame(animRequest);
      animRequest = null;
    }

    if(canvas && canvasReady && ctx && animRequest === null) {
      animRequest = requestAnimationFrame(() => paintFrame(props.raceState, canvas, canvasReady, ctx));
    }
  }, [canvas, canvasReady, ctx, props.raceState]);

  return (
    <>
      <GCanvasView style={{flexBasis: 0, flexGrow: 1, flexShrink: 1}}
                  onCanvasCreate={initCanvas}
                  onIsReady={canvasIsReady} />
    </>
  );
};

export default ComponentRaceDisplay;
