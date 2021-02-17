import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useContext, useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';
import ComponentImageButton from './ComponentImageButton';
import { SensorReading, TrainerSensorReading } from './ComponentPlayerSetup';
import { DeviceContextInstance } from './ManagerBluetooth';

const imageMechHeart = require('./data/mech-heart.png');
const imageRaceMode = require('./data/race.jpg');

const ScreenHome = (props:{navigation:any}) => {

  const deviceCtx = useContext(DeviceContextInstance);
  
  let [lastPower, setLastPower] = useState<SensorReading|null>(null);
  let [lastTrainer, setLastTrainer] = useState<TrainerSensorReading|null>(null);
  let [lastHrm, setLastHrm] = useState<SensorReading|null>(null);

  useEffect(() => {
    // setting up listeners to incoming player data
    deviceCtx.addEventListener('power', setLastPower);
    deviceCtx.addEventListener('hrm', setLastHrm);
    deviceCtx.addEventListener('trainer', setLastTrainer);

    return function cleanup() {
      deviceCtx.removeEventListener('power', setLastPower);
      deviceCtx.removeEventListener('hrm', setLastHrm);
      deviceCtx.removeEventListener('trainer', setLastTrainer);
    }
  }, []);

  const rootStyle = {
    flex: 1,
    flexDirection: "row",
  } as any
  const buttonStyle = {
    flex: 1.0,
    backgroundColor: 'red',
  }
  
  const raceStyle = {
    ...buttonStyle,
    backgroundColor: 'lightgreen',
  }
  const hrmStyle = {
    ...buttonStyle,
  }

  const onHrmControl = () => {
    props.navigation.navigate('ScreenHrmControl', {name: 'HRM Control'});
  }
  const onRaceMode = () => {
    props.navigation.navigate('ScreenRaceSelection', {name: 'Racing'});
  }

  const tmNow = new Date().getTime();
  const enableHrmMode = lastHrm && lastTrainer && (tmNow - lastHrm.tm) < 3000 && (tmNow - lastTrainer.tm) < 3000;
  let disableHrmReason = '';
  if(!enableHrmMode) {
    disableHrmReason = "You need a HRM and Smart Trainer device";
  }
  const enableRaceMode = lastPower && (tmNow - lastPower.tm) < 3000;
  let disableRaceReason = '';
  if(!enableRaceMode) {
    disableRaceReason = "You need a Power device";
  }

  return (
    <>
      <View style={rootStyle}>

        <ComponentImageButton title="Heart Rate Mode" 
                              imageSource={imageMechHeart} 
                              style={hrmStyle} 
                              resizeMode="contain" 
                              enabled={!!enableHrmMode}
                              disableReason={disableHrmReason}
                              onPress={onHrmControl} />

      </View>
    </>
  );
};

export default ScreenHome;
