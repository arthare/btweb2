import express from 'express';
import * as core from "express-serve-static-core";
import { ServerGame } from '../app/server-client-common/ServerGame';
import { ServerHttpGameList, ServerHttpGameListElement } from '../app/server-client-common/communication';

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
      ret.races.push(httpGame);
    });

    res.writeHead(200, 'ok');
    res.write(JSON.stringify(ret));
    res.end();
  })

  app.listen(8081);
}