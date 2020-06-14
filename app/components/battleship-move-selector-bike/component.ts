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

export enum SelectableActionMode {
  AvgPctOfFtp,
  TotalTss,
}

export interface SelectableAction {
  assign: any; // an object whose keys get applied to BattleshipMoveSelectorMouse
  words: string;
  mode:SelectableActionMode;
  minValue: number;
  maxValue: number;
  cls:string;
}


export default class BattleshipMoveSelectorMouse extends Component.extend({
  // anything which *must* be merged to prototype here
  classNames: ['battleship-move-selector-bike__container'],

  phase: DisplayPhase.SelectAction,
  selectActionPhase: Ember.computed.equal('phase', DisplayPhase.SelectAction),
  selectParamsPhase: Ember.computed.equal('phase', DisplayPhase.SetActionParameters),

  turnActions: [
    {
      assign: {pendingTurnType: BattleshipGameTurnType.PASS, tempoAdjust: 0.8},
      words: "Tempo Down",
      mode: SelectableActionMode.AvgPctOfFtp,
      minValue: 0,
      maxValue: 0.5,
      cls: 'tempo-down',
    }, {
      assign: {pendingTurnType: BattleshipGameTurnType.PASS, tempoAdjust: 1.25},
      words: "Tempo Up",
      mode: SelectableActionMode.AvgPctOfFtp,
      minValue: 0.5,
      maxValue: 0.6,
      cls: 'tempo-up',
    }, {
      assign: {pendingTurnType: BattleshipGameTurnType.MOVE, isNW: true},
      words: "Move<br>🡐⬉ 🡑",
      mode: SelectableActionMode.AvgPctOfFtp,
      minValue: 0.6,
      maxValue: 0.7,
      cls: 'move-nw',
    }, {
      assign: {pendingTurnType: BattleshipGameTurnType.MOVE, isNW: false},
      words: "Move<br>🡓⬊ 🡒",
      mode: SelectableActionMode.AvgPctOfFtp,
      minValue: 0.7,
      maxValue: 0.8,
      cls: 'move-se',
    }, {
      assign: {pendingTurnType: BattleshipGameTurnType.RADAR},
      words: "Radar",
      mode: SelectableActionMode.AvgPctOfFtp,
      minValue: 0.8,
      maxValue: 0.9,
      cls: 'radar',
    }, {
      assign: {pendingTurnType: BattleshipGameTurnType.SHOOT},
      words: "Shoot",
      mode: SelectableActionMode.AvgPctOfFtp,
      minValue: 0.9,
      maxValue: 1.0,
      cls: 'shoot',
    }
  ],

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
  tempoPeriodMs: 5000,
  tmNextEvaluation: new Date().getTime() + 5000,

  phaseWatcher: Ember.observer('phase', function(this:BattleshipMoveSelectorMouse) {
    if(this.get('phase') === DisplayPhase.SelectAction) {
      this.onChangeMapHighlights(MapShowMode.COLOR, MapShowMode.COLOR);
      const tmNow = new Date().getTime();

      
      this.set('tmNextEvaluation', tmNow + this.get('tempoPeriodMs'));
      console.log("move-selector-bike changing next-eval time to ", this.get('tmNextEvaluation'));
    } else {
      switch(this.get('pendingTurnType')) {
        case BattleshipGameTurnType.MOVE:
          this.onChangeMapHighlights(MapShowMode.COLOR, MapShowMode.FADE);
          break;
        case BattleshipGameTurnType.PASS:
          // no color change for pass
          break;
        case BattleshipGameTurnType.RADAR:
          this.onChangeMapHighlights(MapShowMode.FADE, MapShowMode.COLOR);
          break;
        case BattleshipGameTurnType.SHOOT:
          this.onChangeMapHighlights(MapShowMode.FADE, MapShowMode.COLOR);
          break;
      }
    }

  }),

  onSelectActionParameter: <(turnType:BattleshipGameTurnType, param:any)=>void><unknown>null,
  onChangeMapHighlights: <(yours:MapShowMode, theirs:MapShowMode)=>void><unknown>null,

  _onSelectMoveInternal(ship:BattleshipShipType, ixCols:number, ixRows:number) {
    assert2(this.get('pendingTurnType') === BattleshipGameTurnType.MOVE);
    assert2(this.get('phase') === DisplayPhase.SetActionParameters);
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

  _selectNewTurn() {
    this.set('tmNextEvaluation', new Date().getTime() + this.get('tempoPeriodMs'));
    this.set('phase', DisplayPhase.SelectAction);

  },

  actions: {
    onSelectTurn(actionSelected:SelectableAction) {
      console.log("they've selected ", actionSelected);

      // the "assign" member changes our internal state
      for(var key in actionSelected.assign) {
        this.set(key, actionSelected.assign[key]);
      }

      if(actionSelected.assign.pendingTurnType !== BattleshipGameTurnType.PASS) {
        this.set('phase', DisplayPhase.SetActionParameters);
      } else {
        // leave things as they were
        this._selectNewTurn();
      }
    },

    onSelectShoot(ixCol:number, ixRow:number) {
      // we're ready to shoot!
      assert2(this.get('pendingTurnType') === BattleshipGameTurnType.SHOOT);
      const params:BattleshipGameParamsShoot = {
        ixRow,
        ixCol,
      }
      this._selectNewTurn();
    },

    onSelectMove(ship:BattleshipShipType, ixCols:number, ixRows:number) {
      if(ship !== BattleshipShipType.UNKNOWN) {
        this._onSelectMoveInternal(ship, ixCols, ixRows);
      } else {
        this._selectNewTurn();
      }
    },

    onSelectRadar(action:SelectableAction) {
      console.log("move-selector onSelectRadar");
      assert2(this.pendingTurnType === BattleshipGameTurnType.RADAR);
      
      const params:BattleshipGameParamsRadar = {
        count: action.assign.count,
        stealth: false,
      }
      this.onSelectActionParameter(this.get('pendingTurnType'), params);

      this._selectNewTurn();
    },
  }
}) {
  // normal class body definition here

};
