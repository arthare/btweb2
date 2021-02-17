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
import WebView from 'react-native-webview';
import { SimpleElevationMap } from './common/communication';
import { RaceState } from './common/RaceState';
import { ServerUserProvider } from './common/ServerGame';
import { User, UserTypeFlags } from './common/User';
import ComponentRaceDisplay from './ScreenRaceSelection/ComponentRaceDisplay';

class FakeUserProvider {
  _users:User[] = [];
  _localUser:User;
  constructor() {
    for(var x = 0; x < 10; x++) {
      const user = new User(`User ${x}`, 80, 300, UserTypeFlags.Ai | UserTypeFlags.Remote)
      user.setId(x+1);
      user.notifyPower(new Date().getTime(), 300);
      this._users.push(user)
    }
    const localUser = new User(`Local User`, 80, 300, UserTypeFlags.Local);
    localUser.setId(11);
    this._localUser = localUser;
    this._users.push(localUser);
  }
  getUsers(tmNow:number):User[] {
    return this._users;
  }
  getUser(id:number):User|null {
    return this._users.find((user) => user.getId() === id) || null;
  }
  getLocalUser():User|null {
    return this._localUser;
  }
}

const BoilerPlate = () => {


  const map = new SimpleElevationMap([1,5,2,6,1], 1000);
  const userProvider = new FakeUserProvider();
  let [raceState, setRaceState] = useState(new RaceState(map, userProvider, "Fake Race"));

  const debugging = `
  // Debug
  console = new Object();
  console.log = function(log) {
    window.ReactNativeWebView.postMessage("console", log);
  };
  console.debug = console.log;
  console.info = console.log;
  console.warn = console.log;
  console.error = console.log;
  `;

  const onMessage = (...args) => {
    console.log("onMessage!");
    console.log.apply(this, args);
  }
  return (
    <>
      <WebView injectedJavaScript={debugging}
               style={{backgroundColor: 'green', width: '100%', height: '100%'}} 
               onMessage={onMessage}
               source={{uri:"https://www.tourjs.ca/test-hacks"}} />
    </>
  );
};

export default BoilerPlate;
