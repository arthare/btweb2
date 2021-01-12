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
import ConnectionManager, { CurrentRaceState, S2CPositionUpdateUser, S2CRaceStateUpdate, ServerHttpGameListElement } from '../common/communication';
import { RaceState, UserProvider } from '../common/RaceState';
import { DEFAULT_HANDICAP_POWER, DEFAULT_RIDER_MASS, User, UserTypeFlags } from '../common/User';
import { formatSecondsHms } from '../common/Utils';
import { PlayerSetup, PlayerSetupInstance } from '../ComponentPlayerSetup';
import ComponentRaceDisplay from './ComponentRaceDisplay';

class ReactPlayerProvider implements UserProvider {

  usersHash:{[key:string]:User} = {};
  localUser:User;

  constructor(playerCtx:PlayerSetup) {
    const localUser = playerCtx.getLocalUser();

    this.usersHash = {};
    this.usersHash['' + localUser.getId()] = localUser;
    this.localUser = localUser;
  }

  getUsers(tmNow: number): User[] {
    return Object.keys(this.usersHash).map((id) => this.usersHash[id]);
  }
  getUser(id: number): User | null {
    return this.usersHash['' + id] || null;
  }
  getLocalUser(): User | null {
    return this.localUser;
  }

  addRemoteUser(pos:S2CPositionUpdateUser, image:string|null) {
    
    const tmNow = new Date().getTime();
    const newUser = new User("Unknown User " + pos.id, DEFAULT_RIDER_MASS, DEFAULT_HANDICAP_POWER, UserTypeFlags.Remote);
    if(image) {
      newUser.setImage(image, null);
    }
    newUser.setId(pos.id);
    newUser.absorbPositionUpdate(tmNow, pos);
    this.usersHash['' + pos.id] = newUser;
  }
  
}

const ComponentRaceScreen = (props:{race:ServerHttpGameListElement}) => {

  const playerCtx = useContext(PlayerSetupInstance);

  let [connectionManager, setConnectionManager] = useState<ConnectionManager|null>(null);
  let [userProvider, setUserProvider] = useState<ReactPlayerProvider|null>(null);
  let [raceState, setRaceState] = useState<RaceState|null>(null);
  let [networkUpdates, setNetworkUpdates] = useState<number>(0);
  let [currentRaceState, setCurrentRaceState] = useState<CurrentRaceState>(CurrentRaceState.PreRace);

  const onNewHandicap = (newFtp:number) => {
    
  }
  const onLastServerRaceStateChange = (connectionManager:ConnectionManager, raceState:RaceState|null, serverState:S2CRaceStateUpdate) => {
    setCurrentRaceState(serverState.state);
  }
  const notifyNewClient = (pos:S2CPositionUpdateUser, image:string|null) => {
    if(userProvider) {
      console.log("got a new remote user @ ", pos.distance);
      userProvider.addRemoteUser(pos, image);
    }
    
  }

  useEffect(() => {
    // gotta get connected
    const targetHost = `tourjs.ca`;
    let wsUrl = `wss://${targetHost}:8080`;

    const playerProvider = new ReactPlayerProvider(playerCtx);

    const connectionManager = new ConnectionManager(onNewHandicap, 
                                                    onLastServerRaceStateChange, 
                                                    setNetworkUpdates, 
                                                    notifyNewClient);
    setConnectionManager(connectionManager);
    connectionManager.connect(wsUrl,playerProvider,props.race.gameId,"Aint no account IDs here",playerCtx.getLocalUser()).then((raceState:RaceState) => {
      setRaceState(raceState);
    })
    setConnectionManager(connectionManager);

    return function cleanup() {
      
      if(connectionManager) {
        console.log("cleanup: disconnecting connection manager");
        connectionManager.disconnect();
      }
    }
  }, []);

  if(!connectionManager) {
    // haven't even started yet
    return (
      <>
        <Text>Starting connection to {props.race.displayName}</Text>
      </>
    );
  } else if(connectionManager && !raceState) {
    return (
      <>
        <Text>Connection request sent to {props.race.displayName}</Text>
      </>
    );
  } else if(connectionManager && raceState) {
    const tmNow = new Date().getTime();
    const msUntil = props.race.tmScheduledStart - tmNow;
    switch(currentRaceState) {
      case CurrentRaceState.PreRace:
        return (
          <>
            <Text>Connected to {props.race.displayName}, which starts in {formatSecondsHms(msUntil/1000)}</Text>
          </>
        )
        break;
      case CurrentRaceState.Racing:
        return (
          <>
            <ComponentRaceDisplay raceState={raceState} />
          </>
        )
        break;
      case CurrentRaceState.PostRace:
        return (
          <>
            <Text>Race is complete</Text>
          </>
        )
        break;
      default:
        return (
          <>
            <Text>Connecting...</Text>
          </>
        )
    }
  } else {
    return <><Text>Something weird happened</Text></>
  }
};

export default ComponentRaceScreen;
