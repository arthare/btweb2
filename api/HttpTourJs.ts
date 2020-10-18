import express from 'express';
import * as core from "express-serve-static-core";
import { ServerGame } from '../app/server-client-common/ServerGame';
import { ServerHttpGameList, ServerHttpGameListElement, CurrentRaceState, ServerMapDescription, SimpleElevationMap, PacingChallengeResultSubmission, RaceResultSubmission } from '../app/server-client-common/communication';
import { RaceState } from '../app/server-client-common/RaceState';
import { ScheduleRacePostRequest } from '../app/server-client-common/ServerHttpObjects';
import { RideMapHandicap } from '../app/server-client-common/RideMapHandicap';
import { RideMapElevationOnly, RideMapPartial } from '../app/server-client-common/RideMap';
import { assert2 } from '../app/server-client-common/Utils';
import { setCorsHeaders, postStartup } from './HttpUtils';
import fs from 'fs';
import md5 from 'md5';


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
  
  class PacingChallengeMapRecords {
    effort125: PacingChallengeResultSubmission[] = [];
    effort100: PacingChallengeResultSubmission[] = [];
    effort90: PacingChallengeResultSubmission[] = [];
    effort80: PacingChallengeResultSubmission[] = [];
    effort50: PacingChallengeResultSubmission[] = [];
  }
  interface PacingChallengeDb {
    hills1: PacingChallengeMapRecords;
    hills2: PacingChallengeMapRecords;
    flat: PacingChallengeMapRecords;
    long: PacingChallengeMapRecords;
  }

  app.get('/pacing-challenge-records', (req:core.Request, res:core.Response) => {
    setCorsHeaders(req, res);
    try {

      const map = req.query.map || 'hills1';
      const currentDb:PacingChallengeDb = JSON.parse(fs.readFileSync(`../pacing-challenge-records-v2.json`, 'utf8'));
      const currentRecords:PacingChallengeMapRecords = currentDb[map] || new PacingChallengeMapRecords();
      

      for(var key in currentRecords) {
        const currentVal = currentRecords[key];
        if(Array.isArray(currentVal)) {
          // we good
        } else {
          currentRecords[key] = [currentVal];
        }
      }
      
      // let's sort and truncate shit!
      for(var key in currentRecords) {
        let rg = currentRecords[key];
        rg.sort((a, b) => {
          return (a.time < b.time) ? -1 : 1;
        })

        rg = rg.filter((element, index) => {

          const theirName = req.query && req.query.name;
          element.rank = index+1;
          if(index < 10 || element.name === theirName) {
            return true;
          }
          return false;
        });
        currentRecords[key] = rg;
      }

      res.writeHead(200, 'ok');
      res.write(JSON.stringify(currentRecords));
      res.end();
    } catch(e) {
      res.writeHead(404, 'ok');
      res.write("");
      res.end();
    }
  });

  
  class RideNameResultDb {
    results: RaceResultSubmission[] = [];
  }
  type UserResultDb = {[key:string]:RideNameResultDb};

  app.get('/user-ride-results', (req:core.Request, res:core.Response) => {
    setCorsHeaders(req, res);
    if(req.query.imageMd5) {
      const fileName = `../rider-db-${req.query.imageMd5}.json`;
      if(fs.existsSync(fileName)) {
        // ok, this file exists!
        const userDb:UserResultDb = JSON.parse(fs.readFileSync(fileName, 'utf8'));

        for(var key in userDb) {
          const rides = userDb[key];
          rides.results.sort((a, b) => {
            return a.tmStart > b.tmStart ? -1 : 1;
          });
        }

        res.writeHead(200, 'ok');
        res.write(JSON.stringify(userDb));
        res.end();
        return;
      }
    }
    res.writeHead(404, 'ok');
    res.write("");
    res.end();
  })
  app.post('/submit-ride-result', (req:core.Request, res:core.Response) => {
    return postStartup(req, res).then((postInput:RaceResultSubmission) => {
      setCorsHeaders(req, res);

      // we will key off of their image.  If they own the high-res source image, then they can access the data for all rider names ridden with that image.
      const toHash = postInput.imageBase64;
      const userKey = md5(toHash);
      
      const fileName = `../rider-db-${userKey}.json`;
      let userTotal:UserResultDb;
      if(!fs.existsSync(fileName)) {
        // this is the rider's first submission!
        userTotal = {};
      } else {
        userTotal = JSON.parse(fs.readFileSync(fileName, 'utf8'))
      }
      
      const riderTotal:RideNameResultDb = userTotal[postInput.riderName] || new RideNameResultDb();
      const alreadySubmittedWithThisStartTime = riderTotal.results.find((oldRide) => oldRide.tmStart === postInput.tmStart);
      if(alreadySubmittedWithThisStartTime) {
        // double submission
      } else {
        riderTotal.results.push(postInput);
        userTotal[postInput.riderName] = riderTotal;

        fs.writeFileSync(fileName, JSON.stringify(userTotal));
      }
    });
  });

  app.post('/pacing-challenge-result', (req:core.Request, res:core.Response) => {
    return postStartup(req, res).then((postInput:PacingChallengeResultSubmission) => {
      setCorsHeaders(req, res);

      try {
        const currentDb:PacingChallengeDb = JSON.parse(fs.readFileSync('../pacing-challenge-records-v2.json', 'utf8'));
        const currentRecords = currentDb[postInput.mapName] || new PacingChallengeMapRecords();
        const key = `effort${postInput.pct.toFixed(0)}`;
        let val = currentRecords[key];

        if(Array.isArray(val)) {
          // is already an array!
          val.push(postInput);
        } else {
          // probably old result
          val = [val, postInput];
        }
        currentRecords[key] = val;
        currentDb[postInput.mapName] = currentRecords;
        fs.writeFileSync('../pacing-challenge-records-v2.json', JSON.stringify(currentDb));

        res.writeHead(200, 'ok');
        res.write(JSON.stringify(currentRecords));
        res.end();
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

