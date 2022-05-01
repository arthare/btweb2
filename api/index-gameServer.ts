import WebSocket from 'ws';
import { ClientToServerUpdate, S2CBasicMessage, BasicMessageType, ClientConnectionRequest, ServerMapDescription, ClientConnectionResponse, ServerError, S2CPositionUpdate, S2CNameUpdate, S2CFinishUpdate, CurrentRaceState, S2CRaceStateUpdate, C2SBasicMessage, S2CImageUpdate, PORTS, ClientToServerChat, SERVER_UPDATE_RATE_HZ } from './tourjs-shared/communication';
import { assert2, testAssert } from './tourjs-shared/Utils';
import { RaceState, UserProvider } from './tourjs-shared/RaceState';
import { DEFAULT_HANDICAP_POWER, HandicapChangeReason, User, UserInterface, UserTypeFlags } from './tourjs-shared/User';
import { RideMapHandicap } from './tourjs-shared/RideMapHandicap';
import { RideMap, RideMapPartial } from './tourjs-shared/RideMap';
import { makeSimpleMap } from './ServerUtils';
import { SERVER_PHYSICS_FRAME_RATE } from './tourjs-shared/ServerConstants';
import { AIBrain, AINNBrain, AIUltraBoringBrain, getBrainFolders, ServerGame, ServerUser } from './tourjs-shared/ServerGame';
import { setUpServerHttp } from './HttpTourJs';
import express from 'express';
import * as core from "express-serve-static-core";
import { setUpCors } from './HttpUtils';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { takeTrainingSnapshot } from './tourjs-shared/ServerAISnapshots';
import { setupAuth0 } from './index-auth0';
import { dbGetUserAccount } from './index-db';

let app = <core.Express>express();
let wss:WebSocket.Server;


