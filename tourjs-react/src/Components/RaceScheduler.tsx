import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { randRange } from "../tourjs-client-shared/DecorationFactory";
import { createDrawer } from "../tourjs-client-shared/drawing-factory";
import { ServerHttpGameListElement, SimpleElevationMap } from "../tourjs-shared/communication";
import { RideMapElevationOnly } from "../tourjs-shared/RideMap";
import { RaceMapStatic } from "./RaceMapStatic";
import seedrandom from "seedrandom";

import './RaceScheduler.scss';
import { ScheduleRacePostRequest } from "../tourjs-shared/ServerHttpObjects";
import { AppPlayerContextType } from "../ContextPlayer";
import { AppAuthContextInstance, AppPlayerContextInstance } from "../index-contextLoaders";
import { AppAuthContextType } from "../ContextAuth";
import { TourJsAccount } from "../tourjs-shared/signin-types";
import { apiPost } from "../tourjs-client-shared/api-get";

export function randRangeSeeded(rng:seedrandom.prng, min:number, max:number) {
  const span = max - min;
  const r = rng.double();

  return r * span + min;
}

function makeRandomMapByLength(seed:number, lengthMeters:number) {
  const rng = seedrandom(seed + '');

  let lastElevation = 0;
  let elevations:number[] = [lastElevation];
  const stepSize = 500;
  for(var x = 0;x < lengthMeters; x+= stepSize) {
    // let's have 5% as our max grade
    const gainLoss = randRangeSeeded(rng, -0.06, 0.06) * stepSize;
    const newElev = lastElevation + gainLoss;
    elevations.push(newElev);
    lastElevation = newElev;
  }
  const map = new SimpleElevationMap(elevations, lengthMeters);

  return map;
}

function getHillRating(map:RideMapElevationOnly):string {
  const stepSize = map.getLength() / 200;
  let lastElev = map.getElevationAtDistance(0);
  let climbing = 0;
  for(var x = stepSize;x < map.getLength(); x += stepSize) {
    const thisElev = map.getElevationAtDistance(x);
    const delta = thisElev - lastElev;
    if(delta > 0) {
      climbing += delta;
    }
    lastElev = thisElev;
  }

  const pct = 100*(climbing / map.getLength());
  if(pct < 1) {
    return `Flat ${pct.toFixed(1)}%`;
  } else if(pct < 1.5) {
    return `Moderate ${pct.toFixed(1)}%`;
  } else if (pct < 2.5) {
    return `Tough ${pct.toFixed(1)}%`;
  } else {
    return `Mountainous ${pct.toFixed(1)}%`;
  }
}

export function RaceScheduler(props:{authState:TourJsAccount, fnOnCreation:()=>void}) {
  let [hidden, setHidden] = useState<boolean>(true);

  const initialDistance = 15000;
  const initialSeed = Math.random();

  const authContext = useContext<AppAuthContextType>(AppAuthContextInstance);

  let [seed, setSeed] = useState<number>(initialSeed);
  let [raceMap, setRaceMap] = useState<RideMapElevationOnly>(makeRandomMapByLength(initialSeed, initialDistance));
  let [targetLength, setTargetLength] = useState<number>(initialDistance);
  let [raceDate, setRaceDate] = useState<string>(new Date().toDateString());
  let [raceTime, setRaceTime] = useState<string>(new Date().toTimeString());
  let [working, setWorking] = useState<boolean>(false);
  let [raceName, setRaceName] = useState<string>(``);

  const onUnhide = () => {
    setHidden(false);
  }
  const onReroll = () => {
    setSeed(Math.random());
  }
  const onChangeMapLength = (delta:number) => {
    setTargetLength(targetLength + delta);
  }
  const onCancel = () => {
    if(window.confirm("Are you sure you want to cancel?")) {
      setHidden(true);
    }
  }
  const onOk = async () => {
    try {
      // gotta make this into a race submission!
      setWorking(true);
      
      let date = new Date(raceDate + ' ' + raceTime);
  
      const req = new ScheduleRacePostRequest(raceMap, 
                                              date,
                                              `Race by ${props.authState.username || ''} at ${raceTime}`,
                                              props.authState.username);
      
      await apiPost('create-race', req);
      props.fnOnCreation();
      alert("Race created!");
      setHidden(true);
    } catch(e) {
      alert("Failed to create your race " + e.message);
    } finally {
      setWorking(false);
    }
  }

  useEffect(() => {
    if(props.authState) {
      setRaceName(`${(targetLength/1000).toFixed(0)}km race by ${props.authState.username} at ${raceTime}`);
    } else {
      // meh
    }
    
  }, [targetLength, raceDate, raceTime, props.authState])

  useEffect(() => {
    setRaceMap(makeRandomMapByLength(seed, targetLength));
  }, [targetLength, seed])

  return (<div className="RaceScheduler__Container">
    <h2>Scheduling A Race</h2>
    {hidden && (
      <button onClick={()=>onUnhide()}>Schedule A Race</button>
    )}
    {!hidden && (<>
      <div className="RaceScheduler__Map--Container">
        <p>Length: {raceMap.getLength().toLocaleString()}m<br />
           Hill Rating: {getHillRating(raceMap)}<br />
           Name: {raceName}
        </p>
        <RaceMapStatic className="RaceScheduler__Map" map={raceMap} />
      </div>
      <div className="RaceScheduler__Manipulate--Container">
        <p>Edit Your Map</p>
        <button onClick={() => onReroll()} disabled={working}>Rerandomize Map</button>
        <div className="RaceScheduler__ButtonRow">
          <button onClick={() => onChangeMapLength(-5000)} disabled={working || targetLength <= 5000}>5km Less</button>
          <button onClick={() => onChangeMapLength(-1000)} disabled={working || targetLength <= 1000}>1km Less</button>
          <button onClick={() => onChangeMapLength(1000)} disabled={working}>1km More</button>
          <button onClick={() => onChangeMapLength(5000)} disabled={working}>5km More</button>
        </div>
      </div>

      <div className="RaceScheduler__When--Container">
        <p>Schedule Your Ride</p>
        <div className="RaceScheduler__When--Label">When are you riding? (date)</div>
        <input disabled={working} className="RaceScheduler__When--Date" id="when-date" type="date" onChange={(evt) => setRaceDate(evt.target.value)} value={raceDate} />
        <div className="RaceScheduler__When--Label">When are you riding? (time)</div>
        <input disabled={working} className="RaceScheduler__When--Time" id="when-time" type="time" onChange={(evt) => setRaceTime(evt.target.value)} value={raceTime} />
      </div>

      <div className="RaceScheduler__ButtonRow">
        <button onClick={() => onCancel()}  disabled={working}>Cancel</button>
        <button onClick={() => onOk()} disabled={working}>Submit</button>
      </div>
    </>
    )}
  </div>)
}
