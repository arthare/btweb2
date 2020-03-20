import WebSocket from 'ws';
import { ClientToServerUpdate, BasicMessage, BasicMessageType, ClientConnectionRequest, ServerMapDescription, ClientConnectionResponse, ServerError } from '../app/server-client-common/communication';
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

let userIdCounter = 0;
const userIdToUserMap:Map<number, User> = new Map<number,User>();
class ServerUserProvider implements UserProvider {
  constructor() {
    this.users = [];
  }
  getUsers(): User[] {
    return this.users;
  }
  addUser(ccr:ClientConnectionRequest):number {
    let newId = userIdCounter++;
    const user = new User(ccr.riderName, 80, ccr.riderHandicap, UserTypeFlags.Remote);
    user.setId(newId);
    this.users.push(user);
    userIdToUserMap.set(newId, user);
    return userIdCounter;    
  }

  users:User[];
}



class ServerGame {
  constructor(map:RideMap) {
    this.users = new ServerUserProvider();
    this.raceState = new RaceState(map, this.users);
    this._timeout = null;
  }
  start() {
    this._timeout = setTimeout(() => this._tick(), 1000 / SERVER_PHYSICS_FRAME_RATE);
  }
  private _tick() {
    const tmNow = new Date().getTime();
    this.raceState.tick(tmNow);
  }
  private _timeout:any;
  raceState:RaceState;
  users:ServerUserProvider;
}



const games:Map<string, ServerGame> = new Map<string, ServerGame>();
const map = makeSimpleMap();
const sg = new ServerGame(map);
games.set('asdf', sg);
sg.start();

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
        let newId = game.users.addUser(payload);
        assert2(newId >= 0);
        // and we need to produce a response

        const ret:ClientConnectionResponse = {
          yourAssignedId:newId,
          map: new ServerMapDescription(game.raceState.getMap()),
        }
        wsConnection.send(JSON.stringify(ret));
        break;
      }
      case BasicMessageType.ClientToServerUpdate:
      {
        const payload:ClientToServerUpdate = <ClientToServerUpdate>bm.payload;
        const user = userIdToUserMap.get(payload.userId);
        if(user) {
          user.notifyPower(new Date().getTime(), payload.lastPower);
        }
        break;
      }
      case BasicMessageType.ClientConnectionResponse:
        assert2(false, "The server should NEVER receive this message");
        break;

    }
  };
});