export function startGameServer() {
  


  // read ssl certificate

  try {
    const config = JSON.parse(fs.readFileSync('./ssl-config.json', 'utf8'));
    var privateKey = fs.readFileSync(config.privateKeyPath, 'utf8');
    var certificate = fs.readFileSync(config.fullChain, 'utf8');

    var credentials = { key: privateKey, cert: certificate };
    var https = require('https');
    
    //pass in your credentials to create an https server
    var httpsServer = https.createServer(credentials);
    httpsServer.listen(PORTS.TOURJS_WEBSOCKET_PORT);
    wss = new WebSocket.Server({
      server: httpsServer,
    });
  } catch(e) {
    wss = new WebSocket.Server({
      port: PORTS.TOURJS_WEBSOCKET_PORT,
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
  const map = makeSimpleMap(10000);
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


  const lastSentTo:Map<number,Rng> = new Map<number,Rng>();
  function buildClientPositionUpdate(tmNow:number, centralUser:UserInterface, userList:UserProvider, n:number):S2CPositionUpdate {
    const users = userList.getUsers(tmNow);

    if(!lastSentTo.has(centralUser.getId())) {
      lastSentTo.set(centralUser.getId(), new Rng());
    }
    const setPicked:Set<number> = new Set<number>();
    const lastSeed = lastSentTo.get(centralUser.getId()) || new Rng();
  
    // stage one: always send the central player's position
    const ret:S2CPositionUpdate = {
      clients: [centralUser.getPositionUpdate(tmNow)],
    };
    setPicked.add(centralUser.getId());

    // stage two: send the nClosest closest users
    const nClosest = 6;
    const sortedByDistance = users.sort((a:UserInterface, b:UserInterface) => {
      const distA = Math.abs(a.getDistance() - centralUser.getDistance());
      const distB = Math.abs(b.getDistance() - centralUser.getDistance());
      return distA < distB ? -1 : 1;
    });
    assert2(sortedByDistance[0].getId() === centralUser.getId() || sortedByDistance[0].getDistance() === centralUser.getDistance()); // the central user is closest to themselves...
    for(var x = 1;x < nClosest && x < sortedByDistance.length; x++) {
      ret.clients.push(sortedByDistance[x].getPositionUpdate(tmNow));
      setPicked.add(sortedByDistance[x].getId());
    }

    // stage 3: send a random sampling of who is left, weighted by distance
    for(var x = 0;x < n; x++) {
      const r = Math.floor(Math.pow(Math.random(),2) * sortedByDistance.length);
      assert2(r >= 0 && r < sortedByDistance.length);
      const u:UserInterface = users[r];

      if(setPicked.has(u.getId())) {
        continue;
      } else {
        setPicked.add(u.getId());
      }
      ret.clients.push(u.getPositionUpdate(tmNow));
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

        const response:S2CImageUpdate = new S2CImageUpdate(userWithoutImageSent);
        return sendResponse(user, tmNow, wsConnection, BasicMessageType.S2CImageUpdate, game, response);
      }
      
    } else if(!game.raceState.isAllRacersFinished(tmNow)) {

      const response:S2CPositionUpdate = buildClientPositionUpdate(tmNow, user, game.userProvider, 16);

      return sendResponse(user, tmNow, wsConnection, BasicMessageType.S2CPositionUpdate, game, response);
    }
  }

  wss.on('connection', (wsConnection) => {

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

        const game:ServerGame = races.get(thisConnectionGameId);
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
        setTimeout(sendUpdate, 1000 / SERVER_UPDATE_RATE_HZ);
      }
    }

    const broadcastMessage = (tmNow:number, fromUser:ServerUser, messageType:BasicMessageType, msg:any) => {
      if(thisConnectionGameId !== null && thisConnectionUserId !== null) {

        const game = races.get(thisConnectionGameId);
        if(!game) {
          // this game has almost certainly ended
          return;
        }

        const users:ServerUser[] = game.userProvider.getUsers(tmNow);

        users.forEach((user:ServerUser) => {
          const isAi = user.getUserType() & UserTypeFlags.Ai;
          if(!isAi) {
            // ok, we gotta repeat this message to this user
            const ws = user.getWebSocket();
            if(ws) {
              sendResponse(user, tmNow, user.getWebSocket() as any, messageType, game, msg);
            }
          }
        });

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
      
      try {
        
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
            if(payload.sub) {
              const existingUser = selectedUser = game.userProvider.getUsers(tmNow).find((su) => su.getSub() === payload.sub);
              if(existingUser) {
                newId = existingUser.getId();
                console.log(payload.riderName, " was already in this ride at distance ", existingUser.getDistance());
                if(payload.riderHandicap !== existingUser.getHandicap()) {
                  // ok, if you're going to come in with a higher handicap, we'll always permit that
                  existingUser.setHandicap(payload.riderHandicap, HandicapChangeReason.UserJoined);
                }
              }
            }
            
            if(!selectedUser) {
              // we didn't find an existing user by any means.  Let's stick this guy with the lead AI, which should be in a non-winning position
              const allUsers = game.userProvider.getUsers(tmNow);
              let distanceToAssign = 0;
              let speedToAssign = 0.5;
              if(allUsers.length > 0) {
                allUsers.sort((a,b) => a.getDistance() < b.getDistance() ? -1 : 1);

                const aiOnly = allUsers.filter((user) => user.getUserType() & UserTypeFlags.Ai);
                let deadLastUser = aiOnly[aiOnly.length - 1];

                distanceToAssign = deadLastUser.getDistance();
                speedToAssign = deadLastUser.getSpeed();
              }
              
              newId = game.addUser(tmNow, payload, wsConnection as any);
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
            if(!game) {
              // this game has ended
              return;
            }
            const user = game.getUser(payload.userId);
            if(user) {
              user.notifyPower(tmNow, payload.lastPower);
              if(payload.lastHrm) {
                user.notifyHrm(tmNow, payload.lastHrm);
              }
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
          case BasicMessageType.ClientToServerChat:
          {
            // I guess we'll tell all the other clients about this
            const payload:ClientToServerChat = <ClientToServerChat>bm.payload;
            const game = races.get(payload.gameId);
            if(game) {
              const user = game.getUser(payload.userId);
              if(user && 
                !(user.getUserType() & UserTypeFlags.Ai)) {
                console.log("user ", user.getName(), " said ", payload.chat);
                broadcastMessage(tmNow, user, BasicMessageType.S2CClientChat, { fromId: user.getId(), chat: payload.chat});
              }
            }
            break;
          }
          case BasicMessageType.ClientConnectionResponse:
            assert2(false, "The server should NEVER receive this message");
            break;

        }
      } catch(e) {
        debugger; // help!
        // I guess we'll just try to continue though...
      }
    };
  });


  setUpCors(app);
  setUpServerHttp(app, races);
  setupAuth0(app);
  app.listen(PORTS.GENERAL_HTTP_PORT);
  console.log(`Listening at localhost:${PORTS.GENERAL_HTTP_PORT} - with the version that should have auth0`);


  dbGetUserAccount('asdf').then((userAccount) => {
    console.log("startup: successfully got useraccount");
  }).catch((failure) => {
    console.error("Failure to get useraccount asdf ", failure);
  })

}

async function getTimeToCompleteCourse(fnMakeMap:()=>RideMap, name:string, ais:AIBrain[]):Promise<number> {

  return new Promise(async (resolve) => {
    const map = fnMakeMap();
    const sg = new ServerGame(map, 'Self-Check', 'Self-Check', 0);

    const aiIds = [];
    for(var ai of ais) {
      aiIds.push(sg.userProvider.addUser({
        sub: `AI_${uuidv4()}`,
        riderName:`Test AI`,
        accountId:"-1",
        riderHandicap: 300,
        gameId:sg.getGameId(),
        imageBase64: null,
        bigImageMd5: null,
      }, null, UserTypeFlags.Bot | UserTypeFlags.Ai, sg.raceState));
    }

    const tmStart = new Date().getTime();
    sg.scheduleRaceStartTime(tmStart);
    const msTick = 200;
    let tmNow = tmStart;
    console.log(`Fake race started for ${name}`)
    while(true) {
      const secondsTaken = (tmNow - tmStart) / 1000;
      sg.raceState.tick(tmNow);
      
      for(var aiId of aiIds) {
        testAssert(!isNaN(aiId) && aiId >= 0, `Sanity check for AI#${name}'s ID ${aiId}`);
  
        const user = sg.getUser(aiId);
        const snapshot = takeTrainingSnapshot(tmNow, user, sg.raceState);
        let power;
        if(ai.isNN()) {
          power = ai.getPowerNN(user.getHandicap(), snapshot);
        } else {
          power = ai.getPower(secondsTaken, user.getHandicap(), user.getDistance(), map.getLength(), map.getSlopeAtDistance(user.getDistance()));
        }
        testAssert(power >= 0 && power < 1500, `Nobody that plays TourJS sprints at 5x their FTP, but ${name} produced a wattage of ${power.toFixed(1)}`);
        user.notifyPower(tmNow, power);
      }
      
      

      if(sg.raceState.isAllRacersFinished(tmNow)) {
        const kmDone = map.getLength() / 1000;

        const user = sg.getUser(aiId);
        const finishTimeSeconds = user.getRaceTimeSeconds(tmStart);
        const hoursTaken = finishTimeSeconds / 3600;
        const kmh = kmDone / hoursTaken;
        const msg = `${user.getName()} from ${name} finished the ${map.getLength()}m course at ${kmh.toFixed(1)}km/h`;
        testAssert(kmh >= 35 && kmh <= 50, msg + `, which was out of allowed bounds`); // these are reasonable speeds to complete our set 10km course
        console.log(msg);
        resolve(secondsTaken);
        break;
      }
      tmNow += msTick;
    }
  })

}


export async function startSelfCheck() {
  // this function gets run before a deploy.
  // let's do at least a couple self-checks:
  // 1) we'll make sure that all the tensorflow AIs are valid and won't crash when run
  // 2) other automated tests
  


  const map = makeSimpleMap(10000);
  const sg = new ServerGame(map, 'Self-Check', 'Self-Check', 0);
  
  const brainsAvailable = getBrainFolders();
  const aiBrains:AINNBrain[] = brainsAvailable.map((avail) => {
    return new AINNBrain(1.0, avail);
  });

  await Promise.all(aiBrains.map((ai) => ai.finishLoadPromise()));

  const dumb = new AIUltraBoringBrain(1.0)
  const baselineTime = await getTimeToCompleteCourse(() => makeSimpleMap(10000), "Ultraboring", [dumb]);

  let index = 0;
  for(var aiBrain of aiBrains) {
    const time5 = await getTimeToCompleteCourse(() => makeSimpleMap(5000), brainsAvailable[index], [aiBrain]);
    const time10 = await getTimeToCompleteCourse(() => makeSimpleMap(10000), brainsAvailable[index], [aiBrain]);
    const time20 = await getTimeToCompleteCourse(() => makeSimpleMap(20000), brainsAvailable[index], [aiBrain]);
    
    const time5Competed = await getTimeToCompleteCourse(() => makeSimpleMap(5000), brainsAvailable[index], [aiBrain, dumb]);
    const time10Competed = await getTimeToCompleteCourse(() => makeSimpleMap(10000), brainsAvailable[index], [aiBrain, dumb]);
    const time20Competed = await getTimeToCompleteCourse(() => makeSimpleMap(20000), brainsAvailable[index], [aiBrain, dumb]);

    index++;
  }
  aiBrains.forEach((aiBrain, index) => {
    
  });
}