import { useEffect, useRef, useState } from "react";
import { tickGameAnimationFrame } from "../AppRace";
import { DecorationFactory } from "../tourjs-client-shared/DecorationFactory";
import { DecorationState } from "../tourjs-client-shared/DecorationState";
import { defaultThemeConfig } from "../tourjs-client-shared/drawing-constants";
import { createDrawer } from "../tourjs-client-shared/drawing-factory";
import { PaintFrameState } from "../tourjs-client-shared/drawing-interface";
import { ServerMapDescription } from "../tourjs-shared/communication";
import { RaceState } from "../tourjs-shared/RaceState";
import { PureCosineMap, RideMap, RideMapElevationOnly } from "../tourjs-shared/RideMap";
import { RideMapHandicap } from "../tourjs-shared/RideMapHandicap";
import { UserInterface, UserTypeFlags } from "../tourjs-shared/User";
import { FakeUserProvider, setupRace } from "../UtilsGameStarter";
import './InRaceView.scss';
import HumanGroupMember from '../AppImg/no-face.png';
import RobotGroupMember from '../AppImg/robot.png';
import { updateIf } from "typescript";
import { TimeDisplay } from "./PreRaceView";

interface LeaderboardGroup {
  distanceOfLeader:number;
  distanceOfLast:number;
  name:string;
  localCount:number;
  humanCount:number;
  groupSize:number;
  leadUser:UserInterface;
  tailUser:UserInterface;
  humanIcons:any[];
  robotIcons:any[];
}
interface RawLeaderboardGroup {
  users: UserInterface[];
}

