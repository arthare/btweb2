import React, { MutableRefObject, RefObject, useContext, useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import './AppTestHacks.scss';
import { Auth0ContextInterface, useAuth0 } from "@auth0/auth0-react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { Auth0Client, User } from '@auth0/auth0-spa-js';
import { FakeUserProvider, setupRace } from './UtilsGameStarter';
import { request } from 'https';
import { ServerMapDescription } from './tourjs-shared/communication';
import { RaceState } from './tourjs-shared/RaceState';
import { PureCosineMap } from './tourjs-shared/RideMap';
import { RideMapHandicap } from './tourjs-shared/RideMapHandicap';
import { createDrawer } from './tourjs-client-shared/drawing-factory';
import { DecorationState } from './tourjs-client-shared/DecorationState';
import { DecorationFactory, randRange } from './tourjs-client-shared/DecorationFactory';
import { defaultThemeConfig } from './tourjs-client-shared/drawing-constants';
import { DrawingInterface, PaintFrameState } from './tourjs-client-shared/drawing-interface';
import { tickGameAnimationFrame } from './AppRace';
import InRaceView from './Components/InRaceView';
import PreRaceView from './Components/PreRaceView';
import { AppPlayerContextType } from './ContextPlayer';
import { AppPlayerContextInstance } from './index-contextLoaders';
import { networkInterfaces } from 'os';

export function useBounceSignin(auth0:Auth0ContextInterface<User>, useEffect:any, navigate:any) {
  useEffect(() => {
    if(!auth0.isLoading) {
      if(!auth0.isAuthenticated) {
        // done loading, not authenticated, goodbye
        navigate('/');
      }
    }
  }, [auth0.isLoading])
}





function AppLobbyHacks() {
  const auth0 = useAuth0();
  const navigate = useNavigate();

  useBounceSignin(auth0, useEffect, navigate);

  let [raceState, setRaceState] = useState<RaceState|null>(null);
  let [tmFakeStart, setTmFakeStart] = useState<number>(new Date().getTime() + 3600*1000)
  const playerContext = useContext<AppPlayerContextType>(AppPlayerContextInstance);
  

  const fnOnRaceDone = () => {
    alert("The race is done!");
  }

  useEffect(() => {
    // startup: let's get our game state up and running
    const fnMakeMap = async () =>  new RideMapHandicap(new ServerMapDescription(new PureCosineMap(5000)));
    const fnMakeUserProvider = async () => new FakeUserProvider(null);

    setupRace(fnMakeMap, fnMakeUserProvider, "Test-Hacks Race").then((newRaceState) => {
      playerContext.setLocalUser(newRaceState.getLocalUser());
      setRaceState(newRaceState);
    })

  }, []);

  useEffect(()  => {
    if(raceState) {
      
      let int  = setInterval(() => {
        let tmNow = new Date().getTime();
        const users = raceState.getUserProvider().getUsers(tmNow);
        for(var user of users) {
          user.notifyPower(tmNow, Math.random() * 250);
        }
      }, 250);

      return function cleanup() {
        clearInterval(int);
      }
    }
  }, [raceState]);

  return (
    <div className="AppTestHacks__Container">
      <div className="AppTestHacks__GameContainer">
        {raceState && <PreRaceView playerContext={playerContext} tmStart={tmFakeStart} raceState={raceState}/>}
        {!raceState && <div>Setting up race state</div>}
      </div>
    </div>
  );
}

export default AppLobbyHacks;
