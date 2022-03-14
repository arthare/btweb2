import { useMemo, useRef, useState } from "react";
import { createDrawer } from "../tourjs-client-shared/drawing-factory";
import { ServerHttpGameListElement, SimpleElevationMap } from "../tourjs-shared/communication";

import './RaceMini.scss';

export default function RaceMini(props:{race:ServerHttpGameListElement, fnOnPickRace:()=>void}) {

  let [raceInfo, setRaceInfo] = useState(new SimpleElevationMap(props.race.elevations, props.race.lengthMeters));
  let imgRef = useRef<HTMLImageElement>();

  const imgDataUrl:string = useMemo(() => {
    if(!raceInfo) {
      throw new Error("you gotta provide your minimap a race!");
    }
    if(!imgRef || !imgRef.current) {
      return ''; // not loaded yet
    }
    const canvas = document.createElement('canvas');

    const w = imgRef.current.clientWidth;
    const h = imgRef.current.clientHeight;

    console.log("wh ", w, h);
    canvas.width = w;
    canvas.height = h;


    const elevations = [];
    const len = raceInfo.getLength();
    for(var pct = 0; pct <= 1.0; pct += 0.005) {
      elevations.push(raceInfo.getElevationAtDistance(pct*len));
    }

    const ctx = canvas.getContext('2d');

    const drawer = createDrawer('2d');
    drawer.drawMinimap({ ctx, 
                   elevations, 
                   w, 
                   h, 
                   minElevSpan: raceInfo.getLength()*0.01,});

    const png = canvas.toDataURL();
    return png;
  }, [raceInfo, imgRef, imgRef?.current?.clientHeight, imgRef?.current?.clientWidth]);

  return  <div className="RaceMini__Container" onClick={props.fnOnPickRace}>
            <img className="RaceMini__Img" ref={imgRef} src={imgDataUrl} />
            <table className="RaceMini__RaceDesc">
              <tbody>
                <tr>
                  <td>Name</td>
                  <td>{props.race.displayName}</td>
                </tr>
                <tr>
                  <td>Length</td>
                  <td>{props.race.lengthMeters.toLocaleString()}m</td>
                </tr>
                <tr>
                  <td>Start Time</td>
                  <td>{(() => {
                    if(props.race.tmScheduledStart <= 0) {
                      return "Upon You Joining";
                    } else {
                      return new Date(props.race.tmScheduledStart).toLocaleString();
                    }
                  })()}</td>
                </tr>
                <tr>
                  <td>Link</td>
                  <td><a href={`/race/${props.race.gameId}`}>Link</a></td>
                </tr>
              </tbody>
            </table>
          </div>
}