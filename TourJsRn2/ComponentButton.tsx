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
} from 'react-native';

const ComponentButton = (props:{title:string, onPress:any}) => {

  const style = {
    justifyContent: 'center' as any,
    margin: 8,
    borderWidth: 1,
    padding: 8,
  }

  return (
    <TouchableOpacity style={style} onPress={props.onPress}>
      <Text>{props.title}</Text>
    </TouchableOpacity>
  );
};

export default ComponentButton;
