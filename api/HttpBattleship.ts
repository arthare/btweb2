import WebSocket from 'ws';
import express from 'express';
import * as core from "express-serve-static-core";
import { BattleshipGameMap, BattleshipMapCreate, BattleshipMapCreateResponse, BattleshipApplyMove, BattleshipMessage, BattleshipMessageType, BattleshipGameMeta, BattleshipMetaType, inflateMap, BattleshipMetaNotifyNewPlayer } from '../app/server-client-common/battleship-game';
import { postStartup, setCorsHeaders, setUpCors } from './HttpUtils';
import { ScheduleRacePostRequest } from '../app/server-client-common/ServerHttpObjects';
import fs from 'fs';
import { PORTS } from '../app/server-client-common/communication';
import { map } from 'rsvp';

// read ssl certificate
let wssBattleship:WebSocket.Server;


function setupBattleshipWebsocket() {
  try {
    const config = JSON.parse(fs.readFileSync('./ssl-config.json', 'utf8'));
    var privateKey = fs.readFileSync(config.privateKeyPath, 'utf8');
    var certificate = fs.readFileSync(config.fullChain, 'utf8');
  
    var credentials = { key: privateKey, cert: certificate };
    var https = require('https');
    
    //pass in your credentials to create an https server
    var httpsServer = https.createServer(credentials);
    httpsServer.listen(PORTS.BATTLESHIP_WEBSOCKET_PORT);
    wssBattleship = new WebSocket.Server({
      server: httpsServer,
    });
  } catch(e) {
    wssBattleship = new WebSocket.Server({
      port: PORTS.BATTLESHIP_WEBSOCKET_PORT,
    });
  }

  function notifyWaitingPlayers(newMapId:string, waitingPlayersNow:ActiveBattleshipMap[]) {
    g_mapBattleshipMaps.forEach((map) => {
      if(map.ws && map.ws.readyState === WebSocket.OPEN && map.mapId !== newMapId) {

        const notifyList = waitingPlayersNow.filter((waitingMap) => waitingMap.mapId !== map.mapId);

        const notifyMsg:BattleshipMetaNotifyNewPlayer = {
          newMapId,
          waitingPlayersNow: notifyList.map((notifyMap) => notifyMap.mapId),
        }

        const meta:BattleshipGameMeta = {
          type: BattleshipMetaType.NotifyNewPlayer,
          payload: notifyMsg,
        }
        const notify:BattleshipMessage = {
          type:BattleshipMessageType.Meta,
          payload:meta,
        }

        console.log("telling ", map.mapId, " about the new player ", newMapId);
        map.ws.send(JSON.stringify(notify));
      }
    })
  }
  function setupNewClient(clientSocket:WebSocket) {
    
    clientSocket.on("close", () => {
      let hostPlayer:ActiveBattleshipMap;
      g_mapBattleshipMaps.forEach((map) => {
        if(map.ws === clientSocket) {
          hostPlayer = map;
        }
      })

      if(hostPlayer) {
        console.log(hostPlayer.mapId, " has departed the game");
        const tmNow = new Date().getTime();
        notifyWaitingPlayers(hostPlayer.mapId, getWaitingMaps(tmNow, ""));
      }
    })

    clientSocket.onmessage = (event:WebSocket.MessageEvent) => {
      
      let bm:BattleshipMessage;
      try {
        const str = event.data.toString('utf8');
        bm = JSON.parse(str);
      } catch(e) {
        return;
      }

      switch(bm.type) {
        case BattleshipMessageType.Meta:
          const metaPayload = <BattleshipGameMeta>bm.payload;
          switch(metaPayload.type) {
            case BattleshipMetaType.Identify:
              // this will be them identifying their host map id
              const hostMapId = <string>metaPayload.payload;
              if(g_mapBattleshipMaps.has(hostMapId)) {
                const map = g_mapBattleshipMaps.get(hostMapId);
                map.ws = clientSocket;
                console.log("we have a websocket for map " + hostMapId + "!");
                const tmNow = new Date().getTime();
                notifyWaitingPlayers(hostMapId, getWaitingMaps(tmNow, ""));
              }
              break;
          }
          break;
        case BattleshipMessageType.Turn:
          debugger; // shouldn't happen, at least for now - turns all come in via HTTP POST
          break;
      }
    }
  }

  wssBattleship.on('connection', (clientSocket:WebSocket) => {
    // we have an incoming connection!

    setupNewClient(clientSocket);
  })
}

