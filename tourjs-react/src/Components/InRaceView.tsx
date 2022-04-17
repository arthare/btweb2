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
import { InRaceViewStatus } from "./InRaceViewStatus";
import { AppPlayerContextType } from "../ContextPlayer";
import { AppPlayerContextInstance } from "../index-contextLoaders";


export default function InRaceView(props:{raceState:RaceState}) {
  const canvasRef = useRef<HTMLCanvasElement>();
  const playerContext = useContext<AppPlayerContextType>(AppPlayerContextInstance);
  
  let [frames, setFrames] = useState<number>(0);
  let [tm, setTm] = useState<number>(0);

  useEffect(() => {
    // startup: let's get our game state up and running
    if(canvasRef?.current) {
      canvasRef.current.width = canvasRef?.current?.clientWidth * window.devicePixelRatio;
      canvasRef.current.height = canvasRef?.current?.clientHeight * window.devicePixelRatio;
      const drawer = createDrawer("3d");

      const decFactory = new DecorationFactory(defaultThemeConfig);
      const decState = new DecorationState(props.raceState.getMap(), decFactory);
      const paintState = new PaintFrameState();
      
      requestAnimationFrame((tm) => {
        tickGameAnimationFrame(tm, tm, drawer, decState, paintState, canvasRef, props.raceState, ()=>{}, (tmFrame, frame)=>{
          const tenthFrames = Math.floor(frame / 20);
          if(tenthFrames !== frames) {
            setTm(tmFrame);
            setFrames(tenthFrames)
          }
        })
      });
    }
  }, [canvasRef]);

  return <div className="InRaceView__Container">
      <canvas ref={canvasRef}  className="InRaceView__Canvas"/>
      <div className="InRaceView__Status-Container">
        {props.raceState && <InRaceViewStatus raceState={props.raceState} tmNow={tm} playerContext={playerContext} />}
      </div>
      <div className="InRaceView__Leaderboard-Container">
        {props.raceState && <InRaceLeaderboard frames={frames} raceState={props.raceState} tmNow={tm} />}
      </div>
    </div>
}