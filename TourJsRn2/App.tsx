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

const App = () => {

  useEffect(() => {
    Orientation.lockToLandscape();
  }, []);

  

  return (
    <>
      <StatusBar barStyle="dark-content" hidden={true} />
      <NavigationContainer>
        <ManagerBluetooth>
          <Stack.Navigator headerMode="none">
            <Stack.Screen
              name="ScreenHome"
              component={ScreenHome}
              options={{ title: 'Welcome' }}
            />
            <Stack.Screen
              name="ScreenDeviceSetup"
              component={ScreenDeviceSetup}
              options={{ title: 'Device Setup' }}
            />
            <Stack.Screen
              name="ScreenPlayerSetup"
              component={ScreenPlayerSetup}
              options={{ title: 'Player Setup' }}
            />
            <Stack.Screen
              name="ScreenHrmControl"
              component={ScreenHrmControl}
              options={{ title: 'Player Setup' }}
            />
          </Stack.Navigator>
        </ManagerBluetooth>
      </NavigationContainer>
    </>
  );
};

export default App;