class ActiveBattleshipMap {
  map:BattleshipGameMap;
  tmLinked:number; // date that this one found a linked player
  tmCreated:number;
  mapId:string;
  ws:WebSocket|null;

  constructor(map:BattleshipGameMap, tmNow:number, mapId:string) {
    this.map = map;
    this.tmCreated = tmNow;
    this.tmLinked = 0;
    this.mapId = mapId;
    this.ws = null;
  }
}

const g_mapBattleshipMaps:Map<string, ActiveBattleshipMap> = new Map();

function createMapId(suggested:string) {
  let suffix = 0;
  const original = suggested;
  while(g_mapBattleshipMaps.has(suggested)) {
    suffix++;
    suggested = `${original} (${suffix})`;
  }
  return suggested;
}
function getWaitingMaps(tmNow:number, yourMapId:string):ActiveBattleshipMap[] {
  let ret = [];
  g_mapBattleshipMaps.forEach((map, gameId) => {
    const secondsOld = (tmNow - map.tmCreated)/1000;
    if(secondsOld < 15*60 && 
       map.tmLinked === 0 && 
       map.mapId !== yourMapId && 
       map.ws && 
       map.ws.readyState === WebSocket.OPEN) {
      ret.push(map);
    }
  })
  return ret;
}

export function setUpBattleshipHttp(app:core.Express) {

  let serializeCreate = Promise.resolve();

  app.post('/create-battleship-map', (req:core.Request, res:core.Response) => {
    return postStartup(req, res).then((postInput:BattleshipMapCreate) => {
      serializeCreate = serializeCreate.then(() => {
        setCorsHeaders(req, res);
  
        const tmNow = new Date().getTime();
  
        const mapId = createMapId(postInput.mapId);
        postInput.mapId = mapId;
  
        const yourMap = inflateMap(postInput);
  
        console.log(`battleship: created ${mapId}`);
        g_mapBattleshipMaps.set(mapId, new ActiveBattleshipMap(yourMap, tmNow, mapId));
  
        const response:BattleshipMapCreateResponse = {
          mapId,
          create: postInput,
        }
  
        res.writeHead(200, 'ok');
        res.write(JSON.stringify(response));
        res.end();
      });
    });
  });

  app.get('/battleship-waiting-players', (req:core.Request, res:core.Response) => {
    setCorsHeaders(req, res);
    const tmNow = new Date().getTime();
    const waitingMaps = getWaitingMaps(tmNow, req.query.mapId);

    const ret:string[] = waitingMaps.map((map) => map.mapId);

    res.writeHead(200, 'ok');
    res.write(JSON.stringify(ret));
    res.end();
  }),

  app.get('/battleship-map', (req:core.Request, res:core.Response) => {
    setCorsHeaders(req, res);
    const mapId = req.query['mapId'];

    if(g_mapBattleshipMaps.has(mapId)) {
      const map = g_mapBattleshipMaps.get(mapId);
      
      const ret:BattleshipMapCreate = map.map.toMapCreate();

      res.writeHead(200, 'ok');
      res.write(JSON.stringify(ret));
      res.end();
    } else {
      res.writeHead(404);
      res.write("{}");
      res.end();
    }
  });

  app.post('/battleship-apply-move', (req:core.Request, res:core.Response) => {
    return postStartup(req, res).then((move:BattleshipApplyMove) => {
      console.log("battleship-apply-move ", move, g_mapBattleshipMaps);
      setCorsHeaders(req, res);

      if(g_mapBattleshipMaps.has(move.targetMapId)) {
        const map = g_mapBattleshipMaps.get(move.targetMapId);

        // update the "master" version of that map.
        map.map.applyMove(move.move);

        if(move.targetMapId !== move.shotByMapId) {
          // we need to tell the owner of this map about what happened to it
          if(map.ws) {
            // we need to put it in a wrapper since we might eventually have different message types other than just "apply move"
            // that we want to send to each player
            console.log("sending a turn to ", move.targetMapId, " caused by ", move.shotByMapId, move.move);
            const send:BattleshipMessage = {
              type:BattleshipMessageType.Turn,
              payload:move,
            }
            map.ws.send(JSON.stringify(send));
          }
        }

        res.writeHead(200, 'ok');
        res.write(JSON.stringify(map.map.toMapCreate()));
        res.end();
      } else {
        res.writeHead(404, 'ok');
        res.write("map not found");
        res.end();
      }
    });
  });
}
setupBattleshipWebsocket();