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
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import { withSafeAreaInsets } from 'react-native-safe-area-context';
import { Normal, Grayscale } from 'react-native-color-matrix-image-filters';

const ComponentImageButton = (props:{style:any, imageSource:any, title:string, onPress:any, resizeMode:"contain"|"cover", enabled:boolean, disableReason:string}) => {


  const style = {
    ...props.style,
    justifyContent: 'center' as any,
    margin: 0,
    borderWidth: 1,
    padding: 0,
  }

  const imageStyle = {
    width: '100%',
    height: '100%',
    justifyContent: 'center' as any,
    padding: 0,
    margin: 0,
  }

  const textStyle = {
    color: 'white',
    fontSize: 36,
    textAlign: 'center' as any,
    textShadowColor: 'black',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 5,
    margin: 0,
  }

  const disabledTextStyle = {
    ...textStyle,
    fontSize: 24,
    fontStyle: 'italic' as any,
  }

  const textContainerStyle = {
    position: 'absolute' as any,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)' as any, 
    padding: 0, 
    margin: 0,
    flex: 1,
    flexDirection: 'column' as any,
  }

  return (
    <TouchableOpacity style={style} onPress={props.onPress} disabled={!props.enabled}>
      {props.enabled && (
        <Normal>
          <Image style={imageStyle} resizeMode={props.resizeMode} source={props.imageSource} />
        </Normal>
      ) || (
        <Grayscale>
          <Image style={imageStyle} resizeMode={props.resizeMode} source={props.imageSource} />
        </Grayscale>
      )}
      <View style={textContainerStyle}>
        <Text style={textStyle}>{props.title}</Text>
        {!props.enabled && (
          <Text style={disabledTextStyle}>{props.disableReason}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ComponentImageButton;
