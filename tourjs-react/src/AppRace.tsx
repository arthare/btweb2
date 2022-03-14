import { useAuth0 } from "@auth0/auth0-react";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { AppAuthContextInstance, AppPlayerContextInstance } from "./AppLogin";
import InRaceView from "./Components/InRaceView";
import PostRaceView from "./Components/PostRaceView";
import PreRaceView from "./Components/PreRaceView";
import UserProfilePicker from "./Components/UserProfilePicker";
import { AppAuthContextType } from "./ContextAuth";
import { AppPlayerContextType } from "./ContextPlayer";
import ConnectionManager, { S2CPositionUpdateUser, ServerHttpGameListElement } from "./tourjs-shared/communication";

function isProduction() {
  console.log("hostname = ", window.location.hostname);
  switch(window.location.hostname) {
    case 'localhost':
    case 'dev.tourjs.ca':
      return false;
    default:
      return true;
  }
}
function getGameServerHost() {
  if(isProduction()) {
    return 'localhost';
  } else {
    return 'tourjs.ca';
  }
}

export default function AppRace(props:any) {

  const navigate = useNavigate();
  const {gameId} = useParams();


  const authContext = useContext<AppAuthContextType>(AppAuthContextInstance);
  const playerContext = useContext<AppPlayerContextType>(AppPlayerContextInstance);
  const auth0 = useAuth0();

  const [userAccount, setUserAccount] = authContext.gate(auth0, useState, useEffect, navigate);
  const [connManager, setConnManager] = useState<ConnectionManager|null>(null);
  const [frames, setFrames] = useState<number>(0);

  const onNewRaceState = () => {
    console.log("onNewRaceState");
  }
  const onLocalHandicapChange = (handicap:number) => {
    console.log("onLocalHandicapChange");

  }
  const onLastServerRaceStateChange = () => {
    console.log("onLastServerRaceStateChange");

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


  console.log("gameId = ", gameId, frames);
  useEffect(() => {
    console.log("lasttime ", connManager?._lastTimeStamp);
  }, [connManager?._lastTimeStamp])
  useEffect(() => {
    // startup!
    let interval;
    const doIt = async () => {
      console.log(authContext, userAccount, playerContext, playerContext?.localUser);
      if(authContext && userAccount && playerContext && playerContext.localUser && userAccount && !connManager) {

        if(connManager) {
          connManager.disconnect();
        }

        const targetHost = getGameServerHost();
        
        let wsUrl = isProduction() ? `wss://${targetHost}:8080` : `wss://${targetHost}:8080`;
  
        const newConnManager = new ConnectionManager((handicap:number) => onLocalHandicapChange(handicap), () => onLastServerRaceStateChange(), (fromWho:ConnectionManager, count:number) => onNetworkUpdateComplete(fromWho, count), (client:S2CPositionUpdateUser, image:string|null) => onNotifyNewClient(client, image));
        setConnManager(newConnManager);
  
        await newConnManager.connect(wsUrl, playerContext, gameId, '' + userAccount.accountid, playerContext.localUser, () => onNewRaceState());
      }
    }
    doIt();

    return function cleanup() {
      if(connManager) {
        connManager.disconnect();
      }
    }
  }, [userAccount, authContext, playerContext, playerContext?.localUser, connManager]);
  
  return <div>
    {!playerContext.localUser && (<>
      <div>You need to select a rider!</div>
      <UserProfilePicker authState={userAccount} auth0={auth0} fnOnChangeUser={()=>{}} />
    </>)}
    {playerContext.localUser && (<>
      <div>You're going to race as {playerContext?.localUser.getName()} {frames}</div>
    </>)}
    {connManager && connManager.preRace && (
      <PreRaceView raceState={connManager.getRaceState()}></PreRaceView>
    )}
    {connManager && connManager.racing && (
      <InRaceView raceState={connManager.getRaceState()}/>
    )}
    {connManager && connManager.postRace && (
      <PostRaceView raceState={connManager.getRaceState()}/>
    )}

    Time to race!
    </div>
}