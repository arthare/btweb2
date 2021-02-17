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
import { apiGetInternal, ServerHttpGameList, ServerHttpGameListElement } from '../common/communication';
import ComponentGameListSummary from '../ComponentGameListSummary';

const ComponentRacePicker = (props:{onPickRace:(which:ServerHttpGameListElement)=>any}) => {
  let [loading, setLoading] = useState(true);
  let [races, setRaces] = useState<ServerHttpGameList|null>(null);

  const linkStyle = {
    color: 'blue',
    textDecoration: 'underline' as any,
  }
  
  useEffect(() => {
    // let's ask the server where da races at?
    apiGetInternal('https://tourjs.ca/tourjs-api', 'race-list').then((result:ServerHttpGameList) => {
      setRaces(result);
    }).finally(() => {
      setLoading(false);
    })
  }, []);
  
  return (
    <>
      {loading && (
        <>
          <Text>Loading...</Text>
        </>
      )}
      {!loading && !races /* error loading races */ &&  (
        <>
          <Text>Error loading races</Text>
        </>
      )}
      {!loading && races && races.races.length > 0 /* nonzero # of races loaded */ && (
        <ScrollView horizontal={false}>
          {races.races.map((race:ServerHttpGameListElement, index) => {
            return (<ComponentGameListSummary key={index} race={race} onSelect={() => props.onPickRace(race)}/>);
          })}
        </ScrollView>
      )}
      {!loading && races && races.races.length <= 0 /* loading successful, but no races loaded */ && (
        <>
          <Text>Unfortunately, no upcoming races were found.</Text>
          <Text style={linkStyle}>Create One Online</Text>
        </>
      )}
    </>
  );
};

export default ComponentRacePicker;
