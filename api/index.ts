import WebSocket from 'ws';
import { ClientToServerUpdate, S2CBasicMessage, BasicMessageType, ClientConnectionRequest, ServerMapDescription, ClientConnectionResponse, ServerError, S2CPositionUpdate, S2CNameUpdate, S2CFinishUpdate, CurrentRaceState, S2CRaceStateUpdate, C2SBasicMessage, S2CImageUpdate } from '../app/server-client-common/communication';
import { assert2 } from '../app/server-client-common/Utils';
import { RaceState, UserProvider } from '../app/server-client-common/RaceState';
import { User, UserTypeFlags } from '../app/server-client-common/User';
import { RideMapHandicap } from '../app/server-client-common/RideMapHandicap';
import { RideMap, RideMapPartial } from '../app/server-client-common/RideMap';
import { makeSimpleMap } from './ServerUtils';
import { SERVER_PHYSICS_FRAME_RATE } from './ServerConstants';
import { ServerGame, ServerUser } from '../app/server-client-common/ServerGame';
import { setUpServerHttp } from './ServerHttp';

var fs = require('fs');

// read ssl certificate
let wss:WebSocket.Server;

try {
  const config = JSON.parse(fs.readFileSync('./ssl-config.json'));
  var privateKey = fs.readFileSync(config.privateKeyPath, 'utf8');
  var certificate = fs.readFileSync(config.fullChain, 'utf8');

  var credentials = { key: privateKey, cert: certificate };
  var https = require('https');
  
  //pass in your credentials to create an https server
  var httpsServer = https.createServer(credentials);
  httpsServer.listen(8080);
  wss = new WebSocket.Server({
    server: httpsServer,
  });
} catch(e) {
  wss = new WebSocket.Server({
    port: 8080,
  });
}







function sendError(tmNow:number, serverGame:ServerGame, socket:WebSocket, errorMessage:string) {
  
  const ret:S2CBasicMessage = {
    timeStamp:tmNow,
    type: BasicMessageType.ServerError,
    raceState: new S2CRaceStateUpdate(tmNow, serverGame),
    payload: <ServerError>{
      text: errorMessage,
      stack: new Error().stack.toString(),
    }
  }
  socket.send(JSON.stringify(ret));
}

