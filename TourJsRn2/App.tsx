/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

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

const Orientation = require('react-native-orientation');
const Stack = createStackNavigator();

import ScreenHome from './ScreenHome';
import { PlayerSetup, PlayerSetupInstance } from './ComponentPlayerSetup';
import ScreenHrmControl from './ScreenHrmControl';
import ManagerBluetooth from './ManagerBluetooth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenLoading from './ScreenLoading';
import { navigationRef } from './RootNavigation';
import ComponentPlayerSetup from './ComponentPlayerSetup';
import { useKeepAwake } from '@sayem314/react-native-keep-awake';
import ScreenRaceSelection from './ScreenRaceSelection';

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

  let playerSetup = useContext(PlayerSetupInstance);

  let [loadingStatus, setLoadingStatus] = useState<LoadingStatus>(LoadingStatus.LoadingData);
  let [storedData, setStoredData] = useState<StoredData|null>(null);

  function checkLoadStatus() {
    AsyncStorage.getItem(PlayerSetup.PLAYER_DATA_KEY).then((data:string|null) => {
      console.log("checing player data ", data);
      if(data) {
        try {
          const parsed:StoredData = JSON.parse(data);
          playerSetup.setPlayerData(parsed.name, parsed.handicap, parsed.rawPictureBase64, true);
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
  }
  useEffect(() => {
    checkLoadStatus();

    playerSetup.on('playerDataChange', () => {
      console.log("app: player setup done", playerSetup.playerData);
      setStoredData(playerSetup.playerData);
    })
  }, []);



  const screenHome = (
    <Stack.Screen
      name="ScreenHome"
      key="ScreenHome"
      component={ScreenHome}
      options={{ title: 'Welcome' }}
    />
  )
  const hrmControl = (
    <Stack.Screen
      name="ScreenHrmControl"
      key="ScreenHrmControl"
      component={ScreenHrmControl}
      options={{ title: 'HRM Control' }}
    />
  )
  const raceSelection = (
    <Stack.Screen
      name="ScreenRaceSelection"
      key="ScreenRaceSelection"
      component={ScreenRaceSelection}
      options={{ title: 'Race Selection' }}
    />
  )
  const screenLoading = (
    <Stack.Screen
      name="ScreenLoading"
      key="ScreenLoading"
      component={ScreenLoading}
      options={{ title: 'Loading...' }}
    />
  )

  function getScreensToShow() {
    switch(loadingStatus) {
      case LoadingStatus.NoData:
        return ([screenHome]);
      case LoadingStatus.Loaded:
        return ([screenHome, hrmControl, raceSelection]);
      case LoadingStatus.LoadingData:
        return ([screenLoading]);
      default:
        debugger;
    }
  }

  const onDonePlayerSetup = () => {
    checkLoadStatus();
  }

  const screensToShow = getScreensToShow();

  useKeepAwake();

  return (
    <>
      <StatusBar barStyle="dark-content" hidden={true} />
      {loadingStatus !== LoadingStatus.Loaded && (
        <ComponentPlayerSetup onDone={onDonePlayerSetup} />
      )}
      {loadingStatus === LoadingStatus.Loaded && (
        <NavigationContainer ref={navigationRef}>
          <ManagerBluetooth>
            <Stack.Navigator headerMode="none">
              {screensToShow}
            </Stack.Navigator>
          </ManagerBluetooth>
        </NavigationContainer>
      )}
    </>
  );
};

export default App;
