import express from 'express';
import * as core from "express-serve-static-core";
import { ServerGame } from '../app/server-client-common/ServerGame';
import { ServerHttpGameList, ServerHttpGameListElement, CurrentRaceState, ServerMapDescription, SimpleElevationMap } from '../app/server-client-common/communication';
import { RaceState } from '../app/server-client-common/RaceState';
import { ScheduleRacePostRequest } from '../app/server-client-common/ServerHttpObjects';
import { RideMapHandicap } from '../app/server-client-common/RideMapHandicap';
import { RideMapElevationOnly, RideMapPartial } from '../app/server-client-common/RideMap';
import { assert2 } from '../app/server-client-common/Utils';

let app = <core.Express>express();

function setHeaders(req:core.Request, res:core.Response) {
  res.setHeader('Access-Control-Allow-Origin', req.headers['origin'] || req.headers['Host'] || 'staczero.com');
  res.setHeader('Access-Control-Allow-Headers', '*');
}

// CORS requires a single origin to be returned.  This looks at the request and returns the correct one
function handleCors(req:core.Request, accessControlAllowOrigin:Array<string>):string {

  const reqOrigin = req.headers['origin'];
  const found:string|undefined = accessControlAllowOrigin.find((origin) => {
      return origin === reqOrigin;
  });

  if(found) {
      return found;
  }

  return '';
}
function postStartup(req:core.Request, res:core.Response):Promise<any> {
    
  return new Promise((resolve, reject) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', handleCors(req, ["https://staczero.com", "https://www.staczero.com"]));
      res.setHeader('Access-Control-Allow-Headers', '*');
      var body = [];
      req.on('data', (chunk:any) => {
          body.push(chunk);
      });
      req.on('end', () => {
          const rawString:string = Buffer.concat(body).toString('utf8');
          const parsed:any = JSON.parse(rawString);
          resolve(parsed);
      });
  })
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
  
  app.post('/create-race', (req, res) => {
    return postStartup(req, res).then((postInput:ScheduleRacePostRequest) => {
      setHeaders(req, res);

      const mapDescription = new ServerMapDescription(new SimpleElevationMap(postInput.elevations, postInput.lengthMeters));
      const map = new RideMapHandicap(mapDescription);

      const kmStr = `${(postInput.lengthMeters / 1000).toFixed(1)}km`;
      const gameId = `${kmStr}: ${postInput.raceName} by ${postInput.hostName}`
      const serverGame = new ServerGame(map, gameId, 0);
      serverGame.scheduleRaceStartTime(postInput.tmWhen);
      gameMap.set(gameId, serverGame);

      
      res.writeHead(200, 'ok');
      res.write(JSON.stringify({}));
      res.end();
    })
  })


  app.listen(8081);
}

