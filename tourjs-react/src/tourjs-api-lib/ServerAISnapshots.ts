import { getAIStrengthBoostForDistance, RaceState } from "./RaceState";
import { RideMap } from "./RideMap";
//import { StatsData } from "./ServerGame";
import { DEFAULT_CDA, DEFAULT_CRR, DEFAULT_GRAVITY, DEFAULT_HANDICAP_POWER, DEFAULT_RHO, DEFAULT_RIDER_MASS, User, UserInterface, UserTypeFlags } from "./User";
import { assert2 } from "./Utils";
//import tf from '@tensorflow/tfjs-node';

interface TrainingSnapshot {
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

export interface TrainingSnapshotV2 extends TrainingSnapshot {
  version:"2";

  speed:number;
  currentSlope:number;
  currentDraftPct:number;
  currentDrafteeCount:number;
  closestDrafteeFtpSecondsSavedPerKm:number; // the person hot on our ass, how much have they been saving?
  biggestLeechInGroupFtpSecondsSavedPerKm:number; // in our group, who has been saving the most?
  ftpSecondsSpentPerKm:number[]; // all the various metrics stuff from getHandicapSecondsUsed
  ftpSecondsSavedPerKm:number;

}

export interface DataWithName {
  name:string;
  data:number;
}

function bound(min:number, val:number, max:number):number {
  return Math.max(min, Math.min(val, max));
}

function getTerminalVelocity(pctOfFtp:number, slopeInPercent:number):number {
  
  let guessSpeed = 0.5;
  let maxAccelSpeed = guessSpeed;
  let minDecelSpeed = 0;
  while(true) {
    const dragRolling = -DEFAULT_CRR * DEFAULT_RIDER_MASS * DEFAULT_GRAVITY;
    const dragAero = DEFAULT_CDA * DEFAULT_RHO * 0.5 * guessSpeed * guessSpeed;

    const normalForce = DEFAULT_RIDER_MASS * DEFAULT_GRAVITY;
    const dragSlope = (slopeInPercent / 100) * normalForce;

    const outputPower = (DEFAULT_HANDICAP_POWER * pctOfFtp);
    const accelPower = outputPower / Math.max(guessSpeed, 0.5);

    const totalForce = accelPower - dragSlope - dragAero - dragRolling;

    if(Math.abs(totalForce) <= 0.1) {
      // found our equilibrium
      //console.log(`Terminal velocity for ${outputPower.toFixed(1)}W and slope ${slopeInPercent.toFixed(1)} is ${(guessSpeed*3.6).toFixed(0)}km/h`)
      return guessSpeed;
    } else if(totalForce < 0) {
      // we'd be decelerating at this speed
      minDecelSpeed = guessSpeed;
      guessSpeed = (minDecelSpeed + maxAccelSpeed) / 2;
    } else {
      maxAccelSpeed = guessSpeed;
      if(minDecelSpeed) {
        // we're narrowing down the bounds now, so we're doing a binary search
        guessSpeed = (minDecelSpeed + maxAccelSpeed) / 2;
      } else {
        // we're hunting for how fast we have to go before we start decelerating
        guessSpeed *= 2;
      }
      
    }
  }
}

export class TrainingDataPrepped {
  _myData:DataWithName[];
  constructor(snap:TrainingSnapshotV2, killCols:number[]) {
    // we need to pre-normalize a bunch of these, as well as filter out crap that doesn't matter
    let temp:any = {...snap};

    delete temp.tm; // this is not helpful
    delete temp.powerNextSecond; // this is label data
    delete temp.rankInGroup; // absolute ranks aren't that important, we will convert this into a percentage of the group size

    temp.raceTotalLength = temp.distanceInRace + temp.distanceToFinish;
    temp.pctOfRaceToFinish = 1 - snap.pctOfRaceComplete;
    delete temp.distanceInRace; // absolute meters aren't helpful when we're talking about a wide variety of possible lengths for a given player
    delete temp.distanceToFinish; // absolute meters aren't helpful when we're talking about a wide variety of possible lengths for a given player

    temp.negAvgSlopeCurrentDownhill = -temp.avgSlopeCurrentDownhill;
    temp.negAvgSlopeCurrentUphill = -temp.avgSlopeCurrentUphill;
    temp.currentSlope = -Math.abs(snap.avgSlopeCurrentDownhill) || Math.abs(snap.avgSlopeCurrentUphill);
    temp.instantSlope = snap.currentSlope;
    temp.heightDeltaInCurrentHill = Math.abs(snap.metersLeftToClimbCurrentUphill) || -Math.abs(snap.metersLeftToDescentCurrentDownhill);
    temp.heightDeltaRemaining = Math.abs(snap.metersLeftToClimb) || -Math.abs(snap.metersLeftToDescend);

    temp.terminalVelocityAtFtp = getTerminalVelocity(1.0, snap.currentSlope);
    temp.deltaToTerminalVelocity = snap.speed - temp.terminalVelocityAtFtp;

    if(snap.ridersAheadOfGroup <= 0) {
      // we're winning!
      temp.victoryMargin = snap.gapToGroupBehind;
      temp.victoryOrLossMargin = snap.gapToGroupBehind;
    } else {
      // not winning -> victory margin of zero
      temp.victoryMargin = 0;
      temp.victoryOrLossMargin = -Math.abs(snap.gapToGroupAhead);
    }

    delete temp.gapToHumanAhead;
    delete temp.gapToHumanBehind;
    delete temp.closeRateHumanAhead;
    delete temp.closeRateHumanBehind;
    
    // in particular, the "distance to finish", "distance in race" are going to be crap.
    // if Art does a 5km race and a 50km race in the same training set, then the 5km race's "distance" values will be 1/10th what they should be after normalization.
    const distancesPassed = [
      250,
      500,
      1000,
      1500,
      2500,
      3500,
      4500,
      5000,
      7500,
      10000,
      15000,
    ];
    
    distancesPassed.forEach((dist) => {
      temp[`distance-passed-${dist}`] = bound(0, snap.distanceInRace / dist, 1);
      temp[`distanceleft-passed-${dist}`] = bound(0, snap.distanceToFinish / dist, 1);
    });

    temp.aiRatingForDistanceCovered = getAIStrengthBoostForDistance(snap.distanceInRace);
    temp.aiRatingForMapLength = getAIStrengthBoostForDistance(temp.raceTotalLength);
    temp.aiRatingForDistanceLeft = getAIStrengthBoostForDistance(snap.distanceToFinish);
    
    temp.rankInGroup = snap.rankInGroup / snap.groupSize; // normalizing this so that it's not compared against someone that rode in a group of 30

    this._myData = [];
    let needHandleStuff = false;
    for(var key in temp) {
      if(typeof temp[key] === 'number') {
        this._myData.push({data:temp[key], name: key});
      } else if(Array.isArray(temp[key])) {
        
        switch(key) {
          case 'ftpSecondsSpentPerKm':
            /*const asNameValue = temp[key].map((val:number,index:number) => {
              return {
                name: key + '-' + index,
                data: val,
              }
            })
            this._myData.push(...asNameValue);*/
            break;
          default:
            needHandleStuff = true;
            console.log("gotta handle", key, " which had values ", temp[key]);
            break;
        }

      }
    }
    
    if(needHandleStuff) {
      debugger;
    }

    killCols.reverse().forEach((ixColToKill) => {
      this._myData.splice(ixColToKill, 1);
    });
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

export function takeTrainingSnapshot(tmNow:number, user:User, raceState:RaceState):TrainingSnapshotV2|null {
  const ret:TrainingSnapshotV2 = {
    tm: new Date().getTime(),
    version: "2",
  } as any;

  const map:RideMap = raceState.getMap();
  
  if(user.getDistance() >= map.getLength() || user.isFinished()) {
    // they're done, so no snapshot to be done
    return null;
  }
  if(raceState.isAllRacersFinished(tmNow)) {
    return null;
  }
  if(user.isFinished()) {
    return null;
  }
  if(user.getDistance() <= 50) {
    return null;
  }
  
  const dist = user.getDistance();

  ret.speed = user.getSpeed();
  ret.currentSlope = user.getLastSlopeInWholePercent();
  ret.ftpSecondsSavedPerKm = user.getHandicapSecondsSaved() / dist;
  ret.ftpSecondsSpentPerKm = [];
  const spent = user.getHandicapSecondsUsed();
  for(var key in spent) {
    ret.ftpSecondsSpentPerKm.push(spent[key] / dist);
  }
  ret.currentDraftPct = user.getLastWattsSaved().pctOfMax;
  ret.currentDrafteeCount = user.getDrafteeCount(tmNow);

  const drafteeIds = user.getDrafteeIds(tmNow);
  let usersOrNulls:(UserInterface|null)[] = drafteeIds.map((id) => raceState.getUserProvider().getUser(id));
  let users:UserInterface[] = usersOrNulls.filter((u) => u) as UserInterface[];
  users.sort((a:UserInterface, b:UserInterface) => a.getDistance() > b.getDistance() ? -1 : 1);
  ret.closestDrafteeFtpSecondsSavedPerKm = (users && users.length > 0 && users[0]?.getHandicapSecondsSaved() || 0) / dist;



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

  ret.biggestLeechInGroupFtpSecondsSavedPerKm = Math.max(0, ...group.group.filter((u) => u.getId() !== user.getId()).map((u) => u.getHandicapSecondsSaved() / dist));
  ret.groupSize = group.group.length;
  ret.rankInGroup = group.ixYou;
  ret.ridersAheadOfGroup = group.ridersAheadOfGroup;


  ret.powerNextSecond = -1; // this needs to get filled in on our next cycle

  return ret;
}
export function trainingSnapshotToAILabel(data:TrainingSnapshotV2|any, index:number, array:TrainingSnapshotV2[]):number[] {

  let sum = 0;
  let count = 0;
  const N = 5;

  let lastDistance = array[index].distanceInRace;
  for(var x = index; x < Math.min(array.length, index+N); x++) {
    if(array[x].distanceInRace < lastDistance) {
      // since the TrainingSnapshot array is ALL the races this person has participated in, if it goes backwards that means we're on a new race
      break;
    }
    sum += array[x].powerNextSecond;
    count++;
  }
  return [sum / count];
}
export function trainingSnapshotToAIInput(data:TrainingSnapshotV2|any, killCols:number[]):DataWithName[] {
  return new TrainingDataPrepped(data, killCols)._myData;
}

export enum BrainLocation {
  ForTraining,
  Deployed,
}

export function brainPath(brain:string, location:BrainLocation):string {
  switch(location) {
    case BrainLocation.Deployed:
      return `./deploy-brains/${brain}`;
    default:
    case BrainLocation.ForTraining:
      return `./brains/${brain}`;
  }
}


export function removeBoringColumns(data:DataWithName[][]):{allInputDatasAsNumbers:number[][], killCols:number[]} {
  const cols = data[0].length;

  let killCols:number[] = [];
  for(var ixCol = 0; ixCol < cols; ixCol++) {
    console.log("working on col ", ixCol);
    let colMax = Math.max(...data.map((row) => row[ixCol].data));
    let colMin = Math.min(...data.map((row) => row[ixCol].data));
    if(colMin === colMax) {
      console.error("Data column ", data[0][ixCol].name, " is bad");
      killCols.push(ixCol);
    }
  }

  const allInputDatasAsNumbers = data.map((row) => {
    let ret = [];
    let lastCol = -1;
    killCols.forEach((ixKillCol) => {
      ret.push(...row.slice(lastCol+1, ixKillCol).map((dt) => dt.data));
      lastCol = ixKillCol;
    })
    ret.push(...row.slice(lastCol+1, row.length).map((dt) => dt.data));

    ret.forEach((val) => {
      assert2(!isNaN(val) && val >= -10000);
    });
    return ret;
  });

  return {
    allInputDatasAsNumbers,
    killCols,
  }
}