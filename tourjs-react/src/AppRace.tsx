import { useAuth0 } from "@auth0/auth0-react";
import { RefObject, useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { AppAuthContextInstance, AppPlayerContextInstance } from "./index-contextLoaders";
import InRaceView from "./Components/InRaceView";
import PostRaceView from "./Components/PostRaceView";
import PreRaceView from "./Components/PreRaceView";
import UserProfilePicker from "./Components/UserProfilePicker";
import { AppAuthContextType } from "./ContextAuth";
import { AppPlayerContextType } from "./ContextPlayer";
import ConnectionManager, { S2CFinishUpdate, S2CPositionUpdateUser, ServerHttpGameListElement } from "./tourjs-api-lib/communication";
import { DrawingInterface, PaintFrameState } from "./tourjs-client-lib/drawing-interface";
import { DecorationState } from "./tourjs-client-lib/DecorationState";
import { RaceState } from "./tourjs-api-lib/RaceState";
import VerticalAlign from "./Components/VerticalAlign";
import {PORTS} from './tourjs-api-lib/communication';

enum DevServerState {
  Unknown,
  ForcedToProd,
  ToLocalhost,
};
let eServerState:DevServerState = DevServerState.Unknown;
function isProduction() {
  console.log("hostname = ", window.location.hostname);

  switch(window.location.hostname) {
    case 'localhost':
    case 'dev.tourjs.ca':
      if(eServerState === DevServerState.Unknown) {
        const ynProd = window.confirm("You appear to be developing.  Would you like to connect to the main servers at tourjs.ca?\n\nOK: Yes\nCancel: No");
        eServerState = ynProd ? DevServerState.ForcedToProd : DevServerState.ToLocalhost;
      }
      return eServerState === DevServerState.ForcedToProd;
    default:
      return true;
  }
}
function getGameServerHost() {
  if(!isProduction()) {
    return 'localhost';
  } else {
    return 'tourjs.ca';
  }
}

export function tickGameAnimationFrame(tmThisFrame:number, tmLastFrame:number, drawer:DrawingInterface, decorationState:DecorationState, paintState:PaintFrameState, ref:RefObject<HTMLCanvasElement>, refOverlay:RefObject<HTMLCanvasElement>, raceState:RaceState, fnOnRaceDone:()=>void, fnOnFrame:(tmFrame, frame:number)=>void, fnStillOnRacePage:()=>boolean) {

  const tm = tmThisFrame;
  const dt = (tmThisFrame - tmLastFrame) / 1000;

  if(!fnStillOnRacePage()) {
    return;
  }
  if(raceState.isOldNews()) {
    return;
  }
  raceState.tick(tmThisFrame);
  fnOnFrame(tm, paintState.frameCount++);

  if(ref.current) {
    drawer.paintCanvasFrame(ref.current, refOverlay.current, raceState, tm, decorationState, dt, paintState)
  }

  if(raceState.isAllRacersFinished(tm)) {
    // we're done.  no need for further action
    fnOnRaceDone();
  } else {
    requestAnimationFrame((tm) => tickGameAnimationFrame(tm, tmThisFrame, drawer, decorationState, paintState, ref, refOverlay, raceState, fnOnRaceDone, fnOnFrame, fnStillOnRacePage));
  }
}


export default function AppRace(props:any) {

  const navigate = useNavigate();
  const {gameId} = useParams();


  const authContext = useContext<AppAuthContextType|null>(AppAuthContextInstance);
  const playerContext = useContext<AppPlayerContextType|null>(AppPlayerContextInstance);
  const auth0 = useAuth0();

  const [userAccount, setUserAccount] = authContext.gate(auth0, useState, useEffect, navigate);
  const [connManager, setConnManager] = useState<ConnectionManager|null>(null);
  const [frames, setFrames] = useState<number>(0);
  const [forceRefreshVersion, setForceRefreshVersion] = useState<number>(0);

  const [authState, setAuthState] = authContext.gate(auth0, useState, useEffect, navigate);

  const onNewRaceState = () => {
    //console.log("onNewRaceState");
  }
  const onLocalHandicapChange = (handicap:number) => {
    //console.log("onLocalHandicapChange");

  }
  const onLastServerRaceStateChange = () => {
    //console.log("onLastServerRaceStateChange");

  }
  const onNetworkUpdateComplete = (fromWho:ConnectionManager, count:number) => {
    if(connManager && fromWho !== connManager) {
      connManager.disconnect();
      setConnManager(fromWho);
    }
    setFrames(count);

  }
  const onNotifyNewClient = (client:S2CPositionUpdateUser, image:string|null) => {
    playerContext.addRemoteUser(client, image);
  }

  const isStillOnThisPage = () => {
    return window.location.pathname.includes('/race/');
  }

  useEffect(() => {
    // the existence of this appears to force rerenders?
  }, [connManager?._lastTimeStamp])
  useEffect(() => {
    // startup!
    console.log("connection startup ", userAccount, authContext, playerContext, connManager);
    let interval;
    const doIt = async () => {
      console.log(authContext, userAccount, playerContext, playerContext?.localUser);
      if(authContext && userAccount && playerContext && playerContext.localUser && userAccount && !connManager) {

        if(connManager) {
          connManager.disconnect();
        }

        const targetHost = getGameServerHost();
        
        let wsUrl = isProduction() ? `wss://${targetHost}:${PORTS.TOURJS_WEBSOCKET_PORT}` : `ws://${targetHost}:${PORTS.TOURJS_WEBSOCKET_PORT}`;
  
        console.log("building connection manager ", wsUrl, " connecting with ", playerContext.localUser);
        const newConnManager = new ConnectionManager((handicap:number) => onLocalHandicapChange(handicap), () => onLastServerRaceStateChange(), (fromWho:ConnectionManager, count:number) => onNetworkUpdateComplete(fromWho, count), (client:S2CPositionUpdateUser, image:string|null) => onNotifyNewClient(client, image));
        setConnManager(newConnManager);
  
        await newConnManager.connect(authContext._myAccount.sub, wsUrl, playerContext, gameId, '' + userAccount.accountid, playerContext.localUser, () => onNewRaceState());
      }
    }
    doIt();

    return function cleanup() {
      if(connManager) {
        connManager.disconnect();
      }
    }
  }, [userAccount, authContext, playerContext, playerContext?.localUser, forceRefreshVersion, connManager]);
  
  const tmNow = new Date().getTime();
  const msUntilStart = (connManager?.msOfStart || tmNow + 1000000) - tmNow;
  console.log("ms until start ", msUntilStart);
  let showRaceViewEarly = msUntilStart >= -20000 && msUntilStart <= 10000 && !connManager.racing;
  let preRaceCountdown;
  if(showRaceViewEarly) {
    preRaceCountdown = (
      <div className="InRacePreRace__Container">
        <VerticalAlign className="InRacePreRace__Vert">
          <div className="InRacePreRace__Words">Starting in...</div>
          <div className="InRacePreRace__Time">{(Math.max(0,msUntilStart)/1000).toFixed(1)}</div>
        </VerticalAlign>
      </div>
    )
  }

  return <div className={`AppRace__Container ${forceRefreshVersion}`}>
    {!playerContext || !authContext && (
      <div>Loading...</div>
    )}
    {playerContext && authContext && (
      <>
        {playerContext && !playerContext.localUser && (
          <UserProfilePicker playerContext={playerContext} authContext={authContext} auth0={auth0} authState={authState} fnOnChangeUser={()=>authContext.refreshAliases(auth0, setAuthState)} />
        )}
        {connManager && connManager.preRace && !showRaceViewEarly && (
          <PreRaceView raceState={connManager.getRaceState()} tmStart={connManager.msOfStart} playerContext={playerContext}></PreRaceView>
        )}
        {connManager && (connManager.racing || showRaceViewEarly) && (
          <InRaceView raceState={connManager.getRaceState()} fnStillOnRacePage={isStillOnThisPage} >
            {preRaceCountdown}
          </InRaceView>
        )}
        {connManager && connManager.postRace && connManager.raceResults && (
          <PostRaceView raceResults={connManager.raceResults}/>
        )}
      </>
    )}
    </div>
}