import { RaceState } from "../tourjs-shared/RaceState";
import { RideMapElevationOnly } from "../tourjs-shared/RideMap";
import { UserInterface, UserTypeFlags } from "../tourjs-shared/User";
import { assert2 } from "../tourjs-shared/Utils";
import { DistanceDisplay, TimeDisplay } from "./PreRaceView";
import HumanGroupMember from '../AppImg/no-face.png';
import RobotGroupMember from '../AppImg/robot.png';
import FinishGroupMember from '../AppImg/finishline.png';

interface LeaderboardGroup {
  distanceOfLeader:number;
  distanceOfLast:number;
  name:string;
  localCount:number;
  humanCount:number;
  groupSize:number;
  leadUser:UserInterface|null;
  tailUser:UserInterface|null;
  humanIcons:any[];
  robotIcons:any[];
}
interface RawLeaderboardGroup {
  users: UserInterface[];
}

function sortUsersByLeadership(map:RideMapElevationOnly, users:UserInterface[]) {
  
  const len = map.getLength();
  const sorted = [...users];
  sorted.sort((a, b) => {
    // returns -1 for the losingest user of A and B
    const aDist = a.getDistance();
    const bDist = b.getDistance();
    if(aDist < len && bDist < len) {
      // both riders haven't finished
      return a.getDistance() < b.getDistance() ? -1 : 1
    } else {
      // one or both of the riders has finished
      if(aDist < len) {
        // A hasn't finished, B has
        return -1;
      } else if(bDist < len) {
        // B hasn't finished, A has
        return 1;
      } else {
        // they've both finished, sort by name
        return a.getName() < b.getName() ? -1 : 1;
      }
    }
  });
  return sorted;
}
export function scoreUserInterestingNess(user:UserInterface) {
  let score = 0;
  const isAi = user.getUserType() & UserTypeFlags.Ai;
  const isLocal = user.getUserType() & UserTypeFlags.Local;
  if(isAi) {
    return 1;
  } else {
    return isLocal ? 4 : 2;
  }
}
function sortUsersByInterestingness(users:UserInterface[]) {


  return [...users].sort((a, b) => {
    const scoreA = scoreUserInterestingNess(a);
    const scoreB = scoreUserInterestingNess(b);
    if(scoreA === scoreB) {
      return a.getDistance() > b.getDistance() ? -1 : 1;
    }
    return scoreA > scoreB ? -1 : 1;
  })
}

function compactGroups(map:RideMapElevationOnly, groups:RawLeaderboardGroup[], isSameGroup:(map:RideMapElevationOnly, a:RawLeaderboardGroup, b:RawLeaderboardGroup)=>boolean):RawLeaderboardGroup[] {
  let ret:RawLeaderboardGroup[] = [];
  
  let accumGroup = groups[0];
  for(var candidateGroup of groups.slice(1)) {
    const isSame = isSameGroup(map, accumGroup, candidateGroup);
    if(isSame) {
      accumGroup.users.push(...candidateGroup.users);
    } else {
      ret.push(accumGroup);
      accumGroup = candidateGroup;
    }
  }

  if(accumGroup.users.length > 0) {
    ret.push(accumGroup);
  }

  return ret;
}

