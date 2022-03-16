import React, { MutableRefObject, RefObject, useEffect, useRef, useState } from 'react';
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


export function tickGameAnimationFrame(tmThisFrame:number, tmLastFrame:number, drawer:DrawingInterface, decorationState:DecorationState, paintState:PaintFrameState, ref:RefObject<HTMLCanvasElement>, raceState:RaceState, fnOnRaceDone:()=>void) {

  const tm = tmThisFrame;
  const dt = (tmThisFrame - tmLastFrame) / 1000;


  const localUser = raceState.getLocalUser();
  if(localUser) {
    localUser.notifyPower(tmThisFrame, localUser.getHandicap() * randRange(0.75, 1.25));
  }
  
  raceState.tick(tmThisFrame);

  if(ref.current) {
    drawer.paintCanvasFrame(ref.current, raceState, tm, decorationState, dt, paintState)
  }

  if(raceState.isAllRacersFinished(tm)) {
    // we're done.  no need for further action
    fnOnRaceDone();
  } else {
    requestAnimationFrame((tm) => tickGameAnimationFrame(tm, tmThisFrame, drawer, decorationState, paintState, ref, raceState, fnOnRaceDone));
  }
}



function App() {
  const auth0 = useAuth0();
  const navigate = useNavigate();

  useBounceSignin(auth0, useEffect, navigate);

  let [raceState, setRaceState] = useState<RaceState|null>(null);
  let canvasRef = useRef<HTMLCanvasElement>(null);

  const fnOnRaceDone = () => {
    alert("The race is done!");
  }

  useEffect(() => {
    // startup: let's get our game state up and running
    if(canvasRef?.current) {
      canvasRef.current.width = canvasRef?.current?.clientWidth;
      canvasRef.current.height = canvasRef?.current?.clientHeight;
      const fnMakeMap = async () =>  new RideMapHandicap(new ServerMapDescription(new PureCosineMap(5000)));
      const fnMakeUserProvider = async () => new FakeUserProvider(null);
  
      const drawer = createDrawer("3d");

      setupRace(fnMakeMap, fnMakeUserProvider, "Test-Hacks Race").then((newRaceState) => {
        const decFactory = new DecorationFactory(defaultThemeConfig);
        const decState = new DecorationState(newRaceState.getMap(), decFactory);
        const paintState = new PaintFrameState();
        
        setRaceState(newRaceState);
        requestAnimationFrame((tm) => tickGameAnimationFrame(tm, tm, drawer, decState, paintState, canvasRef, newRaceState, fnOnRaceDone));
      })
    }
  }, [canvasRef]);

  return (
    <div className="AppTestHacks__Container">
      <div className="AppTestHacks__GameContainer">
        It's test-hacks!

        <canvas ref={canvasRef} className="AppTestHacks__Canvas" />
      </div>
    </div>
  );
}

export default App;
