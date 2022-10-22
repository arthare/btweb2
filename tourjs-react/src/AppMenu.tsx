import React, { useContext, useEffect, useState } from 'react';
import logo from './logo.svg';
import './AppMenu.scss';
import { useAuth0 } from "@auth0/auth0-react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { AppAuthContextInstance, AppPlayerContextInstance } from "./index-contextLoaders";
import UserProfileMini from './Components/UserProfileMini';
import { TourJsAlias } from './tourjs-shared/signin-types';
import { AppAuthContextType } from './ContextAuth';
import { secureApiPost } from './tourjs-client-shared/api-get';
import UserProfilePicker from './Components/UserProfilePicker';
import RacePicker from './Components/RacePicker';
import { ServerHttpGameListElement } from './tourjs-shared/communication';
import { AppPlayerContextType } from './ContextPlayer';
import PowerDevicePicker from './Components/PowerDevicePicker';
import { RaceScheduler } from './Components/RaceScheduler';
import NoBleHelper from './Components/NoBleHelper';


function App() {
  const navigate = useNavigate();

  const authContext = useContext<AppAuthContextType|null>(AppAuthContextInstance);
  const playerContext = useContext<AppPlayerContextType|null>(AppPlayerContextInstance);
  const auth0 = useAuth0();

  const [authState, setAuthState] = authContext.gate(auth0, useState, useEffect, navigate);
  const [deviceReady, setDeviceReady] = useState<boolean>(false);
  const [playerReady, setPlayerReady] = useState<boolean>(false);
  const [raceListVersion, setRaceListVersion] = useState<number>(0);
  

  const onRefreshUser = () => {
    authContext.refreshAliases(auth0, setAuthState);

    setPlayerReady(!!authContext.getSelectedAlias());
  }
  const onPickRace = (race:ServerHttpGameListElement) => {
    navigate(`/race/${ race.gameId}`);
  }
  const onNewRaceCreated = () => {
    setRaceListVersion(raceListVersion+1);
  }

  useEffect(() => {
    const handleDeviceChange = () => {
      console.log("device change!");
      setDeviceReady(!!playerContext.powerDevice);
    }
    if(playerContext) {
      playerContext.on('deviceChange', handleDeviceChange);
    }

    return function cleanup() {
      playerContext.off('deviceChange', handleDeviceChange);
    }
  }, [playerContext])

  useEffect(() => {
    if(window.location.host === 'www.tourjs.ca' || window.location.protocol !== 'https:') {
      window.location.href = 'https://tourjs.ca';
    }
  }, []);

  return (
    <div className="AppMenu__Container">
      <h3>Wheels With Friends</h3>
      {authContext && playerContext && (<>
        <NoBleHelper />
        <UserProfilePicker playerContext={playerContext} authContext={authContext} auth0={auth0} authState={authState} fnOnChangeUser={() => onRefreshUser()}/>
        <PowerDevicePicker playerContext={playerContext} authContext={authContext} />
        <RacePicker fnOnPickRace={(race:ServerHttpGameListElement) => onPickRace(race)} allowSelection={!!playerContext.powerDevice} raceListRefresher={raceListVersion} />
        <RaceScheduler authState={authState} fnOnCreation={()=>onNewRaceCreated()} />
        
      </>)}
    </div>
  );
}

export default App;
