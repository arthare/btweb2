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

const ComponentKeyValue = (props:{containerStyle?:any, keyStyle:any, valueStyle:any, keyTitle:string, valueTitle:string}) => {

  const containerStyle = {
    flexDirection: 'row' as any,
    width: '100%',
    borderWidth: 1,
    
    ...props.containerStyle,
  }
  const keyStyle = {
    ...props.keyStyle,
    flexGrow: 0,
    flexShrink: 0,
    height: '100%',
    justifyContent: 'center' as any,
  }
  const valueStyle = {
    ...props.valueStyle,
    flexGrow: 1,
    flexShrink: 1,
    textAlign: 'right' as any,
    justifyContent: 'center' as any,
  }

  return (
    <View style={containerStyle}>
      <Text style={keyStyle}>{props.keyTitle}</Text>
      <Text style={valueStyle}>{props.valueTitle}</Text>
    </View>
  );
};

export default ComponentKeyValue;
