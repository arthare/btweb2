import WebSocket from 'ws';
import { ClientToServerUpdate, BasicMessage, BasicMessageType, ClientConnectionRequest, ServerMapDescription, ClientConnectionResponse, ServerError, S2CPositionUpdate, S2CNameUpdate } from '../app/server-client-common/communication';
import { assert2 } from '../app/server-client-common/Utils';
import { RaceState, UserProvider } from '../app/server-client-common/RaceState';
import { User, UserTypeFlags } from '../app/server-client-common/User';
import { RideMapHandicap } from '../app/server-client-common/RideMapHandicap';
import { RideMap, RideMapPartial } from '../app/server-client-common/RideMap';
import { makeSimpleMap } from './ServerUtils';
import { SERVER_PHYSICS_FRAME_RATE } from './ServerConstants';

const wss = new WebSocket.Server({
  port: 8080,
});


class ServerUser extends User {
  _tmLastNameSent:number;

  constructor(name:string, massKg:number, handicap:number, typeFlags:number) {
    super(name, massKg, handicap, typeFlags);
  }

  noteLastNameUpdate(tmWhen:number) {
    this._tmLastNameSent = tmWhen;
  }
  getLastNameUpdate():number {
    return this._tmLastNameSent;
  }
}

let userIdCounter = 0;
const userIdToUserMap:Map<number, ServerUser> = new Map<number,ServerUser>();
class ServerUserProvider implements UserProvider {
  constructor() {
    this.users = [];
  }
  getUsers(): User[] {
    return this.users;
  }
  getUser(id:number):User|null {
    return this.users.find((user) => user.getId() === id);
  }
  addUser(ccr:ClientConnectionRequest):number {
    let newId = userIdCounter++;
    const user = new ServerUser(ccr.riderName, 80, ccr.riderHandicap, UserTypeFlags.Remote);
    user.setId(newId);
    this.users.push(user);
    userIdToUserMap.set(newId, user);
    return newId;    
  }

  users:ServerUser[];
}



class ServerGame {
  constructor(map:RideMap, gameId:string) {
    this.userProvider = new ServerUserProvider();
    this.raceState = new RaceState(map, this.userProvider, gameId);
    this._timeout = null;
  }
  start() {
    this._scheduleTick();
  }
  private _tick() {
    const tmNow = new Date().getTime();
    this.raceState.tick(tmNow);

    this._scheduleTick();
  }
  private _scheduleTick() {
    this._timeout = setTimeout(() => this._tick(), 1000 / SERVER_PHYSICS_FRAME_RATE);
  }
  private _timeout:any;
  raceState:RaceState;
  userProvider:ServerUserProvider;
}
function sendError(socket:WebSocket, errorMessage:string) {
  const ret:BasicMessage = {
    type: BasicMessageType.ServerError,
    payload: <ServerError>{
      text: errorMessage,
      stack: new Error().stack.toString(),
    }
  }
  socket.send(JSON.stringify(ret));
}

function sendResponse(ws:WebSocket, type:BasicMessageType, msg:ClientConnectionResponse|S2CPositionUpdate|S2CNameUpdate) {
  const bm:BasicMessage = {
    type,
    payload: msg,
  }
  return ws.send(JSON.stringify(bm));
}

class Rng {
  _seed = 1;
  next(max:number):number {
    var x = Math.sin(this._seed++) * 10000;
    const r = x - Math.floor(x);
    return Math.floor(max*r);
  }
}



const games:Map<string, ServerGame> = new Map<string, ServerGame>();
const map = makeSimpleMap();
const sg = new ServerGame(map, 'asdf');
games.set('asdf', sg);
sg.start();


const lastSentTo:Map<number,Rng> = new Map<number,Rng>();
function buildClientPositionUpdate(centralUser:User, userList:UserProvider, n:number):S2CPositionUpdate {
  const users = userList.getUsers();

  if(!lastSentTo.has(centralUser.getId())) {
    lastSentTo.set(centralUser.getId(), new Rng());
  }
  const lastSeed = lastSentTo.get(centralUser.getId()) || new Rng();
  
  const ret:S2CPositionUpdate = {
    clients: [],
  };

  for(var x = 0;x < n; x++) {
    const r = lastSeed.next(users.length);
    const u:User = users[r];
    ret.clients.push({
      id:u.getId(),
      distance:u.getDistance(),
      speed:u.getSpeed(),
      power:u.getLastPower(),
    })
  }
  return ret;
}

wss.on('connection', (wsConnection) => {
  console.log("server got connection from ", wsConnection.url);
  wsConnection.onmessage = (event:WebSocket.MessageEvent) => {

    let bm:BasicMessage;
    try {
      const str = event.data.toString('utf8');
      bm = JSON.parse(str);
    } catch(e) {
      return sendError(wsConnection, "Failed to parse incoming message");
    }
    
    switch(bm.type) {
      case BasicMessageType.ClientConnectionRequest:
      {
        const payload:ClientConnectionRequest = <ClientConnectionRequest>bm.payload;
        const game = games.get(payload.gameId);
        if(!game) {
          return sendError(wsConnection, "Game ID " + payload.gameId +" not found");
        }
        // ok, so they want to join this game
        let newId = game.userProvider.addUser(payload);
        assert2(newId >= 0);
        // and we need to produce a response

        const ret:ClientConnectionResponse = {
          yourAssignedId:newId,
          map: new ServerMapDescription(game.raceState.getMap()),
        }
        return sendResponse(wsConnection, BasicMessageType.ClientConnectionResponse, ret);
      }
      case BasicMessageType.ClientToServerUpdate:
      {
        const payload:ClientToServerUpdate = <ClientToServerUpdate>bm.payload;
        console.log("we've been told ", payload);
        const user = userIdToUserMap.get(payload.userId);
        if(user) {
          user.notifyPower(new Date().getTime(), payload.lastPower);
        } else {
          throw new Error("How are we hearing about a user that has never registered?");
        }

        // let's make a server to client message that tells them about some local dudes
        const game = games.get(payload.gameId);

        const tmNow = new Date().getTime();
        const tmSinceName = user && (tmNow - user.getLastNameUpdate()) || 0x7fffffff;
        if(tmSinceName >= 30000) {
          console.log("been ", tmSinceName, " since last name update for ", user.getName());
          const response:S2CNameUpdate = new S2CNameUpdate(game.userProvider);
          user.noteLastNameUpdate(tmNow);
          return sendResponse(wsConnection, BasicMessageType.S2CNameUpdate, response);
        } else {
          console.log("doing a position update for user ", user.getName());
          const response:S2CPositionUpdate = buildClientPositionUpdate(user, game.userProvider, 16);
  
          return sendResponse(wsConnection, BasicMessageType.S2CPositionUpdate, response);
        }
      }
      case BasicMessageType.ClientConnectionResponse:
        assert2(false, "The server should NEVER receive this message");
        break;

    }
  };
});
