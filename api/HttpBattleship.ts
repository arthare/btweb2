import express from 'express';
import * as core from "express-serve-static-core";
import { BattleshipGameMap, BattleshipMapCreate, BattleshipMapCreateResponse } from '../app/server-client-common/battleship-game';
import { postStartup, setCorsHeaders, setUpCors } from './HttpUtils';
import { ScheduleRacePostRequest } from '../app/server-client-common/ServerHttpObjects';


class ActiveBattleshipMap {
  map:BattleshipGameMap;
  tmLinked:number; // date that this one found a linked player
  tmCreated:number;
  mapId:string;

  constructor(map:BattleshipGameMap, tmNow:number, mapId:string) {
    this.map = map;
    this.tmCreated = tmNow;
    this.tmLinked = 0;
    this.mapId = mapId;
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
    if(secondsOld < 15*60 && map.tmLinked === 0 && map.mapId !== yourMapId) {
      ret.push(map);
    }
  })
  return ret;
}

export function setUpBattleshipHttp(app:core.Express) {

  app.post('/create-battleship-map', (req:core.Request, res:core.Response) => {
    return postStartup(req, res).then((postInput:BattleshipMapCreate) => {
      setCorsHeaders(req, res);

      const tmNow = new Date().getTime();

      const mapId = createMapId(postInput.mapId);

      const waitingMaps = getWaitingMaps(tmNow, mapId);

      const yourMap = new BattleshipGameMap(mapId, postInput.nGrid, postInput.ships);

      console.log(`battleship: created ${mapId}`);
      g_mapBattleshipMaps.set(mapId, new ActiveBattleshipMap(yourMap, tmNow, mapId));

      const response:BattleshipMapCreateResponse = {
        mapId,
        create: postInput,
        waitingPlayers: waitingMaps.map((map) => map.mapId),
      }

      res.writeHead(200, 'ok');
      res.write(JSON.stringify(response));
      res.end();
    });
  });

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
}