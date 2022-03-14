import { RaceState } from "../tourjs-shared/RaceState";

export default function InRaceView(props:{raceState:RaceState}) {
  const user = props.raceState.getUserProvider().getLocalUser();
  
  return <div>It's the in-race view!  You're at {user && user.getDistance().toFixed(1)}m</div>
}