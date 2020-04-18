import { RaceState, UserProvider } from "./RaceState";
import { User, UserTypeFlags } from "./User";
import { assert2 } from "./Utils";
import { RideMap, RideMapElevationOnly, RideMapPartial } from "./RideMap";
import { ServerGame } from "./ServerGame";



export enum BasicMessageType {
  ClientToServerUpdate,
  ClientConnectionRequest,
  ClientConnectionResponse,
  ServerError,
  S2CPositionUpdate,
  S2CNameUpdate,
  S2CFinishUpdate,
  S2CImageUpdate,
}

export enum CurrentRaceState {
  PreRace,
  Racing,
  PostRace,
}

export interface C2SBasicMessage {
  type:BasicMessageType;
  payload:any; // check type, then cast to the appropriate message
}
export interface S2CBasicMessage {
  timeStamp:number;
  type:BasicMessageType;
  raceState:S2CRaceStateUpdate;
  payload:any; // check type, then cast to the appropriate message
}

export interface ServerError {
  text:string;
  stack:string;
}

export interface S2CPositionUpdateUser {
  id:number;
  distance:number;
  speed:number;
  power:number;
}
export interface S2CPositionUpdate {
  clients: S2CPositionUpdateUser[];
}
export class S2CRaceStateUpdate {
  constructor(tmNow:number, serverGame:ServerGame) {
    let msUntil = -1;
    let tmNextState = -1;

    if(serverGame) {
      switch(serverGame.getLastRaceState()) {
        case CurrentRaceState.PreRace:
          tmNextState = serverGame.getRaceScheduledStartTime();
          msUntil = Math.max(0, tmNextState - tmNow);
          break;
      }
      this.state = serverGame.getLastRaceState();
      this.msUntilNextState = msUntil;
      this.tmOfNextState = tmNextState;
    } else {
      this.state = CurrentRaceState.PreRace;
      this.msUntilNextState = 0;
      this.tmOfNextState = 0x7fffffff;
    }

  }
  state:CurrentRaceState;
  msUntilNextState:number;
  tmOfNextState:number;
}
export class S2CFinishUpdate {
  constructor(provider:UserProvider, tmRaceStart:number) {
    const tmNow = new Date().getTime();

    const users = provider.getUsers(tmNow);
    users.sort((u1, u2) => {
      if(!u1.isFinished()) {
        return 1;
      } else {
        if(!u2.isFinished()) {
          return 1;
        }

        return u1.getRaceTimeSeconds(tmRaceStart) < u2.getRaceTimeSeconds(tmRaceStart) ? -1 : 1;
      }
    })

    this.rankings = [];
    this.times = [];
    users.forEach((user, index) => {
      this.rankings.push(user.getId());
      this.times.push(user.getRaceTimeSeconds(tmRaceStart));
    })
  }
  rankings: number[];
  times: number[];
}


export class ServerMapDescription {
  constructor(map:RideMapElevationOnly) {
    const n = 2000;
    const endLength = map.getLength();

    this.distances = [];
    this.elevations = [];
    for(var x = 0;x < n; x++) {
      const sampleDistance = (x/n)*endLength;
      const elev = map.getElevationAtDistance(sampleDistance);
      if(isFinite(elev) && isFinite(sampleDistance)) {
        this.distances.push(sampleDistance);
        this.elevations.push(elev);
      } else {
        assert2(false, "Why are these elevations not finite?");
      }
    }
  }

  distances:number[];
  elevations:number[];
}

export interface ClientConnectionRequest {
  riderName:string; // name of your rider.  So the "Jones Household" account might have riders "SarahJones" and "GeorgeJones"
  imageBase64:string|null; // image of your rider
  accountId:string;
  riderHandicap:number;
  gameId:string;
} 
export interface ClientConnectionResponse {
  yourAssignedId:number; // given your name/account combo, here's an id for your rider
  map:ServerMapDescription; // here's the map we're riding on.
}

export class S2CImageUpdate {

  constructor(user:User) {
    this.id = user.getId();

    const image = user.getImage();
    if(!image) {
      throw new Error("You're trying to send an image update for a user without an image?");
    }
    this.imageBase64 = image;
  }

  id:number;
  imageBase64:string;
}
export class S2CNameUpdate {