// so we've bundled everyone into chunks by distance or finished state.  but that's not all!
const isSameByDistance = (map:RideMapElevationOnly, a:RawLeaderboardGroup, b:RawLeaderboardGroup):boolean => {
  const isAllFinishedA = a.users.every((user) => user.getDistance() >= map.getLength());
  const isAllFinishedB = b.users.every((user) => user.getDistance() >= map.getLength());
  if(isAllFinishedA && isAllFinishedB) {
    return true;
  } else if(isAllFinishedB !== isAllFinishedA) {
    // some are finished, some are not.  don't combine still-riding users with the finish
    return false;
  } else {
    const leadA = a.users[a.users.length - 1];
    const tailA = a.users[0];
    const leadB = b.users[b.users.length - 1];
    const tailB = b.users[0];
    
    const deltaAAhead = tailA.getDistance() - leadB.getDistance();
    const deltaBAhead = tailB.getDistance() - leadA.getDistance();
    
    if(deltaAAhead > 10) {
      // a is clearly ahead
      return false;
    } else if(deltaAAhead >= 0) {
      // A is ahead, but this should be merged
      return true;
    } else if(deltaBAhead > 10) {
      // B is clearly ahead
      return false;
    } else if(deltaBAhead >= 0) {
      // B is ahead, but should be merged
      return true;
    } else {
      // err...
      debugger;
      return false;
    }
  }

}
const isSameInAiMode = (map:RideMapElevationOnly, a:RawLeaderboardGroup, b:RawLeaderboardGroup):boolean => {
  // if we're in AI mode, then we generally don't compact groups
  return isSameByDistance(map, a,b);
}
const isSameWithOtherHumans = (map:RideMapElevationOnly, a:RawLeaderboardGroup, b:RawLeaderboardGroup):boolean => {
  // when we're riding with other humans in the game, then sequences of separate AI groups should get compacted no matter what
  const isAllAisA = a.users.every((user) => user.getUserType() & UserTypeFlags.Ai);
  const isAllAisB = b.users.every((user) => user.getUserType() & UserTypeFlags.Ai);
  const isAllFinishedA = a.users.every((user) => user.getDistance() >= map.getLength());
  const isAllFinishedB = b.users.every((user) => user.getDistance() >= map.getLength());
  if(isAllAisA && isAllAisB && isAllFinishedA === isAllFinishedB) {
    return true;
  } else {
    return isSameByDistance(map, a, b);
  }
}
function processIntoGroups(map:RideMapElevationOnly, users:UserInterface[]):LeaderboardGroup[] {
  
  // sorted with dead-last rider at position 0
  const sorted = sortUsersByLeadership(map, users);
  let lastDist = sorted[0].getDistance();

  let rawGroups:RawLeaderboardGroup[] = sorted.map((u) => {return {users: [u]}});


  const humans = users.filter((u) => !(u.getUserType() & UserTypeFlags.Ai));
  if(humans.length <= 1) {
    rawGroups = compactGroups(map, rawGroups, isSameInAiMode);
  } else {
    rawGroups = compactGroups(map, rawGroups, isSameWithOtherHumans);
  }

  let hasFinishedUsers = false;
  let userGroups = rawGroups.map((rawGroup) => {
    const usersByDistance = sortUsersByLeadership(map, rawGroup.users);
    const usersByCoolness = sortUsersByInterestingness(rawGroup.users);
    const localusers = rawGroup.users.filter((u) => u.getUserType() & UserTypeFlags.Local);
    const humanUsers = rawGroup.users.filter((u) => !(u.getUserType() & UserTypeFlags.Ai));
    const aiUsers = rawGroup.users.filter((u) => (u.getUserType() & UserTypeFlags.Ai));
    
    assert2(usersByDistance[0].getDistance() >= map.getLength() || usersByDistance[usersByDistance.length-1].getDistance() >= usersByDistance[0].getDistance());

    let name = `${usersByCoolness[0].getName()}`;
    if(usersByDistance[usersByDistance.length - 1].getDistance() >= map.getLength()) {
      // we've got at least one user that has finished
      hasFinishedUsers = true;
      name = 'Finish';
    } else if(localusers.length > 0) {
      name = localusers[0].getName();
    }

    return {
      distanceOfLeader:usersByDistance[usersByDistance.length - 1].getDistance(),
      distanceOfLast:usersByDistance[0].getDistance(),
      name,
      localCount: localusers.length,
      humanCount:humanUsers.length,
      groupSize:rawGroup.users.length,
      leadUser:usersByDistance[usersByDistance.length - 1],
      tailUser:usersByDistance[0],
      humanIcons: humanUsers.map((u) => u.getImage() || HumanGroupMember),
      robotIcons: aiUsers.map((u) => u.getImage() || RobotGroupMember),
    }
  });

  
  const ixWithUser = userGroups.findIndex((g) => g.localCount > 0);
  if(ixWithUser >= 2 && ixWithUser < userGroups.length - 3) {
    // user is right in the middle
    userGroups = userGroups.slice(ixWithUser - 2, ixWithUser + 3);
  } else if(ixWithUser >= userGroups.length - 3) {
    // user is near the end of the groups
    userGroups = userGroups.slice(-5);
  } else {
    userGroups = userGroups.slice(0, 5);
  }
  
  const finishedGroups = userGroups.filter((g) => g.distanceOfLast >= map.getLength());
  assert2(finishedGroups.length <= 1);

  if(finishedGroups.length <= 0) {
    // after slicing to 5 entries, we don't have a finish group.  so let's put it back in
    userGroups.push({
      distanceOfLeader:map.getLength(),
      distanceOfLast:map.getLength(),
      name:`Finish`,
      localCount: 0,
      humanCount:0,
      groupSize:0,
      leadUser:null,
      tailUser:null,
      humanIcons: [FinishGroupMember],
      robotIcons: [],
    })
  }


  return userGroups;
}

