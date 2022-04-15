import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { createDrawer } from "../tourjs-client-shared/drawing-factory";
import { ServerHttpGameListElement, SimpleElevationMap } from "../tourjs-shared/communication";
import { RaceMapStatic } from "./RaceMapStatic";

import './RaceMini.scss';

export default function RaceMini(props:{race:ServerHttpGameListElement, fnOnPickRace:()=>void}) {

  let [raceInfo, setRaceInfo] = useState(new SimpleElevationMap(props.race.elevations, props.race.lengthMeters));
  return  <div className="RaceMini__Container" onClick={props.fnOnPickRace}>
            <RaceMapStatic map={raceInfo} className="RaceMini__Img" />
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
                  <td><Link to={`/race/${props.race.gameId}`}>Link</Link></td>
                </tr>
              </tbody>
            </table>
          </div>
}