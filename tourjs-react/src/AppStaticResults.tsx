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
import { apiGet } from "./tourjs-client-lib/api-get";

export default function AppStaticResults(props:any) {

  const {resultKey} = useParams();

  let [raceResults, setRaceResults] = useState(null);

  useEffect(() => {
    console.log("resultkey = " ,resultKey);
    if(resultKey) {
      apiGet('race-results', {key:resultKey}).then((results) => {
        setRaceResults(results);
      })
    }
  }, [resultKey])

  return <div className={`AppStaticResults__Container`}>
      {raceResults && <PostRaceView raceResults={raceResults} />}
    </div>
}