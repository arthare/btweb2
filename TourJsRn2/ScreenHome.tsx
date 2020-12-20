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

const BoilerPlate = (props:{navigation:any}) => {

  const rootStyle = {
    flex: 1,
    flexDirection: "row",
  } as any
  const buttonStyle = {
    flex: 1.0/3.0,
    backgroundColor: 'red',
  }
  
  const deviceSetupStyle = {
    ...buttonStyle,
    backgroundColor: 'green',
  }
  const playerSetupStyle = {
    ...buttonStyle,
    backgroundColor: 'yellow',
  }
  const hrmStyle = {
    ...buttonStyle,
    backgroundColor: 'blue',
  }

  const onDeviceSetup = () => {
    props.navigation.navigate('ScreenDeviceSetup', {name: 'Device Setup'});
  }
  const onPlayerSetup = () => {
    props.navigation.navigate('ScreenPlayerSetup', {name: 'Player Setup'});
  }
  const onHrmControl = () => {
    props.navigation.navigate('ScreenHrmControl', {name: 'HRM Control'});
  }

  return (
    <>
      <View style={rootStyle}>

        <View style={deviceSetupStyle} onTouchEnd={onDeviceSetup}></View>
        <View style={playerSetupStyle} onTouchEnd={onPlayerSetup}></View>
        <View style={hrmStyle} onTouchEnd={onHrmControl}></View>

      </View>
    </>
  );
};

export default BoilerPlate;