function sortUsersByLeadership(map:RideMapElevationOnly, users:UserInterface[]) {
  
  const len = map.getLength();
  const sorted =[...users].sort((a, b) => {
    // returns 1 for the losingest user of A and B
    const aDist = a.getDistance();
    const bDist = b.getDistance();
    if(aDist < len && bDist < len) {
      // both riders haven't finished
      return a.getDistance() > b.getDistance() ? 1 : -1
    } else {
      // one or both of the riders has finished
      if(aDist < len) {
        // A hasn't finished, B has
        return 1;
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
function sortUsersByInterestingness(users:UserInterface[]) {

  function scoreUser(user:UserInterface) {
    let score = 0;
    const isAi = user.getUserType() & UserTypeFlags.Ai;
    const isLocal = user.getUserType() & UserTypeFlags.Local;
    if(isAi) {
      return 1;
    } else {
      return isLocal ? 4 : 2;
    }
  }

  return [...users].sort((a, b) => {
    const scoreA = scoreUser(a);
    const scoreB = scoreUser(b);
    if(scoreA === scoreB) {
      return a.getDistance() > b.getDistance() ? -1 : 1;
    }
    return scoreA > scoreB ? -1 : 1;
  })
}

function compactGroups(groups:RawLeaderboardGroup[], isSameGroup:(a:RawLeaderboardGroup, b:RawLeaderboardGroup)=>boolean):RawLeaderboardGroup[] {
  let ret:RawLeaderboardGroup[] = [];
  
  let accumGroup = groups[0];
  for(var candidateGroup of groups.slice(1)) {
    const isSame = isSameGroup(accumGroup, candidateGroup);
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

function processIntoGroups(map:RideMapElevationOnly, users:UserInterface[]):LeaderboardGroup[] {
  
  // sorted with dead-last rider at position 0
  const sorted = sortUsersByLeadership(map, users);
  let lastDist = sorted[0].getDistance();

  let rawGroups:RawLeaderboardGroup[] = sorted.map((u) => {return {users: [u]}});

  // so we've bundled everyone into chunks by distance or finished state.  but that's not all!
  const isSameByDistance = (a:RawLeaderboardGroup, b:RawLeaderboardGroup):boolean => {
    const isAllFinishedA = a.users.every((user) => user.getDistance() >= map.getLength());
    const isAllFinishedB = b.users.every((user) => user.getDistance() >= map.getLength());
    if(isAllFinishedA && isAllFinishedB) {
      return true;
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
  const isSameInAiMode = (a:RawLeaderboardGroup, b:RawLeaderboardGroup):boolean => {
    // if we're in AI mode, then we generally don't compact groups
    return isSameByDistance(a,b);
  }
  const isSameWithOtherHumans = (a:RawLeaderboardGroup, b:RawLeaderboardGroup):boolean => {
    // when we're riding with other humans in the game, then sequences of separate AI groups should get compacted no matter what
    const isAllAisA = a.users.every((user) => user.getUserType() & UserTypeFlags.Ai);
    const isAllAisB = b.users.every((user) => user.getUserType() & UserTypeFlags.Ai);
    if(isAllAisA && isAllAisB) {
      return true;
    } else {
      return isSameByDistance(a, b);
    }
  }

  const humans = users.filter((u) => !(u.getUserType() & UserTypeFlags.Ai));
  if(humans.length <= 1) {
    rawGroups = compactGroups(rawGroups, isSameInAiMode);
  } else {
    rawGroups = compactGroups(rawGroups, isSameWithOtherHumans);
  }

  return rawGroups.map((rawGroup) => {
    const usersByDistance = sortUsersByLeadership(map, rawGroup.users);
    const usersByCoolness = sortUsersByInterestingness(rawGroup.users);
    const localusers = rawGroup.users.filter((u) => u.getUserType() & UserTypeFlags.Local);
    const humanUsers = rawGroup.users.filter((u) => !(u.getUserType() & UserTypeFlags.Ai));
    const aiUsers = rawGroup.users.filter((u) => (u.getUserType() & UserTypeFlags.Ai));
    
    return {
      distanceOfLeader:usersByDistance[usersByDistance.length - 1].getDistance(),
      distanceOfLast:usersByDistance[0].getDistance(),
      name:`Gr. ${usersByCoolness[0].getName()}`,
      localCount: localusers.length,
      humanCount:humanUsers.length,
      groupSize:rawGroup.users.length,
      leadUser:usersByDistance[usersByDistance.length - 1],
      tailUser:usersByDistance[0],
      humanIcons: humanUsers.map((u) => u.getImage() || HumanGroupMember),
      robotIcons: aiUsers.map((u) => u.getImage() || RobotGroupMember),
    }
  });
}

function InRaceLeaderboardGroup(props:{group:LeaderboardGroup}) {

  let groupName = props.group.name;

  let className = `${props.group.humanCount > 0 ? 'Human' : ''} ${props.group.localCount > 0 ? 'Local' : ''}`;
  const icons = [...props.group.humanIcons, ...props.group.robotIcons].slice(0,5);


  return <div className={`InRaceLeaderboardGroup__Container ${className}`}>
    <div className="InRaceLeaderboardGroup__Leader">{groupName}</div>
    <div className="InRaceLeaderboardGroup__Data">{props.group.distanceOfLeader.toFixed(0)}m</div>
    <div className="InRaceLeaderboardGroup__Who">{icons.map((icon, index) => <img key={index} src={icon} className="InRaceLeaderboardGroup__GroupMember" />)}</div>
  </div>
}

function determineDistanceToGroup(tmNow:number, localUser:UserInterface, group:LeaderboardGroup):number|null {

  const sNow = tmNow / 1000;
  if(group.localCount > 0) {
    return 0;
  } else if(group.distanceOfLeader < localUser.getDistance()) {
    // this group is behind us, so we should have a gap
    return localUser.getSecondsAgoToCross(tmNow, group.distanceOfLeader);
  } else {
    // this group is ahead of us, so we should use its tail-user's gap calc
    return group.tailUser.getSecondsAgoToCross(tmNow, localUser.getDistance());
  }

}

function InRaceLeaderboardGap(props:{raceState:RaceState, tmNow:number, leftGroup:LeaderboardGroup, rightGroup:LeaderboardGroup}) {
  const localUser = props.raceState.getUserProvider().getLocalUser();
  if(localUser) {

    let timeAtLeft = determineDistanceToGroup(props.tmNow, localUser, props.leftGroup);
    let timeAtRight = determineDistanceToGroup(props.tmNow, localUser, props.rightGroup);

    if(timeAtLeft !== null && timeAtRight !== null) {
      const gap = timeAtRight - timeAtLeft;
      return <div className="InRaceLeaderboardGap__Container">
        <div>↔</div>
        <TimeDisplay ms={gap*1000} />
      </div>
    }
  }
  return <div className="InRaceLeaderboardGap__Container">
    <div>↔</div>
  </div>
}

function InRaceLeaderboard(props:{frames:number, tmNow:number, raceState:RaceState}) {

  const users = props.raceState.getUserProvider().getUsers(props.tmNow);
  const groups = processIntoGroups(props.raceState.getMap(), users);
  return <div className="InRaceLeaderboard__Container">
    {groups.map((group, index) => {
      return (<>
        <InRaceLeaderboardGroup group={group} />
        {index < groups.length - 1 && (
          <InRaceLeaderboardGap tmNow={props.tmNow} raceState={props.raceState} leftGroup={group} rightGroup={groups[index+1]} />
        )}
      </>)
    })}
  </div>
}

export default function InRaceView(props:{raceState:RaceState}) {
  const canvasRef = useRef<HTMLCanvasElement>();
  
  let [frames, setFrames] = useState<number>(0);
  let [tm, setTm] = useState<number>(0);

  useEffect(() => {
    // startup: let's get our game state up and running
    if(canvasRef?.current) {
      canvasRef.current.width = canvasRef?.current?.clientWidth;
      canvasRef.current.height = canvasRef?.current?.clientHeight;
      const drawer = createDrawer("3d");

      const decFactory = new DecorationFactory(defaultThemeConfig);
      const decState = new DecorationState(props.raceState.getMap(), decFactory);
      const paintState = new PaintFrameState();
      
      requestAnimationFrame((tm) => {
        tickGameAnimationFrame(tm, tm, drawer, decState, paintState, canvasRef, props.raceState, ()=>{}, (tmFrame, frame)=>{
          setTm(tmFrame);
          const tenthFrames = Math.floor(frame / 20);
          if(tenthFrames !== frames) {
            setFrames(tenthFrames)
          }
        })
      });
    }
  }, [canvasRef]);

  return <div className="InRaceView__Container">
      <canvas ref={canvasRef}  className="InRaceView__Canvas"/>
      <div className="InRaceView__Leaderboard-Container">
        {props.raceState && <InRaceLeaderboard frames={frames} raceState={props.raceState} tmNow={tm} />}
      </div>
    </div>
}