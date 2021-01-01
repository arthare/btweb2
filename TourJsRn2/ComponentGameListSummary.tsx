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
import { ServerHttpGameListElement } from './common/communication';
import { RideMapElevationOnly } from './common/RideMap';
import { formatSecondsHms } from './common/Utils';
import ComponentButton from './ComponentButton';
import ComponentKeyValue from './ComponentKeyValue';
import ComponentRideMinimap from './ComponentRideMinimap';
import { SimpleElevationMap } from './common/communication';

const ComponentGameListSummary = (props:{race:ServerHttpGameListElement, onSelect:(which:ServerHttpGameListElement)=>{}}) => {

  const containerStyle = {
    height: '100%',
    borderWidth: 2,
    borderColor: 'black',
    width: '30%',
    paddingTop: 8,
  }

  const keyValueContainerStyle = {
    borderWidth: 1,
    borderColor: 'lightgrey',
  }
  const keyStyle = {
    fontWeight: 'bold',
    padding: 4,
    borderWidth: 0,
  }
  const valueStyle = {
    padding: 4,
    borderWidth: 0,
  }

  const lengthKm:string = (props.race.lengthMeters / 1000).toFixed(1) + 'km';
  const currentRiders:string = `${props.race.whoIn.length} humans, ${props.race.whoInAi.length} AIs`;
  let status:string = '';
  const tmNow = new Date().getTime();
  if(props.race.tmScheduledStart > tmNow) {
    // starting in the future
    const sUntil = (props.race.tmScheduledStart - tmNow) / 1000;
    status = `Starting in ${formatSecondsHms(sUntil)}`;
  } else {
    console.log("tmActualStart = ", props.race);
    if(props.race.tmActualStart > 0) {
      const sAgo = tmNow - (props.race.tmActualStart / 1000);
      
      if(sAgo > 0) {
        status = `Started ${formatSecondsHms(sAgo)} ago`;
      } else {
        // scheduled to start right about now, but we don't have the actual start time yet
        status = `Starting...`;
      }
    } else {
      status = `Starting...`;
    }
  }

  const elevationSupplier:RideMapElevationOnly = new SimpleElevationMap(props.race.elevations, props.race.lengthMeters);

  return (
    <View style={containerStyle}>
      <ComponentKeyValue containerStyle={keyValueContainerStyle} keyTitle="Name" keyStyle={keyStyle} valueTitle={props.race.displayName} valueStyle={valueStyle}></ComponentKeyValue>
      <ComponentKeyValue containerStyle={keyValueContainerStyle} keyTitle="Length" keyStyle={keyStyle} valueTitle={lengthKm} valueStyle={valueStyle}></ComponentKeyValue>
      <ComponentKeyValue containerStyle={keyValueContainerStyle} keyTitle="Current Riders" keyStyle={keyStyle} valueTitle={currentRiders} valueStyle={valueStyle}></ComponentKeyValue>
      <ComponentKeyValue containerStyle={keyValueContainerStyle} keyTitle="Status" keyStyle={keyStyle} valueTitle={status} valueStyle={valueStyle}></ComponentKeyValue>
      <ComponentRideMinimap elevs={elevationSupplier} />
      <ComponentButton title="Join" onPress={() => props.onSelect(props.race)} onLongPress={() => props.onSelect(props.race)} />
    </View>
  );
};

export default ComponentGameListSummary;
