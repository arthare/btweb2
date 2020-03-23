import WebSocket from 'ws';
import { ClientToServerUpdate, S2CBasicMessage, BasicMessageType, ClientConnectionRequest, ServerMapDescription, ClientConnectionResponse, ServerError, S2CPositionUpdate, S2CNameUpdate, S2CFinishUpdate, CurrentRaceState, S2CRaceStateUpdate, C2SBasicMessage } from '../app/server-client-common/communication';
import { assert2 } from '../app/server-client-common/Utils';
import { RaceState, UserProvider } from '../app/server-client-common/RaceState';
import { User, UserTypeFlags } from '../app/server-client-common/User';
import { RideMapHandicap } from '../app/server-client-common/RideMapHandicap';
import { RideMap, RideMapPartial } from '../app/server-client-common/RideMap';
import { makeSimpleMap } from './ServerUtils';
import { SERVER_PHYSICS_FRAME_RATE } from './ServerConstants';
import { ServerGame } from '../app/server-client-common/ServerGame';
import { setUpServerHttp } from './ServerHttp';

const wss = new WebSocket.Server({
  port: 8080,
});






function sendError(tmNow:number, serverGame:ServerGame, socket:WebSocket, errorMessage:string) {
  const ret:S2CBasicMessage = {
    type: BasicMessageType.ServerError,
    raceState: new S2CRaceStateUpdate(tmNow, serverGame),
    payload: <ServerError>{
      text: errorMessage,
      stack: new Error().stack.toString(),
    }
  }
  socket.send(JSON.stringify(ret));
}

function sendResponse(tmNow:number, ws:WebSocket, type:BasicMessageType, serverGame:ServerGame, msg:ClientConnectionResponse|S2CPositionUpdate|S2CNameUpdate|S2CFinishUpdate) {

  const bm:S2CBasicMessage = {
    type,
    raceState: new S2CRaceStateUpdate(tmNow, serverGame),
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



const races:Map<string, ServerGame> = new Map<string, ServerGame>();
const map = makeSimpleMap();
const sg = new ServerGame(map, 'asdf');
races.set('asdf', sg);

const lastSentTo:Map<number,Rng> = new Map<number,Rng>();
function buildClientPositionUpdate(tmNow:number, centralUser:User, userList:UserProvider, n:number):S2CPositionUpdate {
  const users = userList.getUsers(tmNow);

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

    const tmNow = new Date().getTime();

    let bm:C2SBasicMessage;
    try {
      const str = event.data.toString('utf8');
      bm = JSON.parse(str);
    } catch(e) {
      return;
    }
    
    switch(bm.type) {
      case BasicMessageType.ClientConnectionRequest:
      {
        const payload:ClientConnectionRequest = <ClientConnectionRequest>bm.payload;
        const game = races.get(payload.gameId);
        if(!game) {
          return sendError(tmNow, game, wsConnection, "Game ID " + payload.gameId +" not found");
        }
        // ok, so they want to join this game
        let newId = game.addUser(tmNow, payload);
        assert2(newId >= 0);
        // and we need to produce a response

        const ret:ClientConnectionResponse = {
          yourAssignedId:newId,
          map: new ServerMapDescription(game.raceState.getMap()),
        }
        return sendResponse(tmNow, wsConnection, BasicMessageType.ClientConnectionResponse, game, ret);
      }
      case BasicMessageType.ClientToServerUpdate:
      {
        const tmNow = new Date().getTime();
        const payload:ClientToServerUpdate = <ClientToServerUpdate>bm.payload;
        const game = races.get(payload.gameId);
        const user = game.getUser(payload.userId);
        if(user) {
          user.notifyPower(tmNow, payload.lastPower);
          user.notePacket(tmNow);
        } else {
          throw new Error("How are we hearing about a user that has never registered?");
        }

        // let's make a server to client message that tells them about some local dudes

        const raceState = game.getLastRaceState();
        let tmSinceName = user && (tmNow - user.getLastNameUpdate()) || 0x7fffffff;
        let tmSinceFinish = user.getTimeSinceFinishUpdate(tmNow);
        switch(raceState) {
          case CurrentRaceState.PreRace:
            tmSinceFinish = 0; // don't send finish info pre-race, that doesn't make any sense
            tmSinceName *= 3; // send name stuff way more frequently pre-race
            break;
          case CurrentRaceState.Racing:
            if(!game.raceState.isAnyHumansFinished()) {
              tmSinceFinish = 0; // don't send finish info if nobody has finished
            }
            break;
          case CurrentRaceState.PostRace:
            if(game.raceState.isAllHumansFinished()) {
              tmSinceFinish *= 2; // if all the humans are done, send finish info twice as often
            }
            break;
        }
        if(tmSinceFinish >= 10000) {

          const response:S2CFinishUpdate = new S2CFinishUpdate(game.userProvider, game.getRaceStartTime());
          user.noteFinishUpdate(tmNow);

          return sendResponse(tmNow, wsConnection, BasicMessageType.S2CFinishUpdate, game, response);

        } else if(tmSinceName >= 30000) {

          console.log("been ", tmSinceName, " since last name update for ", user.getName());
          const response:S2CNameUpdate = new S2CNameUpdate(tmNow, game.userProvider);
          user.noteLastNameUpdate(tmNow);

          return sendResponse(tmNow, wsConnection, BasicMessageType.S2CNameUpdate, game, response);

        } else {

          console.log("doing a position update for user ", user.getName());
          const response:S2CPositionUpdate = buildClientPositionUpdate(tmNow, user, game.userProvider, 16);
  
          return sendResponse(tmNow, wsConnection, BasicMessageType.S2CPositionUpdate, game, response);
        }
      }
      case BasicMessageType.ClientConnectionResponse:
        assert2(false, "The server should NEVER receive this message");
        break;

    }
  };
});


setUpServerHttp(races);