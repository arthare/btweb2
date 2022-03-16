import { useEffect, useRef } from "react";
import { tickGameAnimationFrame } from "../AppTestHacks";
import { DecorationFactory } from "../tourjs-client-shared/DecorationFactory";
import { DecorationState } from "../tourjs-client-shared/DecorationState";
import { defaultThemeConfig } from "../tourjs-client-shared/drawing-constants";
import { createDrawer } from "../tourjs-client-shared/drawing-factory";
import { PaintFrameState } from "../tourjs-client-shared/drawing-interface";
import { ServerMapDescription } from "../tourjs-shared/communication";
import { RaceState } from "../tourjs-shared/RaceState";
import { PureCosineMap } from "../tourjs-shared/RideMap";
import { RideMapHandicap } from "../tourjs-shared/RideMapHandicap";
import { FakeUserProvider, setupRace } from "../UtilsGameStarter";
import './InRaceView.scss';

export default function InRaceView(props:{raceState:RaceState}) {
  const user = props.raceState.getUserProvider().getLocalUser();
  const canvasRef = useRef<HTMLCanvasElement>();
  
  useEffect(() => {
    // startup: let's get our game state up and running
    if(canvasRef?.current) {
      canvasRef.current.width = canvasRef?.current?.clientWidth;
      canvasRef.current.height = canvasRef?.current?.clientHeight;
      const drawer = createDrawer("3d");

      const decFactory = new DecorationFactory(defaultThemeConfig);
      const decState = new DecorationState(props.raceState.getMap(), decFactory);
      const paintState = new PaintFrameState();
      
      requestAnimationFrame((tm) => tickGameAnimationFrame(tm, tm, drawer, decState, paintState, canvasRef, props.raceState, ()=>{}));
    }
  }, [canvasRef]);
  
  return <div>
    <canvas ref={canvasRef}  className="InRaceView__Canvas"/>
    </div>
}