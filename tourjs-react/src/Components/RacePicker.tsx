import { useEffect, useState } from "react";
import { apiGet } from "../tourjs-client-lib/api-get";
import { ServerHttpGameList, ServerHttpGameListElement } from "../tourjs-api-lib/communication";
import RaceMini from "./RaceMini";

import './RacePicker.scss';
import { AppPlayerContextType } from "../ContextPlayer";

export default function RacePicker(props:{fnOnPickRace:(race:ServerHttpGameListElement)=>void, allowSelection:boolean, raceListRefresher:number, playerContext:AppPlayerContextType}) {

  let [races, setRaces] = useState<ServerHttpGameList|null>(null);
  let [error, setError] = useState<string>('');
  


  const onRefreshRaceList = async () => {
    let attemptCount = 0;
    attemptCount++;
    setRaces(null);
    try {
      const raceList:ServerHttpGameList = await apiGet('race-list');
      console.log("got the race list?", raceList);
      setRaces(raceList);
    } catch(e) {
      setError(`Failed to retrieve race list.  Trying again (retry #${attemptCount})`);
      if(attemptCount < 5) {
        setTimeout(() => {
          onRefreshRaceList();
        }, 1000);
      }
    }
  }
  useEffect(() => {
    async function doIt() {
      onRefreshRaceList();
    }
    doIt();
    
  }, [props.raceListRefresher]);


  const onPickRace = (race:ServerHttpGameListElement) => {
    if(!props.allowSelection) {
      alert("You need to set up your rider first");
      return;
    }
    if(!props.playerContext.powerDevice) {
      const yn = window.confirm("Are you sure you want to pick this race without setting up your powermeter first?");
      if(!yn) {
        return false;
      }
    }
    console.log("they want to do this race ", race);
    props.fnOnPickRace(race);
  }

  return (<div className="RacePicker__Container">
    <h2>Upcoming Races <button className="RacePicker__Refresh" onClick={()=>onRefreshRaceList()}>🔄</button></h2>
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