function InRaceLeaderboardGroup(props:{group:LeaderboardGroup, aheadOfLocal:boolean, tm:number}) {

  let groupName = props.group.name;

  let oddEven = Math.floor(props.tm/2000) & 1 ? 'Odd' : 'Even';

  let className = `${props.group.humanCount > 0 ? 'Human' : ''} ${props.group.localCount > 0 ? 'Local' : ''}`;
  const icons = [...props.group.humanIcons, ...props.group.robotIcons].slice(0,5);

  return <div className={`InRaceLeaderboardGroup__Container ${className}`}>
    <div className={`InRaceLeaderboardGroup__Leader ${oddEven}`}>
      <p className={`InRaceLeaderboardGroup__Marquee`}>{groupName}</p>
    </div>
    <div className="InRaceLeaderboardGroup__Data"><DistanceDisplay meters={props.aheadOfLocal ? props.group.distanceOfLast : props.group.distanceOfLeader} /></div>
    <div className="InRaceLeaderboardGroup__Who">{icons.map((icon, index) => <img key={index} src={icon} className="InRaceLeaderboardGroup__GroupMember" />)}</div>
  </div>
}

function determineDistanceToGroup(tmNow:number, localUser:UserInterface, group:LeaderboardGroup):{time:number, distance:number}|null {

  const sNow = tmNow / 1000;
  if(group.localCount > 0) {
    return {time:0,distance:0};
  } else if(group.distanceOfLeader < localUser.getDistance()) {
    // this group is behind us, so we should have a gap
    return {time: localUser.getSecondsAgoToCross(tmNow, group.distanceOfLeader), distance: localUser.getDistance() - group.distanceOfLeader};
  } else {
    if(group.tailUser) {
      // this group is ahead of us (and is an actual group), so we should use its tail-user's gap calc
      return {time: group.tailUser.getSecondsAgoToCross(tmNow, localUser.getDistance()), distance: group.distanceOfLast - localUser.getDistance()};
    } else {
      return {time: null, distance: group.distanceOfLast - localUser.getDistance()}
    }
  }

}

function InRaceLeaderboardGap(props:{raceState:RaceState, tmNow:number, leftGroup:LeaderboardGroup, rightGroup:LeaderboardGroup}) {
  const localUser = props.raceState.getUserProvider().getLocalUser();
  if(localUser) {

    let timeAtLeft = determineDistanceToGroup(props.tmNow, localUser, props.leftGroup);
    let timeAtRight = determineDistanceToGroup(props.tmNow, localUser, props.rightGroup);

    let gapTime;
    let gapDistance = Math.abs(timeAtRight.distance - timeAtLeft.distance);
    if(timeAtLeft.time !== null && timeAtRight.time !== null) {
      gapTime = Math.abs(timeAtRight.time - timeAtLeft.time);
    }

    let splitChar = window.innerWidth > window.innerHeight ? '↔' : '↕';

    return <div className="InRaceLeaderboardGap__Container">
      <div><DistanceDisplay meters={gapDistance} /></div>
      <div>{splitChar}</div>
      {gapTime && gapTime !== 0 && <TimeDisplay ms={gapTime*1000} />}
    </div>
  }
  return <div className="InRaceLeaderboardGap__Container">
    <div>↔</div>
  </div>
}

export function InRaceLeaderboard(props:{frames:number, tmNow:number, raceState:RaceState}) {

  const users = props.raceState.getUserProvider().getUsers(props.tmNow);
  let groups = processIntoGroups(props.raceState.getMap(), users);
  const ixWithLocal = groups.findIndex((g) => g.localCount > 0);


  return <div className="InRaceLeaderboard__Container">
    {groups.map((group, index) => {
      return (<>
        <InRaceLeaderboardGroup group={group} aheadOfLocal={index > ixWithLocal} tm={props.tmNow} />
        {index < groups.length - 1 && (
          <InRaceLeaderboardGap tmNow={props.tmNow} raceState={props.raceState} leftGroup={group} rightGroup={groups[index+1]} />
        )}
      </>)
    })}
  </div>
}