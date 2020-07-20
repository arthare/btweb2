import express from 'express';
import * as core from "express-serve-static-core";
import { ServerGame } from '../app/server-client-common/ServerGame';
import { ServerHttpGameList, ServerHttpGameListElement, CurrentRaceState, ServerMapDescription, SimpleElevationMap, PacingChallengeResultSubmission } from '../app/server-client-common/communication';
import { RaceState } from '../app/server-client-common/RaceState';
import { ScheduleRacePostRequest } from '../app/server-client-common/ServerHttpObjects';
import { RideMapHandicap } from '../app/server-client-common/RideMapHandicap';
import { RideMapElevationOnly, RideMapPartial } from '../app/server-client-common/RideMap';
import { assert2 } from '../app/server-client-common/Utils';
import { setCorsHeaders, postStartup } from './HttpUtils';
import fs from 'fs';


export function setUpServerHttp(app:core.Express, gameMap:Map<string, ServerGame>) {


  app.get('/race-list', (req, res) => {
    setCorsHeaders(req, res);
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
  
  app.get('/pacing-challenge-records', (req:core.Request, res:core.Response) => {
    setCorsHeaders(req, res);
    try {
      const currentRecords = JSON.parse(fs.readFileSync('./pacing-challenge-records.json', 'utf8'));
      
      res.writeHead(200, 'ok');
      res.write(JSON.stringify(currentRecords));
      res.end();
    } catch(e) {
      res.writeHead(404, 'ok');
      res.write("");
      res.end();
    }
  });

  app.post('/pacing-challenge-result', (req:core.Request, res:core.Response) => {
    return postStartup(req, res).then((postInput:PacingChallengeResultSubmission) => {
      setCorsHeaders(req, res);

      try {
        const currentRecords = JSON.parse(fs.readFileSync('./pacing-challenge-records.json', 'utf8'));

        const key = `effort${postInput.pct.toFixed(0)}`;
        currentRecords[key] = postInput;
        fs.writeFileSync('./pacing-challenge-records.json', JSON.stringify(currentRecords));

      } catch(e) {
        res.writeHead(500, 'ok');
        res.write("");
        res.end();
      }
    });
  })

  app.post('/create-race', (req, res) => {
    return postStartup(req, res).then((postInput:ScheduleRacePostRequest) => {
      setCorsHeaders(req, res);

      const mapDescription = new ServerMapDescription(new SimpleElevationMap(postInput.elevations, postInput.lengthMeters));
      const map = new RideMapHandicap(mapDescription);

      const kmStr = `${(postInput.lengthMeters / 1000).toFixed(1)}km`;
      const gameId = postInput.raceName.replace(/\s/gi, '_');
      const serverGame = new ServerGame(map, gameId, postInput.raceName, 20);
      serverGame.scheduleRaceStartTime(postInput.tmWhen);
      gameMap.set(gameId, serverGame);

      
      res.writeHead(200, 'ok');
      res.write(JSON.stringify({}));
      res.end();
    })
  })


}

