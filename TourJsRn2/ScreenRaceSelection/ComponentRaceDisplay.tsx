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
import { doPaintFrameStateUpdates, paintCanvasFrame, PaintFrameState } from '../common/drawing';
import { DecorationFactory } from '../common/DecorationFactory';
import { DecorationState } from '../common/DecorationState';
import { defaultThemeConfig } from '../common/drawing-constants';
import { ReactDecorationFactory } from '../common/DecorationFactoryReact';

let animRequest:number|null = null;

const ComponentRaceDisplay = (props:{raceState:RaceState}) => {

  let [canvas, setCanvas] = useState<GCanvasView|null>(null);
  let [ctx, setCtx] = useState<any>(null);
  let [canvasReady, setCanvasReady] = useState<boolean>(false);
  
  let [decorationFactory, setDecorationFactory] = useState<DecorationFactory<GImage,any>>(new ReactDecorationFactory(defaultThemeConfig));
  let [decorationState, setDecorationState] = useState<DecorationState<GImage, any>>(new DecorationState<GImage, any>(props.raceState.getMap(), decorationFactory, ()=>new GImage()));
  let [paintState, setPaintState] = useState<PaintFrameState>(new PaintFrameState());

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
      
      let lastTime = 0;
      let frame = 0;
      const handleAnimationFrame = (time:number) => {
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
          paintCanvasFrame<GImage, any>(canvas, ctx, props.raceState, time, decorationState, dt, paintState);

          if(animRequest !== null) {
            animRequest = requestAnimationFrame(handleAnimationFrame);
          }
        } else {
          throw new Error("No race state available?");
        }

      }

      requestAnimationFrame(handleAnimationFrame);
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
