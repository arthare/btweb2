import { RaceState } from "./RaceState";
import { RideMap } from "./RideMap";
import { ServerUser } from "./ServerGame";
import { User, UserInterface, UserTypeFlags } from "./User";
import { assert2 } from "./Utils";

export interface TrainingSnapshot {
  tm:number;

  // inputs:
  distanceToFinish:number;
  distanceInRace:number;
  pctOfRaceComplete:number;

  metersLeftToClimb:number;
  metersLeftToClimbCurrentUphill:number;
  metersLeftToDescend:number;
  metersLeftToDescentCurrentDownhill:number;
  avgSlopeCurrentUphill:number;
  avgSlopeCurrentDownhill:number;


  last5MinPctFtp:number;
  last30SecPctFtp:number;

  gapToHumanAhead:number;
  gapToHumanBehind:number;
  closeRateHumanAhead:number;
  closeRateHumanBehind:number;
  gapToLeader:number;
  closeRateToLeader:number;

  gapToGroupAhead:number;
  gapToGroupBehind:number;
  closeRateGroupAhead:number;
  closeRateGroupBehind:number;

  rankInGroup:number;
  groupSize:number;
  ridersAheadOfGroup:number;


  // output:
  powerNextSecond:number;
}

export interface DataWithName {
  name:string;
  data:number;
}

export class TrainingDataPrepped {
  _myData:DataWithName[];
  constructor(snap:TrainingSnapshot) {
    // we need to pre-normalize a bunch of these, as well as filter out crap that doesn't matter
    let temp:any = {...snap};

    delete temp.tm; // this is not helpful
    delete temp.powerNextSecond; // this is label data
    delete temp.rankInGroup; // absolute ranks aren't that important, we will convert this into a percentage of the group size
    delete temp.distanceInRace; // absolute meters aren't helpful when we're talking about a wide variety of possible lengths for a given player
    delete temp.distanceToFinish; // absolute meters aren't helpful when we're talking about a wide variety of possible lengths for a given player

    delete temp.gapToHumanAhead;
    delete temp.gapToHumanBehind;
    delete temp.closeRateHumanAhead;
    delete temp.closeRateHumanBehind;
    
    // in particular, the "distance to finish", "distance in race" are going to be crap.
    // if Art does a 5km race and a 50km race in the same training set, then the 5km race's "distance" values will be 1/10th what they should be after normalization.
    const distancesPassed = [
      500,
      1000,
      1500,
      2500,
      3500,
      4500,
      5000,
    ];
    
    distancesPassed.forEach((dist) => {
      temp[`distance-passed-${dist}`] = snap.distanceInRace > dist ? 1 : 0;
      temp[`distanceleft-passed-${dist}`] = snap.distanceToFinish < dist ? 1 : 0;
    });
    
    temp.rankInGroup = snap.rankInGroup / snap.groupSize; // normalizing this so that it's not compared against someone that rode in a group of 30

    this._myData = [];
    for(var key in temp) {
      if(typeof temp[key] === 'number') {
        this._myData.push({data:temp[key], name: key});
      } else if(Array.isArray(temp[key])) {
        debugger;
      }
    }
  }
}

function getMetersLeftToClimb(currentDist:number, map:RideMap, dir:number) {
  let lastElev = dir*map.getElevationAtDistance(currentDist);

  let climbAmount = 0;
  for(var dist = currentDist; dist < map.getLength(); dist += map.getLength() / 100) {
    const elev = dir*map.getElevationAtDistance(dist);
    if(elev > lastElev) {
      climbAmount += elev - lastElev;
    }
    lastElev = elev;
  }

  return climbAmount;
}
function getMetersLeftToClimbCurrentHill(currentDist:number, map:RideMap, dir:number):{vertToGo:number, horzToGo:number} {
  let lastElev = dir*map.getElevationAtDistance(currentDist);

  let climbAmount = 0;
  const step = map.getLength() / 100;
  let dist = currentDist + step;
  for(; dist < map.getLength(); dist += step) {
    const elev = dir*map.getElevationAtDistance(dist);
    if(elev > lastElev) {
      climbAmount += elev - lastElev;
    } else {
      break;
    }
    lastElev = elev;
  }

  return {vertToGo:climbAmount, horzToGo:dist - step - currentDist};
}

function getGroup(ixMe:number, allUsersSorted:UserInterface[]):{group:UserInterface[], ixYou:number, ridersAheadOfGroup:number} {
  let group = [];
  let lastDistance = allUsersSorted[ixMe].getDistance();
  let ridersAheadOfGroup = 0;

  // check ahead of us
  lastDistance = allUsersSorted[ixMe].getDistance();
  for(var ixAhead = ixMe + 1; ixAhead < allUsersSorted.length; ixAhead++) {
    const user = allUsersSorted[ixAhead];
    const thisDist = user.getDistance();
    const delta = Math.abs(thisDist - lastDistance);
    if(delta < 10) {
      // still part of the group
      group.push(user);
      lastDistance = thisDist;
    } else {
      // this rider has broken away from the user's group
      ridersAheadOfGroup = allUsersSorted.length - ixAhead - 1;
      break;
    }
  }

  const ixYou = group.length; // since we know how many people are in the group ahead of you, then we know your rank in the group
  group.push(allUsersSorted[ixMe]); // you're in the group!

  // check behind us
  lastDistance = allUsersSorted[ixMe].getDistance();
  for(var ixBehind = ixMe - 1; ixBehind >= 0; ixBehind--) {
    const user = allUsersSorted[ixBehind];
    const thisDist = user.getDistance();
    const delta = Math.abs(thisDist - lastDistance);
    if(delta < 10) {
      // still part of the group
      group.push(user);
      lastDistance = thisDist;
    } else {
      // behind the group, we're done adding
      break;
    }
  }

  group.sort((a, b) => a.getDistance() < b.getDistance() ? -1 : 1);
  return {group, ixYou, ridersAheadOfGroup};
}

