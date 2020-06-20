import Controller from '@ember/controller';
import { BattleshipGameMap, BattleshipGameShip, BattleshipGameTurnType, BattleshipGameTurn, BattleshipMapCreate } from 'bt-web2/server-client-common/battleship-game';
import {BattleshipShipType} from '../server-client-common/battleship-game';
import { assert2 } from 'bt-web2/server-client-common/Utils';
import Ember from 'ember';
import Devices from 'bt-web2/services/devices';
import { apiGet, apiPost } from 'bt-web2/set-up-ride/route';
import ENV from 'bt-web2/config/environment';

export enum MapShowMode {
  HIDDEN='hidden',
  COLOR='color',
  FADE='fade',
  ONTOP='on-top',
}

export function inflateMap(create:BattleshipMapCreate):BattleshipGameMap {
  
  const fullShips:BattleshipGameShip[] = create.ships.map((rawShip:BattleshipGameShip) => {
    return new BattleshipGameShip(rawShip.shipType, rawShip.ixTopLeftCol, rawShip.ixTopLeftRow, rawShip.isVertical, rawShip.nGrid);
  });
  const game = new BattleshipGameMap(create.mapId, create.nGrid, fullShips);
  return game;
}

export default class Battleship extends Controller.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service(),
  
  yourGame: <BattleshipGameMap><unknown>null,
  theirGame: <BattleshipGameMap><unknown>null,
  updateCounter: 0,

  ixColHighlight: -1,
  ixRowHighlight: -1,

  yourShowMode: MapShowMode.COLOR,
  theirShowMode: MapShowMode.COLOR,

  ws: <WebSocket|null>null,

  applyMoveRemote(key:"yourGame"|"theirGame", game:BattleshipGameMap, move:BattleshipGameTurn) {
    // tell the server about this
    const applyMove:BattleshipApplyMove = {
      mapId: game.getMapId(),
      move,
    }
    return apiPost('battleship-apply-move', applyMove).then((newMap:BattleshipMapCreate) => {
      this.set(key, inflateMap(newMap));
    })
  }

  actions: {
    onChangeResistance(pct:number) {
      this.devices.setResistanceMode(pct);
    },
    onNeedHighlight(ixCol:number, ixRow:number) {
      this.set('ixColHighlight', ixCol);
      this.set('ixRowHighlight', ixRow);
    },
    onSelectActionParameter(action:BattleshipGameTurnType, params:any) {
      const compiledTurn:BattleshipGameTurn = {
        type:action,
        params,
      }

      console.log("setting resistance mode");

      switch(action) {
        case BattleshipGameTurnType.MOVE:
          this.yourGame.applyMove(compiledTurn);
          this.applyMoveRemove("yourGame", this.yourGame, compiledTurn);
          break;
        case BattleshipGameTurnType.PASS:
          // ...coward
          break;
        case BattleshipGameTurnType.SHOOT:
          if(this.theirGame) {
            this.set('ixColHighlight', -1);
            this.set('ixRowHighlight', -1);
            this.theirGame.applyMove(compiledTurn);
            this.applyMoveRemove("theirGame", this.theirGame, compiledTurn);
          }
          break;
        case BattleshipGameTurnType.RADAR:
          if(this.theirGame) {
            this.theirGame.applyMove(compiledTurn);
            this.applyMoveRemove("theirGame", this.theirGame, compiledTurn);
          }
          break;
      }
      this.incrementProperty('updateCounter');
    },

    selectGame(mapId:string) {
      // they've selected a target
      return apiGet('battleship-map', {mapId}).then((enemyMap:BattleshipMapCreate) => {
        const theirGame = inflateMap(enemyMap);
    
        return this._connectWebsocket().then(() => {
          this.set('theirGame', theirGame);
        })
      })
    },

    onChangeMapHighlights(yours:MapShowMode, theirs:MapShowMode) {
      this.set('yourShowMode', yours);
      this.set('theirShowMode', theirs);
    }
  },

  _connectWebsocket():Promise<any> {
    // we need to connect our websocket so we can get real time hits to our own map
    if(this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve(this.ws);
    } else {
      return new Promise((resolve) => {
        let targetHost = 'localhost';
        let url = ENV.environment === 'production' ? `wss://${targetHost}:8080` : `ws://${targetHost}:8080`;
        this.ws = new WebSocket(url);
        this.ws.onopen = (ev:MessageEvent) => {
          // yay we're connected!
          resolve();
        }
        this.ws.onmessage = (ev:MessageEvent) => {
          debugger;
        }
      })

    }
  },

}) {
  // normal class body definition here

  startup(yourGame:BattleshipGameMap, theirGame:BattleshipGameMap) {
    this.set('yourGame', yourGame);
    this.set('theirGame', null);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'battleship': Battleship;
  }
}
