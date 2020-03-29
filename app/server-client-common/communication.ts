import { RaceState, UserProvider } from "./RaceState";
import { User, UserTypeFlags } from "./User";
import { assert2 } from "./Utils";
import { RideMap, RideMapElevationOnly } from "./RideMap";
import { ServerGame } from "./ServerGame";



export enum BasicMessageType {
  ClientToServerUpdate,
  ClientConnectionRequest,
  ClientConnectionResponse,
  ServerError,
  S2CPositionUpdate,
  S2CNameUpdate,
  S2CFinishUpdate,
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
    switch(serverGame.getLastRaceState()) {
      case CurrentRaceState.PreRace:
        tmNextState = serverGame.getRaceScheduledStartTime();
        msUntil = Math.max(0, tmNextState - tmNow);
        break;
    }

    this.state = serverGame.getLastRaceState();
    this.msUntilNextState = msUntil;
    this.tmOfNextState = tmNextState;
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
      this.rankings.push(index+1);
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
      this.distances.push(sampleDistance);
      this.elevations.push(elev);
    }
  }

  distances:number[];
  elevations:number[];
}

export interface ClientConnectionRequest {
  riderName:string; // name of your rider.  So the "Jones Household" account might have riders "SarahJones" and "GeorgeJones"
  accountId:string;
  riderHandicap:number;
  gameId:string;
} 
export interface ClientConnectionResponse {
  yourAssignedId:number; // given your name/account combo, here's an id for your rider
  map:ServerMapDescription; // here's the map we're riding on.
}

export class S2CNameUpdate {

  constructor(tmNow:number, provider:UserProvider) {
    const users = provider.getUsers(tmNow);

    this.names = [];
    this.ids = [];
    users.forEach((user) => {
      this.names.push(user.getName());
      this.ids.push(user.getId());
    })
  }

  names: string[];
  ids: number[];
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

export class ServerHttpGameListElement {
  constructor(tmNow:number, game:ServerGame) {
    this.name = game.raceState.getGameId();
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
    this.elevations = [];
    for(var x = 0;x < 100; x++) {
      const pct = x / n;
      
      const elev = map.getElevationAtDistance(pct*mapLen);
      this.elevations.push(elev);
    }
  }
  name: string;
  status: CurrentRaceState;
  tmScheduledStart: number;
  tmActualStart: number;
  whoIn: string[];
  whoInAi: string[];
  elevations: number[];
}
export interface ServerHttpGameList {
  races: ServerHttpGameListElement[];
}