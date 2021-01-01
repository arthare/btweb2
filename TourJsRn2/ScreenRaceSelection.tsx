import { Link, NavigationContainer } from '@react-navigation/native';
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
import { apiGetInternal, ServerHttpGameList, ServerHttpGameListElement } from './common/communication';
import ComponentGameListSummary from './ComponentGameListSummary';
import ComponentRacePicker from './ScreenRaceSelection/ComponentRacePicker';
import ComponentRaceScreen from './ScreenRaceSelection/ComponentRaceScreen';

const ScreenRaceSelection = () => {

  let [selectedRace, setSelectedRace] = useState<ServerHttpGameListElement|null>(null);


  const pickRace = (race:ServerHttpGameListElement) => {
    // they want to go tracing!
    setSelectedRace(race);
  }

  return (
    <>
      {!selectedRace && <ComponentRacePicker onPickRace={pickRace} />}
      {selectedRace && <ComponentRaceScreen race={selectedRace} />}
      
    </>
  );
};

export default ScreenRaceSelection;