  constructor(tmNow:number, provider:UserProvider) {
    const users = provider.getUsers(tmNow);

    this.names = [];
    this.ids = [];
    this.userTypes = [];
    this.userHandicaps = [];
    users.forEach((user) => {
      this.names.push(user.getName());
      this.ids.push(user.getId());
      this.userTypes.push(user.getUserType());
      this.userHandicaps.push(user.getHandicap());
    })
  }

  names: string[];
  ids: number[];
  userTypes: number[];
  userHandicaps: number[];
}

export class ClientToServerUpdate {
  constructor(raceState:RaceState) {
    const localGuy = raceState.getLocalUser();
    if(!localGuy) {
      throw new Error("Can't build a ClientToServerUpdate without a local player!");
    }
    this.gameId = raceState.getGameId();
    this.userId = localGuy.getId();
    assert2(this.userId >= 0, "We can't really tell the server about our user unless we know his id...");
    this.lastPower = localGuy.getLastPower();
  }
  gameId:string;
  userId:number;
  lastPower:number;
}

export function getElevationFromEvenSpacedSamples(meters:number, lengthMeters:number, elevations:number[]) {
  const pctRaw = meters / lengthMeters;
  const n = elevations.length - 1;
  if(pctRaw < 0) {
    return elevations[0];
  } else if(pctRaw >= 1) {
    return elevations[n - 1];
  } else {
    const ixLeft = Math.floor(pctRaw * n);
    const ixRight = ixLeft + 1;
    assert2(ixLeft >= 0 && ixLeft <=  elevations.length - 2);
    assert2(ixRight >= 0 && ixRight <=  elevations.length - 1);

    const distLeft = (ixLeft / n)*lengthMeters;
    const distRight = (ixRight / n)*lengthMeters;
    const elevLeft = elevations[ixLeft];
    const elevRight = elevations[ixRight];

    const offset = meters - distLeft;
    const span = distRight - distLeft;
    const pct = offset / span;
    assert2(pct >= -0.001 && pct <= 1.001);
    assert2(offset >= -0.001);
    assert2(distRight > distLeft);
    return pct*elevRight + (1-pct)*elevLeft;
  }

}

// a wrapper class to start translating a ScheduleRacePostRequest into a map we can actually load and ride
export class SimpleElevationMap extends RideMapPartial {
  elevations:number[];
  lengthMeters:number;
  constructor(elevations:number[], lengthMeters:number) {
    super();
    this.elevations = elevations;
    this.lengthMeters = lengthMeters;

    elevations.forEach((elev) => {
      assert2(isFinite(elev));
    })
  }
  getElevationAtDistance(meters: number): number {
    const ret = getElevationFromEvenSpacedSamples(meters, this.lengthMeters, this.elevations);
    assert2(isFinite(ret));
    return ret;
  }
  getLength(): number {
    return this.lengthMeters;
  }
}

export class ServerHttpGameListElement {
  constructor(tmNow:number, game:ServerGame) {
    this.gameId = game.raceState.getGameId();
    this.displayName = game.getDisplayName();
    this.status = game.getLastRaceState();
    this.tmScheduledStart = game.getRaceScheduledStartTime();
    this.tmActualStart = game.getRaceStartTime();
    this.whoIn = game.userProvider.getUsers(tmNow).filter((user) => {
      return !(user.getUserType() & UserTypeFlags.Ai);
    }).map((user) => user.getName());
    this.whoInAi = game.userProvider.getUsers(tmNow).filter((user) => {
      return user.getUserType() & UserTypeFlags.Ai;
    }).map((user) => user.getName());

    const n = 100;
    const map = game.raceState.getMap();
    const mapLen = map.getLength();
    this.lengthMeters = mapLen;
    this.elevations = [];
    for(var x = 0;x < 100; x++) {
      const pct = x / n;
      
      const elev = map.getElevationAtDistance(pct*mapLen);
      this.elevations.push(elev);
    }
  }
  gameId: string;
  displayName: string;
  status: CurrentRaceState;
  tmScheduledStart: number;
  tmActualStart: number;
  whoIn: string[];
  whoInAi: string[];
  elevations: number[];
  lengthMeters: number;
}
export interface ServerHttpGameList {
  races: ServerHttpGameListElement[];
}