import { useEffect, useRef, useState } from "react";
import { AppPlayerContextType } from "../ContextPlayer";
import { createDrawer } from "../tourjs-client-lib/drawing-factory";
import { RaceState } from "../tourjs-api-lib/RaceState";
import { UserTypeFlags } from "../tourjs-api-lib/User";
import './RaceMapLive.scss';

export function RaceMapLive(props:{raceState:RaceState, tmNow:number, playerContext:AppPlayerContextType, className:string}) {
  
  let imgRef = useRef<HTMLImageElement>();
  let [dataUri, setDataUri] = useState<string>('');

  const map = props.raceState.getMap();
  useEffect(() => {
    
    if(!map) {
      throw new Error("you gotta provide your minimap a race!");
    }
    if(!imgRef || !imgRef.current) {
      return;
    }
    const canvas = document.createElement('canvas');

    const w = imgRef.current.clientWidth;
    const h = imgRef.current.clientHeight;
    canvas.width = w;
    canvas.height = h;


    const elevations = [];
    const len = map.getLength();
    for(var pct = 0; pct <= 1.0; pct += 0.005) {
      elevations.push(map.getElevationAtDistance(pct*len));
    }

    const ctx = canvas.getContext('2d');

    const players = props.raceState.getUserProvider().getUsers(props.tmNow);
    let humanPositions = players.filter((p) => !(p.getUserType() & UserTypeFlags.Ai)).map((u) => u.getDistance() / map.getLength());
    let aiPositions = players.filter((p) => (p.getUserType() & UserTypeFlags.Ai)).map((u) => u.getDistance() / map.getLength())

    humanPositions = humanPositions.map((p) => Math.max(0, Math.min(1, p)));
    aiPositions = aiPositions.map((p) => Math.max(0, Math.min(1, p)));

    const drawer = createDrawer('2d');

    const localPositionPct = (props.playerContext.getLocalUser()?.getDistance() || 0) / map.getLength();
    drawer.drawMinimap({ ctx, 
                   elevations, 
                   w, 
                   h, 
                   minElevSpan: map.getLength()*0.01,
                   localPositionPct,
                   humanPositions,
                   aiPositions});



    const png = canvas.toDataURL();
    setDataUri(png);

  }, [map, imgRef.current?.clientWidth, props.tmNow]);


  return (<img className={`RaceMapLive__Image ${props.className}`} ref={imgRef} src={dataUri} />)
}