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

const defaultTempoMs = 20000;

export const MIN_FTP_AVG_FOR_TURNS = 0.05;
export const MAX_FTP_AVG_FOR_TURNS = 0.7;
export const MIN_TSS_FOR_TURNPARAMS = 90;
export const MAX_TSS_FOR_TURNPARAMS = 125;

export function applyEffortLevels(raw:SelectableAction[], minAppliedValue:number, maxAppliedValue:number) {

  for(var x = 1; x < raw.length; x++) {
    const n = raw.length - 1;
    const offset = x - 1;
    const pct = (offset+1) / n;
    raw[x].minValue = raw[x-1].maxValue;
    raw[x].maxValue = pct * maxAppliedValue + (1-pct)*minAppliedValue;
  }
}


export default class BattleshipMoveSelectorMouse extends Component.extend({
  // anything which *must* be merged to prototype here
  classNames: ['battleship-move-selector-bike__container'],

  onChangeResistance:<(pct:number)=>void><unknown>null,
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
  tempoPeriodMs: defaultTempoMs,
  tempoPeriodMsDefault: defaultTempoMs,
  tmNextEvaluation: new Date().getTime() + defaultTempoMs,

  phaseWatcher: Ember.observer('phase', function(this:BattleshipMoveSelectorMouse) {
    if(this.get('phase') === DisplayPhase.SelectAction) {
      this.onChangeMapHighlights(MapShowMode.COLOR, MapShowMode.COLOR);
      const tmNow = new Date().getTime();
      this.onChangeResistance(0.3);
      this.set('tmNextEvaluation', tmNow + this.get('tempoPeriodMs'));
    } else {
      this.onChangeResistance(0.55);
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
        this.set(<any>key, actionSelected.assign[key]);
      }

      if(actionSelected.assign.pendingTurnType !== BattleshipGameTurnType.PASS) {
        this.onChangeResistance(0.55);
        this.set('phase', DisplayPhase.SetActionParameters);
      } else {
        // leave things as they were
        if(actionSelected.assign.tempoPeriodAdjust) {
          const currentTempo = this.get('tempoPeriodMs');
          this.set('tempoPeriodMs', currentTempo * actionSelected.assign.tempoPeriodAdjust);
        }
        this.onChangeResistance(0.3);
        this._selectNewTurn();
        this.onSelectActionParameter(BattleshipGameTurnType.PASS, {});
      }
    },

    onSelectShoot(ixCol:number, ixRow:number) {
      // we're ready to shoot!
      assert2(this.get('pendingTurnType') === BattleshipGameTurnType.SHOOT);
      const params:BattleshipGameParamsShoot = {
        ixRow,
        ixCol,
      }
      const game:BattleshipGameMap = this.get('theirGame');
      if(isFinite(ixRow) && isFinite(ixCol) && ixRow >= 0 && ixRow < game.nGrid && ixCol >= 0 && ixCol < game.nGrid) {
        this.onSelectActionParameter(this.get('pendingTurnType'), params);
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



  @computed()
  get turnActions():SelectableAction[] {
    const raw = [
      {
        assign: {pendingTurnType: BattleshipGameTurnType.PASS, tempoPeriodAdjust: 1.0},
        words: "Pass",
        mode: SelectableActionMode.AvgPctOfFtp,
        minValue: 0.0,
        maxValue: MIN_FTP_AVG_FOR_TURNS,
        cls: 'pass',
      }, 
      {
        assign: {pendingTurnType: BattleshipGameTurnType.PASS, tempoPeriodAdjust: 1.25},
        words: "Tempo Down",
        mode: SelectableActionMode.AvgPctOfFtp,
        minValue: -1,
        maxValue: -1,
        cls: 'tempo-down',
      }, {
        assign: {pendingTurnType: BattleshipGameTurnType.PASS, tempoPeriodAdjust: 0.8},
        words: "Tempo Up",
        mode: SelectableActionMode.AvgPctOfFtp,
        minValue: -1,
        maxValue: -1,
        cls: 'tempo-up',
      }, {
        assign: {pendingTurnType: BattleshipGameTurnType.MOVE, isNW: true},
        words: "Move<br>NW",
        mode: SelectableActionMode.AvgPctOfFtp,
        minValue: -1,
        maxValue: -1,
        cls: 'move-nw',
      }, {
        assign: {pendingTurnType: BattleshipGameTurnType.MOVE, isNW: false},
        words: "Move<br>SE",
        mode: SelectableActionMode.AvgPctOfFtp,
        minValue: -1,
        maxValue: -1,
        cls: 'move-se',
      }, {
        assign: {pendingTurnType: BattleshipGameTurnType.RADAR},
        words: "Radar",
        mode: SelectableActionMode.AvgPctOfFtp,
        minValue: -1,
        maxValue: -1,
        cls: 'radar',
      }, {
        assign: {pendingTurnType: BattleshipGameTurnType.SHOOT},
        words: "Shoot",
        mode: SelectableActionMode.AvgPctOfFtp,
        minValue: -1,
        maxValue: -1,
        cls: 'shoot',
      }
    ];

    applyEffortLevels(raw, MIN_FTP_AVG_FOR_TURNS, MAX_FTP_AVG_FOR_TURNS);

    return raw;
  }

};
