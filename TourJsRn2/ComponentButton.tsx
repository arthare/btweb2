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

const ComponentButton = (props:{title:string, onPress:any, onLongPress:any}) => {

  const style = {
    justifyContent: 'center' as any,
    margin: 8,
    borderWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 8,
    paddingRight: 8,
    backgroundColor: '#3498db',

    shadowColor: '#2a2a2a',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    minWidth: 70,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
    borderRadius: 8,
  }

  const textStyle = {
    color: 'white',
    fontSize: 18,
  }

  let [tmStart, setTmStart] = useState(0);
  let [beenTooLong, setBeenTooLong] = useState(false);
  let [longPressTimeout, setLongPressTimeout] = useState<any>(0);

  // this is lame!  but I found that TouchableOpacity would only get set up to do one of onPress or onLongPress, not both.  So I made my own.
  const startPress = () =>{
    setTmStart(new Date().getTime());
    setBeenTooLong(false);

    setLongPressTimeout(setTimeout(() => {
      console.log("been too long");
      setBeenTooLong(true);
    }, 2000));
  }
  const endPress = (forceLong?:boolean) => {
    const tmNow = new Date().getTime();
    const elapsed = tmNow - tmStart;
    console.log("elapsed: ", elapsed, tmNow, tmStart);

    if(tmStart < 0) {
      // this press is already handled;
      return;
    }
    clearTimeout(longPressTimeout);
    setLongPressTimeout(null);
    if(elapsed > 750 || forceLong) {
      console.log("it's a long press!", forceLong);
      props.onLongPress();
    } else {
      console.log("it's a short press!");
      props.onPress();
    }
    setBeenTooLong(false);
    setTmStart(-1);
  }
  useEffect(() => {
    // if it's been too long, then we call!
    if(tmStart >= 0 && beenTooLong) {
      
      endPress(true);
    }
  }, [tmStart, beenTooLong]);

  return (
    <TouchableOpacity style={style} onPressIn={startPress} onPressOut={() => endPress(false)}>
      <Text style={textStyle}>{props.title}</Text>
    </TouchableOpacity>
  );
};

export default ComponentButton;
