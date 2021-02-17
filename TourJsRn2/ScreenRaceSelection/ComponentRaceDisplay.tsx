import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  NativeModules,
  Platform,
  findNodeHandle,
} from 'react-native';
import { RaceState } from '../common/RaceState';
import {GCanvasView, GImage} from '@flyskywhy/react-native-gcanvas';
import { CanvasRenderingContext2D } from 'react-native-canvas';
import { doPaintFrameStateUpdates, paintCanvasFrame, PaintFrameState } from '../common/drawing';
import { DecorationFactory } from '../common/DecorationFactory';
import { DecorationState } from '../common/DecorationState';
import { defaultThemeConfig } from '../common/drawing-constants';
import { ReactDecorationFactory } from '../common/DecorationFactoryReact';
import { assert2 } from '../common/Utils';
import { WebDecorationFactory } from '../common/DecorationFactoryWeb';

let animRequest:number|null = null;

const ComponentRaceDisplay = (props:{raceState:RaceState}) => {

  let [canvas, setCanvas] = useState<GCanvasView|null>(null);
  let [ctx, setCtx] = useState<CanvasRenderingContext2D|null>(null);
  let [canvasReady, setCanvasReady] = useState<boolean>(false);
  
  let [decorationFactory, setDecorationFactory] = useState<DecorationFactory<GImage,CanvasRenderingContext2D>|null>(null);
  let [decorationState, setDecorationState] = useState<DecorationState<GImage, any>|null>();
  let [paintState, setPaintState] = useState<PaintFrameState>(new PaintFrameState());


  let initCanvas = (canvas) => {
    setCanvas(canvas);
  }
  let canvasIsReady = (a,b,c,d) => {
    console.log("ComponentRaceDisplay canvas is ready");
    const ctx = (canvas.getContext('2d'));
    setCtx(ctx);
    setCanvasReady(true);

    const fnMakeImage = () => {
      return new GImage();
    };
    const decorationFactory = new WebDecorationFactory<GImage,CanvasRenderingContext2D>('https://www.tourjs.ca/', defaultThemeConfig, fnMakeImage);
    setDecorationFactory(decorationFactory);
    setDecorationState(new DecorationState<GImage, any>(props.raceState.getMap(), decorationFactory, fnMakeImage));
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
      cancelAnimationFrame(animRequest);
      animRequest = null;
    }

    if(canvas && canvasReady && ctx && animRequest === null && decorationState !== null) {
      
      let lastTime = 0;
      let frame = 0;
      const handleAnimationFrame = (time:number, canvas:GCanvasView, ctx:CanvasRenderingContext2D, raceState:RaceState, decorationState:DecorationState<GImage, any>, paintState:PaintFrameState) => {
        frame++;
        if(props.raceState) {
          
          let dt = 0;
          if(lastTime) {
            dt = (time - lastTime) / 1000.0;
          }
          lastTime = time;

          const tmNow = new Date().getTime();
          props.raceState.tick(tmNow);

          const frameMod = 1;
          if(frame % frameMod == 0) {
            doPaintFrameStateUpdates("./data/", tmNow, dt*frameMod, props.raceState, paintState, ()=>new GImage());
          }

          if(decorationState) {
            paintCanvasFrame<GImage, any>(canvas, ctx, props.raceState, time, decorationState, dt, paintState);
          }

          if(animRequest !== null) {
            animRequest = requestAnimationFrame((newTime:number) => handleAnimationFrame(newTime, canvas, ctx, props.raceState, decorationState, paintState));
          }
        } else {
          throw new Error("No race state available?");
        }

      }

      animRequest = requestAnimationFrame((time) => handleAnimationFrame(time, canvas, ctx as any, props.raceState, decorationState as any, paintState));
      
    }
  }, [canvas, canvasReady, ctx, props.raceState, paintState, decorationState, decorationFactory]);
  
  return (
    <>
      <GCanvasView style={{flexBasis: 0, flexGrow: 1, flexShrink: 1}}
                  onCanvasCreate={initCanvas}
                  onIsReady={canvasIsReady} />
    </>
  );
};

export default ComponentRaceDisplay;