export function takeTrainingSnapshot(tmNow:number, user:User, raceState:RaceState):TrainingSnapshot|null {
  const ret:TrainingSnapshot = {
    tm: new Date().getTime(),
  } as any;

  const map:RideMap = raceState.getMap();
  
  if(user.getDistance() >= map.getLength() || user.isFinished()) {
    // they're done, so no snapshot to be done
    return null;
  }
  if(raceState.isAllHumansFinished(tmNow)) {
    return null;
  }
  if(raceState.isAllRacersFinished(tmNow)) {
    return null;
  }
  if(user.isFinished()) {
    return null;
  }
  if(!user.isPowerValid(tmNow)) {
    return null;
  }
  if(user.getDistance() <= 50) {
    return null;
  }
  

  ret.distanceToFinish = map.getLength() - user.getDistance();
  ret.distanceInRace = user.getDistance();
  ret.pctOfRaceComplete = user.getDistance() / map.getLength();

  const currentHillUp = getMetersLeftToClimbCurrentHill(user.getDistance(), map, 1);
  const currentHillDown = getMetersLeftToClimbCurrentHill(user.getDistance(), map, -1);

  ret.metersLeftToClimb = getMetersLeftToClimb(user.getDistance(), map, 1);
  ret.metersLeftToClimbCurrentUphill = currentHillUp.vertToGo
  ret.metersLeftToDescend = getMetersLeftToClimb(user.getDistance(), map, -1);
  ret.metersLeftToDescentCurrentDownhill = currentHillDown.vertToGo;

  ret.avgSlopeCurrentUphill = (currentHillUp.vertToGo / currentHillUp.horzToGo) || 0;
  ret.avgSlopeCurrentDownhill = (currentHillDown.vertToGo / currentHillDown.horzToGo) || 0;

  ret.last30SecPctFtp = user.getPowerAverageForLastNSeconds(tmNow, 30) / user.getHandicap();
  ret.last5MinPctFtp = user.getPowerAverageForLastNSeconds(tmNow, 300) / user.getHandicap();

  const allUsers = raceState.getUserProvider().getUsers(tmNow);
  allUsers.sort((a, b) => a.getDistance() < b.getDistance() ? -1 : 1);

  const ixMe = allUsers.findIndex((u) => u === user);
  assert2(ixMe >= 0); // we should always be able to find ourselves
  if(ixMe >= 0 && ixMe < allUsers.length - 1) {
    // finding group ahead
    const nextAhead = allUsers[ixMe + 1];
    if(nextAhead) {
      ret.gapToGroupAhead = nextAhead.getSecondsAgoToCross(tmNow, user.getDistance()) || 0;
      ret.closeRateGroupAhead = user.getSpeed() - nextAhead.getSpeed();
    } else {
      ret.gapToGroupAhead = 0;
      ret.closeRateGroupAhead = 0;
      assert2(false);
    }

    const nextHumanAhead = allUsers.slice(ixMe+1).find((u) => !(u.getUserType() & UserTypeFlags.Ai));
    if(nextHumanAhead) {
      ret.gapToHumanAhead = nextHumanAhead.getSecondsAgoToCross(tmNow, user.getDistance()) || 0;
      ret.closeRateHumanAhead = user.getSpeed() - nextHumanAhead.getSpeed();
    } else {
      ret.gapToHumanAhead = 0;
      ret.closeRateHumanAhead = 0;
    }
  } else {
    ret.gapToGroupAhead = 0;
    ret.gapToHumanAhead = 0;
    ret.closeRateGroupAhead = 0;
    ret.closeRateHumanAhead = 0;
  }
  
  if(ixMe >= 1) {
    // finding group behind
    const nextBehind = allUsers[ixMe - 1];
    if(nextBehind) {
      ret.gapToGroupBehind = user.getSecondsAgoToCross(tmNow, nextBehind.getDistance()) || 0;
      ret.closeRateGroupBehind = user.getSpeed() - nextBehind.getSpeed();
    } else {
      ret.gapToGroupBehind = 0;
      ret.closeRateGroupBehind = 0;
      assert2(false);
    }

    const nextHumanBehind = allUsers.slice(0, ixMe - 1).find((u) => !(u.getUserType() & UserTypeFlags.Ai));
    if(nextHumanBehind) {
      ret.gapToHumanBehind = user.getSecondsAgoToCross(tmNow, nextHumanBehind.getDistance()) || 0;
      ret.closeRateHumanBehind = nextHumanBehind.getSpeed() - user.getSpeed();
    } else {
      ret.gapToHumanBehind = 0;
      ret.closeRateHumanBehind = 0;
    }
  } else {
    ret.gapToGroupBehind = 0;
    ret.gapToHumanBehind = 0;
    ret.closeRateGroupBehind = 0;
    ret.closeRateHumanBehind = 0;
  }

  const group = getGroup(ixMe, allUsers);
  ret.groupSize = group.group.length;
  ret.rankInGroup = group.ixYou;
  ret.ridersAheadOfGroup = group.ridersAheadOfGroup;


  ret.powerNextSecond = -1; // this needs to get filled in on our next cycle
  return ret;
}
export function trainingSnapshotToAILabel(data:TrainingSnapshot|any):number[] {
  return [data.powerNextSecond];
}
export function trainingSnapshotToAIInput(data:TrainingSnapshot|any):DataWithName[] {
  return new TrainingDataPrepped(data)._myData;
}

export function brainPath(brain:string):string {
  return `./brains/${brain}`;
}