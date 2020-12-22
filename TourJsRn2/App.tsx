/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

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

const Orientation = require('react-native-orientation');
const Stack = createStackNavigator();

import ScreenDeviceSetup from './ScreenDeviceSetup';
import ScreenHome from './ScreenHome';
import ScreenPlayerSetup from './ScreenPlayerSetup';
import ScreenHrmControl from './ScreenHrmControl';
import ManagerBluetooth from './ManagerBluetooth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenLoading from './ScreenLoading';

enum LoadingStatus {
  LoadingData,
  NoData,
  Loaded,
}

export interface StoredData {
  name:string;
  handicap:number;
  rawPictureBase64:string;
}


const App = () => {

  useEffect(() => {
    Orientation.lockToLandscape();
  }, []);

  let [loadingStatus, setLoadingStatus] = useState<LoadingStatus>(LoadingStatus.LoadingData);
  let [storedData, setStoredData] = useState<StoredData|null>(null);
  useEffect(() => {
    AsyncStorage.getItem('app.tsx/stored-data').then((data:string|null) => {
      if(data) {
        try {
            const parsed = JSON.parse(data);
            setStoredData(parsed);
            setLoadingStatus(LoadingStatus.Loaded);
        } catch(e) {
          setLoadingStatus(LoadingStatus.NoData);
        }
      } else {
        setLoadingStatus(LoadingStatus.NoData);
      }
    }, (noData) => {
      setLoadingStatus(LoadingStatus.NoData);
    })
  }, []);

  const screenHome = (
    <Stack.Screen
      name="ScreenHome"
      component={ScreenHome}
      options={{ title: 'Welcome' }}
    />
  )
  const screenPlayerSetup = (
    <Stack.Screen
      name="ScreenPlayerSetup"
      component={ScreenPlayerSetup}
      options={{ title: 'Player Setup' }}
    />
  )
  const hrmControl = (
    <Stack.Screen
      name="ScreenHrmControl"
      component={ScreenHrmControl}
      options={{ title: 'Player Setup' }}
    />
  )
  const screenLoading = (
    <Stack.Screen
      name="ScreenLoading"
      component={ScreenLoading}
      options={{ title: 'Loading...' }}
    />
  )

  function getScreensToShow() {
    switch(loadingStatus) {
      case LoadingStatus.NoData:
        return ([screenPlayerSetup]);
      case LoadingStatus.Loaded:
        return ([screenHome, screenPlayerSetup, hrmControl]);
      case LoadingStatus.LoadingData:
        return ([screenLoading]);
      default:
        debugger;
    }
  }
  const screensToShow = getScreensToShow();

  return (
    <>
      <StatusBar barStyle="dark-content" hidden={true} />
      <NavigationContainer>
        <ManagerBluetooth>
          <Stack.Navigator headerMode="none">
            {screensToShow}
          </Stack.Navigator>
        </ManagerBluetooth>
      </NavigationContainer>
    </>
  );
};

export default App;
