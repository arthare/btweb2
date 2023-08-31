import { useContext, useEffect, useRef, useState } from "react";
import { tickGameAnimationFrame } from "../AppRace";
import { DecorationFactory } from "../tourjs-client-shared/DecorationFactory";
import { DecorationState } from "../tourjs-client-shared/DecorationState";
import { defaultThemeConfig } from "../tourjs-client-shared/drawing-constants";
import { createDrawer } from "../tourjs-client-shared/drawing-factory";
import { PaintFrameState } from "../tourjs-client-shared/drawing-interface";
import { ServerMapDescription } from "../tourjs-shared/communication";
import { RaceState } from "../tourjs-shared/RaceState";
import { PureCosineMap, RideMap, RideMapElevationOnly } from "../tourjs-shared/RideMap";
import { RideMapHandicap } from "../tourjs-shared/RideMapHandicap";
import { UserInterface, UserTypeFlags } from "../tourjs-shared/User";
import { FakeUserProvider, setupRace } from "../UtilsGameStarter";
import './InRaceView.scss';
import { updateIf } from "typescript";
import { DistanceDisplay, TimeDisplay } from "./PreRaceView";
import { assert2 } from "../tourjs-shared/Utils";
import { InRaceLeaderboard } from "./InRaceViewLeaderboard";
import { InRaceViewStatus, InRaceViewStatusExtra } from "./InRaceViewStatus";
import { AppPlayerContextType } from "../ContextPlayer";
import { AppPlayerContextInstance } from "../index-contextLoaders";
import { RaceMapLive } from "./RaceMapLive";


export default function InRaceView(props:{raceState:RaceState, children?:any}) {
  const canvasRef = useRef<HTMLCanvasElement>();
  const playerContext = useContext<AppPlayerContextType>(AppPlayerContextInstance);
  
  let [frames, setFrames] = useState<number>(0);
  let [tm, setTm] = useState<number>(0);
  let [hasSavedPwx, setHasSavedPwx] = useState<boolean>(false);
  let [localUserHasFinished, setLocalUserHasFinished] = useState<boolean>(false);

  let [beingFollowed, setBeingFollowed] = useState<boolean>(false);
  let [following, setFollowing] = useState<boolean>(false);


  useEffect(() => {
    // startup: let's get our game state up and running
    if(canvasRef?.current) {
      canvasRef.current.width = canvasRef?.current?.clientWidth * window.devicePixelRatio;
      canvasRef.current.height = canvasRef?.current?.clientHeight * window.devicePixelRatio;
      const drawer = createDrawer("3d");

      const decFactory = new DecorationFactory(defaultThemeConfig);
      const decState = new DecorationState(props.raceState.getMap(), decFactory);
      const paintState = new PaintFrameState();
      
      let lastFrames = 0;
      requestAnimationFrame((tm) => {

        tickGameAnimationFrame(tm, tm, drawer, decState, paintState, canvasRef, props.raceState, ()=>{}, (tmFrame, frame)=>{

          const localUser = props.raceState.getLocalUser();
          setBeingFollowed(localUser?.hasDraftersThisCycle(tmFrame));
          setFollowing(localUser.isDraftingAnyone());
          const map = props.raceState.getMap();
          if(localUser && map && localUser.getDistance() >= map.getLength()) {
            setLocalUserHasFinished(true);
          }

          const tenthFrames = Math.floor(tmFrame / 500);
          if(tenthFrames !== lastFrames) {
            setTm(tmFrame);
            setFrames(tenthFrames)
            lastFrames = tenthFrames;
          }
        })
      });
    }
  }, [canvasRef]);

  useEffect(() => {
    if(props.raceState){
      const localUser = props.raceState.getLocalUser();
      const map = props.raceState.getMap();
      if(localUser && map) {
        if(!hasSavedPwx) {
          // we haven't saved the PWX yet!  let's check if it would be appropriate to do so
          if(localUser.getDistance() >= map.getLength() || localUserHasFinished) {
            // time to dump the PWX!  we're past the end of the map and we haven't saved the PWX yet


            setLocalUserHasFinished(true);
            setHasSavedPwx(true);
          }
        }
      }
    }
  }, [frames, hasSavedPwx, localUserHasFinished]);

  return <div className={`InRaceView__Container ${following && 'Following'} ${beingFollowed && 'BeingFollowed'}`}>
      <canvas ref={canvasRef}  className="InRaceView__Canvas"/>
      <div className="InRaceView__Status-Container">
        {props.raceState && <InRaceViewStatus raceState={props.raceState} tmNow={tm} playerContext={playerContext} />}
      </div>
      <div className="InRaceView__StatusExtra-Container">
        {props.raceState && <InRaceViewStatusExtra raceState={props.raceState} tmNow={tm} playerContext={playerContext} />}
      </div>
      <div className="InRaceView__Minimap-Container">
        {props.raceState && <RaceMapLive className="" raceState={props.raceState} tmNow={tm} playerContext={playerContext} />}
      </div>
      <div className="InRaceView__Leaderboard-Container">
        {props.raceState && <InRaceLeaderboard frames={frames} raceState={props.raceState} tmNow={tm} />}
      </div>
      {props.children && (
        <div className="InRaceView__Children">
          {props.children}
        </div>
      )}
    </div>
}