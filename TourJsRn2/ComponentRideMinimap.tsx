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
import { RideMapElevationOnly } from './common/RideMap';
import {GCanvasView, GImage} from '@flyskywhy/react-native-gcanvas';
import { drawMinimap } from './common/drawing';

const ComponentRideMinimap = (props:{elevs:RideMapElevationOnly}) => {

  let [canvas, setCanvas] = useState<GCanvasView|null>(null);
  let [ctx, setCtx] = useState<any>(null);
  let [canvasReady, setCanvasReady] = useState<boolean>(false);

  const paintFrame = () => {
    


    if(canvas && canvasReady && ctx) {
      
      const elevations:number[] = [];
      const len = props.elevs.getLength();
      for(var pct = 0; pct <= 1.0; pct += 0.005) {
        elevations.push(props.elevs.getElevationAtDistance(pct*len));
      }
      
      drawMinimap({ ctx, 
        elevations,
        w: canvas.width, 
        h: canvas.height, 
        minElevSpan: props.elevs.getLength()*0.01,})
    }
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
    if(canvas && canvasReady && ctx) {
      paintFrame();
    }
  }, [canvas, canvasReady, ctx, props.elevs]);

  return (
    <>
      <GCanvasView style={{flexBasis: 0, flexGrow: 1, flexShrink: 1}}
                     onCanvasCreate={initCanvas}
                     onIsReady={canvasIsReady} />
    </>
  );
};

export default ComponentRideMinimap;
