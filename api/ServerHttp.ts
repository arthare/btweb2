import express from 'express';
import * as core from "express-serve-static-core";
import { ServerGame } from '../app/server-client-common/ServerGame';
import { ServerHttpGameList, ServerHttpGameListElement, CurrentRaceState } from '../app/server-client-common/communication';
import { RaceState } from '../app/server-client-common/RaceState';

let app = <core.Express>express();

function setHeaders(req:core.Request, res:core.Response) {
  res.setHeader('Access-Control-Allow-Origin', req.headers['origin'] || req.headers['Host'] || 'staczero.com');
  res.setHeader('Access-Control-Allow-Headers', '*');
}

export function setUpServerHttp(gameMap:Map<string, ServerGame>) {

  app.options('*', (req, res:any) => {
    setHeaders(req, res);
    
    res.end();
})

  app.get('/race-list', (req, res) => {
    setHeaders(req, res);
    const ret:ServerHttpGameList = {
      races: [],
    }

    const tmNow = new Date().getTime();
    
    gameMap.forEach((game:ServerGame, name:string) => {
      const httpGame = new ServerHttpGameListElement(tmNow, game);
      if(httpGame.status === CurrentRaceState.PreRace) {
        // pre-race: always include
        if(httpGame.tmScheduledStart >= 0 &&  // race has a scheduled start time
           httpGame.tmScheduledStart < tmNow &&  // but it's in the past
           httpGame.status === CurrentRaceState.PreRace) { // and the race didn't actually start
          // this game never started because there were never any humans, so let's just not include it.
        } else {
          ret.races.push(httpGame);
        }
        
      } else if(httpGame.status === CurrentRaceState.PostRace) {
        // skip!
      } else if(httpGame.status === CurrentRaceState.Racing) {
        // only include if the race is young
        const tm5Minutes = 5*60*1000;
        if(httpGame.tmActualStart >= tmNow - tm5Minutes) {
          ret.races.push(httpGame);
        }
      }
      
    });

    res.writeHead(200, 'ok');
    res.write(JSON.stringify(ret));
    res.end();
  })

  app.listen(8081);
}