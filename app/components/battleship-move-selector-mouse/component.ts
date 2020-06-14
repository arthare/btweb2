import Component from '@ember/component';
import Ember from 'ember';
import { computed } from '@ember/object';
import { BattleshipGameTurnType, BattleshipGameParamsShoot, BattleshipGameParamsMove, BattleshipGameParamsRadar, BattleshipShipType, BattleshipGameMap } from 'bt-web2/server-client-common/battleship-game';
import { assert2 } from 'bt-web2/server-client-common/Utils';
import { MapShowMode } from 'bt-web2/battleship/controller';

export enum DisplayPhase {
  SelectAction,
  SetActionParameters,
}

export default class BattleshipMoveSelectorMouse extends Component.extend({
  // anything which *must* be merged to prototype here
  phase: DisplayPhase.SelectAction,
  selectActionPhase: Ember.computed.equal('phase', DisplayPhase.SelectAction),
  selectParamsPhase: Ember.computed.equal('phase', DisplayPhase.SetActionParameters),

  yourGame: <BattleshipGameMap><unknown>null,
  theirGame: <BattleshipGameMap><unknown>null,

  isShoot: Ember.computed.equal('pendingTurnType', BattleshipGameTurnType.SHOOT),
  isRadar: Ember.computed.equal('pendingTurnType', BattleshipGameTurnType.RADAR),
  isMoveNW: Ember.computed('pendingTurnType', 'isNW', function() {
    return this.get('pendingTurnType') === BattleshipGameTurnType.MOVE && this.get('isNW');
  }),
  isMoveSE: Ember.computed('pendingTurnType', 'isNW', function() {
    return this.get('pendingTurnType') === BattleshipGameTurnType.MOVE && !this.get('isNW');
  }),
  isPass: Ember.computed.equal('pendingTurnType', BattleshipGameTurnType.PASS),

  isNW: false,
  pendingTurnType: <BattleshipGameTurnType>BattleshipGameTurnType.PASS,
  pendingTurnParams: <BattleshipGameParamsMove|BattleshipGameParamsRadar|BattleshipGameParamsShoot><unknown>null,


  phaseWatcher: Ember.observer('phase', function(this:BattleshipMoveSelectorMouse) {
    if(this.get('phase') === DisplayPhase.SelectAction) {
      this.onChangeMapHighlights(MapShowMode.COLOR, MapShowMode.COLOR);
    }
  }),

  onSelectActionParameter: <(turnType:BattleshipGameTurnType, param:any)=>void><unknown>null,
  onChangeMapHighlights: <(yours:MapShowMode, theirs:MapShowMode)=>void><unknown>null,
  actions: {
    pickShoot() {
      this.onChangeMapHighlights(MapShowMode.HIDDEN, MapShowMode.HIDDEN);
      this.set('pendingTurnType', BattleshipGameTurnType.SHOOT);
      this.set('phase', DisplayPhase.SetActionParameters);
    },
    pickRadar() {
      this.onChangeMapHighlights(MapShowMode.FADE, MapShowMode.COLOR);
      this.set('pendingTurnType', BattleshipGameTurnType.RADAR);
      this.set('phase', DisplayPhase.SetActionParameters);
    },
    pickMoveNW() {
      this.onChangeMapHighlights(MapShowMode.COLOR, MapShowMode.FADE);
      this.set('pendingTurnType', BattleshipGameTurnType.MOVE);
      this.set('isNW', true);
      this.set('phase', DisplayPhase.SetActionParameters);

    },
    pickMoveSE() {
      this.onChangeMapHighlights(MapShowMode.COLOR, MapShowMode.FADE);
      this.set('pendingTurnType', BattleshipGameTurnType.MOVE);
      this.set('isNW', false);
      this.set('phase', DisplayPhase.SetActionParameters);

    },
    pickPass(speedUp:boolean) {
      this.set('pendingTurnType', BattleshipGameTurnType.PASS);
    },
    onPickSquareForShooting(ixCol:number, ixRow:number) {
      // we're ready to shoot!
      assert2(this.get('pendingTurnType') === BattleshipGameTurnType.SHOOT);
      const params:BattleshipGameParamsShoot = {
        ixRow,
        ixCol,
      }
      this.onSelectActionParameter(this.get('pendingTurnType'), params);
      this.set('phase', DisplayPhase.SelectAction);
    },

    onSetupMove(ship:BattleshipShipType, ixCols:number, ixRows:number) {
      assert2(this.get('pendingTurnType') === BattleshipGameTurnType.MOVE);
      assert2(ship !== BattleshipShipType.UNKNOWN);
      const params:BattleshipGameParamsMove = {
        ship,
        ixCols,
        ixRows,
        push:false,
      }

      this.onSelectActionParameter(this.get('pendingTurnType'), params);
      this.set('phase', DisplayPhase.SelectAction);
    },

    onSetupRadar(count:number) {

      const params:BattleshipGameParamsRadar = {
        count,
        stealth: false,
      }

      this.onSelectActionParameter(this.get('pendingTurnType'), params);
      this.set('phase', DisplayPhase.SelectAction);
    }
  }
}) {
  // normal class body definition here

};
