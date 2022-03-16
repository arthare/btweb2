import React, { useContext, useEffect, useState } from 'react';
import logo from './logo.svg';
import './AppLogin.scss';
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

function App() {
  const navigate = useNavigate();

  const authContext = useContext<AppAuthContextType|null>(AppAuthContextInstance);
  const playerContext = useContext<AppPlayerContextType|null>(AppPlayerContextInstance);
  const auth0 = useAuth0();

  const [authState, setAuthState] = authContext.gate(auth0, useState, useEffect, navigate);

  const onRefreshUser = () => {
    authContext.refreshAliases(auth0, setAuthState);
  }
  const onPickRace = (race:ServerHttpGameListElement) => {
    navigate(`/race/${ race.gameId}`);
  }

  return (
    <div className="App">
      <h3>Wheels With Friends</h3>
      {authContext && playerContext && (<>
        <UserProfilePicker playerContext={playerContext} authContext={authContext} auth0={auth0} authState={authState} fnOnChangeUser={() => onRefreshUser()}/>

        <RacePicker fnOnPickRace={(race:ServerHttpGameListElement) => onPickRace(race)}/>
      </>)}
    </div>
  );
}

export default App;