function sendResponse(
  user:ServerUser,
  tmNow:number, 
  ws:WebSocket, 
  type:BasicMessageType, 
  serverGame:ServerGame, 
  msg:ClientConnectionResponse|S2CPositionUpdate|S2CNameUpdate|S2CFinishUpdate|S2CImageUpdate
) {

  const bm:S2CBasicMessage = {
    timeStamp: tmNow,
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
const map = makeSimpleMap(15000);
const sg = new ServerGame(map, 'Starting_Soon', 'Will Start On Join', 10);
races.set(sg.getGameId(), sg);

function hasRaceAtTime(tmWhen) {
  let found;
  races.forEach((value:ServerGame, key) => {
    if(value.getRaceScheduledStartTime() === tmWhen) {
      found = key;
    }
  });

  if(found) {
    return true;
  }
  return false;
}

function populatePrescheduledRaces() {
  console.log("populating presched races?");
  const msRaceStartInterval = 15 * 60000;

  // this will get us a precise timestamp every 15 minutes
  const tmNow = new Date().getTime();
  const tmNowish = Math.floor(tmNow / msRaceStartInterval)*msRaceStartInterval;

  let nPreschedule = 6;
  for(var x = tmNowish; x < tmNowish + nPreschedule*msRaceStartInterval; x += msRaceStartInterval) {
    if(x < tmNow) {
      console.log("skipping scheduling a race at ", new Date(x), " because it is in the past");
      continue; // in the past, we don't care
    }
    if(hasRaceAtTime(x)) {
      // ok we already have this one
      console.log("We already have a race at ", new Date(x), " so we won't make a new one");
    } else {
      // gotta make a new race!
      const c15s = Math.floor(x / msRaceStartInterval);
      let map:RideMap;
      if(c15s & 1) {
        map = makeSimpleMap(10000)
      } else {
        map = makeSimpleMap(20000);
      }
      let date = new Date(x);
      console.log("making new race at ", date);
      const name = `${(map.getLength() / 1000).toFixed(1)}km on CosineMap. ${date.toISOString()}`;
      const gameId = name.replace(/\s/gi, '_');
      const sg = new ServerGame(map, gameId, name, 10);
      sg.scheduleRaceStartTime(x);
      console.log("making prescheduled race at ", date.toLocaleTimeString());
      races.set(gameId, sg);
    }
  }

  // let's also clear out old/useless rides
  let killKeys = [];
  races.forEach((race:ServerGame, gameId:string) => {
    if(race.getRaceScheduledStartTime() >= 0 &&
       race.getRaceScheduledStartTime() < tmNow - msRaceStartInterval &&
       race.getLastRaceState() === CurrentRaceState.PreRace) {
      // race never started
      console.log("killing " + gameId + " because it never started, and its start time is in the past");
      killKeys.push(gameId);
    } else if(race.getLastRaceState() === CurrentRaceState.PostRace &&
              race.raceState.getSecondsSinceLastNonFinishedHuman(tmNow) >= 300) {
      // last human finished 5 minutes ago
      console.log("killing " + gameId + " because the last human finished 5 minutes ago");
      killKeys.push(gameId);
    }
  })

  killKeys.forEach((key) => {
    const race:ServerGame = races.get(key);
    race.stop();
    races.delete(key);
  })


  setTimeout(populatePrescheduledRaces, msRaceStartInterval);
}
populatePrescheduledRaces();


const lastSentTo:Map<number,Rng> = new Map<number,Rng>();
function buildClientPositionUpdate(tmNow:number, centralUser:User, userList:UserProvider, n:number):S2CPositionUpdate {
  const users = userList.getUsers(tmNow);

  if(!lastSentTo.has(centralUser.getId())) {
    lastSentTo.set(centralUser.getId(), new Rng());
  }
  const setPicked:Set<number> = new Set<number>();
  const lastSeed = lastSentTo.get(centralUser.getId()) || new Rng();
 
  // stage one: always send the central player's position
  const ret:S2CPositionUpdate = {
    clients: [centralUser.getPositionUpdate()],
  };
  setPicked.add(centralUser.getId());

  // stage two: send the nClosest closest users
  const nClosest = 6;
  const sortedByDistance = users.sort((a:User, b:User) => {
    const distA = Math.abs(a.getDistance() - centralUser.getDistance());
    const distB = Math.abs(b.getDistance() - centralUser.getDistance());
    return distA < distB ? -1 : 1;
  });
  assert2(sortedByDistance[0].getId() === centralUser.getId() || sortedByDistance[0].getDistance() === centralUser.getDistance()); // the central user is closest to themselves...
  for(var x = 1;x < nClosest && x < sortedByDistance.length; x++) {
    ret.clients.push(sortedByDistance[x].getPositionUpdate());
    setPicked.add(sortedByDistance[x].getId());
  }

  // stage 3: send a random sampling of who is left, weighted by distance
  for(var x = 0;x < n; x++) {
    const r = Math.floor(Math.pow(Math.random(),2) * sortedByDistance.length);
    assert2(r >= 0 && r < sortedByDistance.length);
    const u:User = users[r];

    if(setPicked.has(u.getId())) {
      continue;
    } else {
      setPicked.add(u.getId());
    }
    ret.clients.push(u.getPositionUpdate());
  }
  return ret;
}

function sendUpdateToClient(game:ServerGame, user:ServerUser, tmNow:number, wsConnection:WebSocket) {  
  // let's make a server to client message that tells them about some local dudes

  const raceState = game.getLastRaceState();
  let tmSinceName = user && (tmNow - user.getLastNameUpdate()) || 0x7fffffff;
  let tmSinceFinish = user.getTimeSinceFinishUpdate(tmNow);
  let tmSinceImage = user && (tmNow - user.getLastImageUpdate()) || 0x7fffffff;
  switch(raceState) {
    case CurrentRaceState.PreRace:
      tmSinceFinish = 0; // don't send finish info pre-race, that doesn't make any sense
      tmSinceName *= 10; // send name stuff way more frequently pre-race
      tmSinceImage *= 10; // really pound the images out in the prerace state
      break;
    case CurrentRaceState.Racing:
      if(!game.raceState.isAnyHumansFinished(tmNow)) {
        tmSinceFinish = 0; // don't send finish info if nobody has finished
      }
      break;
    case CurrentRaceState.PostRace:
      if(game.raceState.isAllHumansFinished(tmNow)) {
        tmSinceFinish *= 10; // if all the humans are done, send finish info twice as often
      }
      break;
  }
  if(tmSinceFinish >= 10000) {

    const response:S2CFinishUpdate = new S2CFinishUpdate(game.userProvider, game.getRaceStartTime());
    user.noteFinishUpdate(tmNow);

    return sendResponse(user, tmNow, wsConnection, BasicMessageType.S2CFinishUpdate, game, response);

  } else if(tmSinceName >= 30000) {

    console.log("been ", tmSinceName, " since last name update for ", user.getName());
    const response:S2CNameUpdate = new S2CNameUpdate(tmNow, game.userProvider);
    user.noteLastNameUpdate(tmNow);

    return sendResponse(user, tmNow, wsConnection, BasicMessageType.S2CNameUpdate, game, response);
  } else if(tmSinceImage >= 10000) {
    // time for an image!
    const users = game.raceState.getUserProvider().getUsers(tmNow);
    const userWithoutImageSent = users.find((otherUser) => {
      return otherUser.getId() != user.getId() && otherUser.getImage() && !user.hasBeenSentImageFor(otherUser.getId());
    });
    user.noteImageSent(tmNow, userWithoutImageSent && userWithoutImageSent.getId() || -1);
    if(userWithoutImageSent) {
      // ok, the recipient user here hasn't received an image for userWithoutImageSent yet

      console.log("sending ", userWithoutImageSent.getName(), " image to ", user.getName());
      const response:S2CImageUpdate = new S2CImageUpdate(userWithoutImageSent);
      return sendResponse(user, tmNow, wsConnection, BasicMessageType.S2CImageUpdate, game, response);
    }
    
  } else if(!game.raceState.isAllRacersFinished(tmNow)) {

    const response:S2CPositionUpdate = buildClientPositionUpdate(tmNow, user, game.userProvider, 16);

    return sendResponse(user, tmNow, wsConnection, BasicMessageType.S2CPositionUpdate, game, response);
  }
}

wss.on('connection', (wsConnection) => {
  console.log("server got connection from ", wsConnection.url);

  let stillConnected = true;
  let thisConnectionGameId:string|null = null;
  let thisConnectionUserId:number|null = null;
  let startedSendUpdate = false;
  wsConnection.onclose = () => {
    stillConnected = false;
  }

  const sendUpdate = () => {
    if(thisConnectionGameId !== null && thisConnectionUserId !== null) {
      const tmNow = new Date().getTime();
      const game = races.get(thisConnectionGameId);
      if(!game) {
        // this game has almost certainly ended
        return;
      }
      const user = game.getUser(thisConnectionUserId);
      if(!user) {
        // or this user has disconnected perhaps
        return;
      }

      sendUpdateToClient(game, user, tmNow, wsConnection);
    }
    

    if(stillConnected) {
      setTimeout(sendUpdate, 250);
    }
  }

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
        thisConnectionGameId = payload.gameId;
        const game = races.get(payload.gameId);
        if(!game) {
          return sendError(tmNow, game, wsConnection, "Game ID " + payload.gameId +" not found");
        }
        // ok, so they want to join this game

        // lets see if this user is maybe already in this game
        let newId;
        let selectedUser;
        if(payload.imageBase64) {
          const existingUser = selectedUser = game.findUserByImage(tmNow, payload.imageBase64, payload.riderName, payload.riderHandicap);
          if(existingUser) {
            newId = existingUser.getId();
            console.log(payload.riderName, " was already in this ride at distance ", existingUser.getDistance());
          }
        }
        
        if(!newId) {
          // we didn't find an existing user by any means.  Let's stick this guy at the back of the pack
          const allUsers = game.userProvider.getUsers(tmNow);
          let distanceToAssign = 0;
          let speedToAssign = 0.5;
          if(allUsers.length > 0) {
            allUsers.sort((a,b) => a.getDistance() < b.getDistance() ? -1 : 1);
            const deadLastUser = allUsers[0];
            distanceToAssign = deadLastUser.getDistance();
            speedToAssign = deadLastUser.getSpeed();
          }
          
          newId = game.addUser(tmNow, payload);
          const newUser = selectedUser = game.getUser(newId);
          newUser.setDistance(distanceToAssign);
          newUser.setSpeed(speedToAssign);
        }
        

        thisConnectionUserId = newId;
        assert2(newId >= 0);
        // and we need to produce a response

        const ret:ClientConnectionResponse = {
          yourAssignedId:newId,
          map: new ServerMapDescription(game.raceState.getMap()),
        }
        assert2(selectedUser);
        if(selectedUser) {
          return sendResponse(selectedUser, tmNow, wsConnection, BasicMessageType.ClientConnectionResponse, game, ret);
        }
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

        if(!startedSendUpdate) {
          startedSendUpdate = true;
          sendUpdate();
        }
        break;
      }
      case BasicMessageType.ClientConnectionResponse:
        assert2(false, "The server should NEVER receive this message");
        break;

    }
  };
});


setUpServerHttp(races);