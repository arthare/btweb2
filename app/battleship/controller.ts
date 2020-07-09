import Controller from '@ember/controller';
import { BattleshipGameMap, BattleshipGameShip, BattleshipGameTurnType, BattleshipGameTurn, BattleshipMapCreate, BattleshipApplyMove, BattleshipMessageType, BattleshipGameMeta, BattleshipMetaType, BattleshipMessage, inflateMap, BattleshipMetaNotifyNewPlayer } from 'bt-web2/server-client-common/battleship-game';
import {BattleshipShipType} from '../server-client-common/battleship-game';
import { assert2 } from 'bt-web2/server-client-common/Utils';
import Ember from 'ember';
import Devices from 'bt-web2/services/devices';
import { apiGet, apiPost } from 'bt-web2/set-up-ride/route';
import ENV from 'bt-web2/config/environment';
import { PORTS } from 'bt-web2/server-client-common/communication';

export enum MapShowMode {
  HIDDEN='hidden',
  COLOR='color',
  FADE='fade',
  ONTOP='on-top',
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
  otherGames: <string[]>[],

  ws: <WebSocket|null>null,

  targetedResistance: 0.35,

  applyMoveRemote(key:"yourGame"|"theirGame", yourMapId:string, game:BattleshipGameMap, move:BattleshipGameTurn) {
    // tell the server about this
    const applyMove:BattleshipApplyMove = {
      shotByMapId: yourMapId,
      targetMapId: game.getMapId(),
      move,
    }
    return apiPost('battleship-apply-move', applyMove).then((newMap:BattleshipMapCreate) => {
      this.set(key, inflateMap(newMap));
    })
  },

  _refreshWaiting() {
    return apiGet('battleship-waiting-players').then((waitingPlayers:string[]) => {

      waitingPlayers = waitingPlayers.filter((player) => player !== this.get('yourMap').getMapId());
      console.log("updating other games: ", waitingPlayers);
      this.set('otherGames', waitingPlayers);
    })
  },

  actions: {
    onChangeResistance(pct:number) {

      this.set('targetedResistance', pct);
    },
    refreshWaiting() {
      return this._refreshWaiting();
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
      console.log("they have selected action parameters", action, params);
      if(params.ixCol === 1 && params.ixRow === 0) {
        debugger;
      }


      switch(action) {
        case BattleshipGameTurnType.MOVE:
          this.yourGame.applyMove(compiledTurn);
          this.applyMoveRemote("yourGame", this.yourGame.getMapId(), this.yourGame, compiledTurn);
          break;
        case BattleshipGameTurnType.PASS:
          // ...coward
          break;
        case BattleshipGameTurnType.SHOOT:
          if(this.theirGame) {
            this.set('ixColHighlight', -1);
            this.set('ixRowHighlight', -1);
            this.theirGame.applyMove(compiledTurn);
            this.applyMoveRemote("theirGame", this.yourGame.getMapId(), this.theirGame, compiledTurn);
          }
          break;
        case BattleshipGameTurnType.RADAR:
          if(this.theirGame) {
            this.theirGame.applyMove(compiledTurn);
            this.applyMoveRemote("theirGame", this.yourGame.getMapId(), this.theirGame, compiledTurn);
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


}) {
  // normal class body definition here

  _connectWebsocket():Promise<any> {
    // we need to connect our websocket so we can get real time hits to our own map
    if(this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve(this.ws);
    } else {
      return new Promise((resolve) => {
        const targetHost = ENV.gameServerHost;
        let url = ENV.environment === 'production' ? `wss://${targetHost}:${PORTS.BATTLESHIP_WEBSOCKET_PORT}` : `ws://${targetHost}:${PORTS.BATTLESHIP_WEBSOCKET_PORT}`;
        let ws = new WebSocket(url);
        this.ws = ws;
        
        const myMapId = this.get('yourGame').getMapId();

        this.ws.onopen = (ev:MessageEvent) => {
          // yay we're connected!
          const identify:BattleshipMessage = {
            type:BattleshipMessageType.Meta,
            payload:<BattleshipGameMeta>{
              type:BattleshipMetaType.Identify,
              payload: myMapId,
            }
          }
          ws.send(JSON.stringify(identify));
          resolve();
        }
        this.ws.onmessage = (ev:MessageEvent) => {
          const data = ev.data;
          let bm:BattleshipMessage|null = null;
          try {
            bm = JSON.parse(data);
          } catch(e) {
            bm = null;
          }

          if(bm) {
            switch(bm.type) {
              case BattleshipMessageType.Turn:
                
                const turn = <BattleshipApplyMove>bm.payload;
                console.log("a move has arrived to be applied to our map: ", turn.targetMapId, turn.move);
                assert2(turn.targetMapId === this.get('yourGame').getMapId());
                this.get('yourGame').applyMove(turn.move);
                this.incrementProperty('updateCounter');
                break;
              case BattleshipMessageType.Meta:
                const meta = <BattleshipGameMeta>bm.payload;
                switch(meta.type) {
                  case BattleshipMetaType.NotifyNewPlayer:
                    const notify = <BattleshipMetaNotifyNewPlayer>meta.payload;
                    console.log("they told us about the arrival of ", notify.newMapId, ", making the list look like ", notify.waitingPlayersNow);
                    const withoutMe = notify.waitingPlayersNow.filter((waitingPlayer) => waitingPlayer !== myMapId);
                    this.set('otherGames', withoutMe);
                    break;
                }
            }
          }
        }
      })

    }
  }

  startup(yourGame:BattleshipGameMap) {
    this.set('yourGame', yourGame);
    this.set('theirGame', null);

    this._connectWebsocket();

    let tmLast = new Date().getTime();

    const doATick = () => {
      if(this.isDestroyed) {
        return;
      }
      const tmNow = new Date().getTime();
      this.devices.tick(tmNow, false);

      const targetedResistance = this.get('targetedResistance');
      if(targetedResistance) {
        this.devices.setResistanceMode(targetedResistance);
      }

      setTimeout(doATick, 250);
    }
    setTimeout(doATick, 250);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'battleship': Battleship;
  }
}
