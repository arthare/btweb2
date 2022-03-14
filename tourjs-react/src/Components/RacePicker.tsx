import { useEffect, useState } from "react";
import { apiGet } from "../tourjs-client-shared/api-get";
import { ServerHttpGameList, ServerHttpGameListElement } from "../tourjs-shared/communication";
import RaceMini from "./RaceMini";

export default function RacePicker(props:{fnOnPickRace:(race:ServerHttpGameListElement)=>void}) {

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
    
  }, []);

  const onPickRace = (race:ServerHttpGameListElement) => {
    console.log("they want to do this race ", race);
    props.fnOnPickRace(race);
  }

  return (<div>
    <h3>Upcoming Races</h3>
    {races && races.races.map((race) => {
        return <RaceMini race={race} fnOnPickRace={() => onPickRace(race)} />
    })}
    {error && <div>{error}</div>}
  </div>)
}