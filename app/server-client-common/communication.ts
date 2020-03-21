import { RaceState, UserProvider } from "./RaceState";
import { User } from "./User";
import { assert2 } from "./Utils";
import { RideMap, RideMapElevationOnly } from "./RideMap";



export enum BasicMessageType {
  ClientToServerUpdate,
  ClientConnectionRequest,
  ClientConnectionResponse,
  ServerError,
  S2CPositionUpdate,
  S2CNameUpdate,
}
export interface BasicMessage {
  type:BasicMessageType;
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

  constructor(provider:UserProvider) {
    const users = provider.getUsers();

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