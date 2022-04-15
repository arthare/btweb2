import { useEffect, useState } from "react";
import { apiGet } from "../tourjs-client-shared/api-get";
import { ServerHttpGameList, ServerHttpGameListElement } from "../tourjs-shared/communication";
import RaceMini from "./RaceMini";

import './RacePicker.scss';

export default function RacePicker(props:{fnOnPickRace:(race:ServerHttpGameListElement)=>void, allowSelection:boolean, raceListRefresher:number}) {

  let [races, setRaces] = useState<ServerHttpGameList|null>(null);
  let [error, setError] = useState<string>('');
  


  useEffect(() => {
    let attemptCount = 0;
    async function doIt() {
      attemptCount++;
      try {
        const raceList:ServerHttpGameList = await apiGet('race-list');
        console.log("got the race list?", raceList);
        setRaces(raceList);
      } catch(e) {
        setError(`Failed to retrieve race list.  Trying again (retry #${attemptCount})`);
        setTimeout(() => {
          doIt();
        }, 1000);
      }
    }
    doIt();
    
  }, [props.raceListRefresher]);


  const onPickRace = (race:ServerHttpGameListElement) => {
    if(!props.allowSelection) {
      alert("You need to set up your powermeter first");
      return;
    }
    console.log("they want to do this race ", race);
    props.fnOnPickRace(race);
  }

  return (<div className="RacePicker__Container">
    <h2>Upcoming Races</h2>
    {props.allowSelection && (<>
      {races && races.races.map((race, index) => {
          return <RaceMini key={index} race={race} fnOnPickRace={() => onPickRace(race)} />
      })}
      {error && <div>{error}</div>}
    </>)}
    {!props.allowSelection && (
      <div>You have to select a rider and powermeter first</div>
    )}
  </div>)
}