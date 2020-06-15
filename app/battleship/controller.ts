import Controller from '@ember/controller';
import { BattleshipGameMap, BattleshipGameShip, BattleshipGameTurnType, BattleshipGameTurn } from 'bt-web2/server-client-common/battleship-game';
import {BattleshipShipType} from '../server-client-common/battleship-game';
import { assert2 } from 'bt-web2/server-client-common/Utils';
import Ember from 'ember';
import Devices from 'bt-web2/services/devices';

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
          break;
        case BattleshipGameTurnType.PASS:
          // ...coward
          break;
        case BattleshipGameTurnType.SHOOT:
          this.set('ixColHighlight', -1);
          this.set('ixRowHighlight', -1);
          this.theirGame.applyMove(compiledTurn);
          break;
        case BattleshipGameTurnType.RADAR:
          this.theirGame.applyMove(compiledTurn);
          break;
      }
      this.incrementProperty('updateCounter');
    },

    onChangeMapHighlights(yours:MapShowMode, theirs:MapShowMode) {
      this.set('yourShowMode', yours);
      this.set('theirShowMode', theirs);
    }
  }
}) {
  // normal class body definition here

  startup(yourGame:BattleshipGameMap, theirGame:BattleshipGameMap) {
    this.set('yourGame', yourGame);
    this.set('theirGame', theirGame);


  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'battleship': Battleship;
  }
}
