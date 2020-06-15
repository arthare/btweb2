import Component from '@ember/component';
import Ember from 'ember';
import { SelectableAction, SelectableActionMode } from '../battleship-move-selector-bike/component';
import Devices, { PowerTimerAverage } from 'bt-web2/services/devices';
import { User } from 'bt-web2/server-client-common/User';
import { assert2 } from 'bt-web2/server-client-common/Utils';

interface EarnedAction {
  action: SelectableAction;
  pct: number; // 0..1 for where in the action you earned it.  0 being "just barely picked this action" to 1 being "just about picked the next one"
}

export default class BattleshipMoveSelectorBikeCursor extends Component.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service('devices'),
  tmNextEvaluation: <number>0,
  tmStartEvaluation: new Date().getTime(),
  name: '',

  resultEvaluated: false,

  actionsList: <SelectableAction[]><unknown>null,

  onSelectAction: <(act:SelectableAction)=>void><unknown>null,
  onPendingSelection: <(act:SelectableAction)=>void><unknown>null,

  intervalHandle: <any>null,

  nextTimeObserver: Ember.observer('tmNextEvaluation', function(this:BattleshipMoveSelectorBikeCursor) {
    console.log(this.actionsList, " evaluating start time");
    this.set('resultEvaluated', false);
    this.set('tmStartEvaluation', new Date().getTime());
    this.devices.startPowerTimer(this.get('name'));
  }),

  actions: {
    forceSelection(which:SelectableAction) {
      this.onSelectAction(which);
    }
  }

}) {
  // normal class body definition here

  _findEarnedAction(avg:PowerTimerAverage,
                    secondsOfCycle:number,
                    user:User|undefined,
                    actionsList:SelectableAction[]
    ):EarnedAction {
    const totalJDone = avg.joules;
    const avgWatts = avg.powerAvg;

    if(user) {
      const avgPctFtp = avgWatts / user.getHandicap();

      const tss100Joules = user.getHandicap() * 3600;
      const tssProducedSoFar = (totalJDone / tss100Joules) * 100;
      const tssProducedExpected = tssProducedSoFar * (secondsOfCycle / avg.totalTimeSeconds);

      const bottomAction = actionsList[0];
      switch(bottomAction.mode) {
        case SelectableActionMode.AvgPctOfFtp:
          if(avgPctFtp < bottomAction.minValue) {
            return {action: bottomAction, pct:0};
          }
          break;
        case SelectableActionMode.TotalTss:
          if(tssProducedExpected < bottomAction.minValue) {
            return {action: bottomAction, pct:0};
          }
      }

      const topAction = actionsList[actionsList.length - 1];
      switch(topAction.mode) {
        case SelectableActionMode.AvgPctOfFtp:
          if(avgPctFtp > topAction.maxValue) {
            return {action: topAction, pct:1};
          }
          break;
        case SelectableActionMode.TotalTss:
          if(tssProducedExpected > topAction.maxValue) {
            return {action: topAction, pct:1};
          }
      }

      let pctFind = -1;
      const match = actionsList.find((action) => {
        switch(action.mode) {
          case SelectableActionMode.AvgPctOfFtp:
            pctFind = (avgPctFtp - action.minValue) / (action.maxValue - action.minValue);
            return avgPctFtp >= action.minValue && avgPctFtp <= action.maxValue;
          case SelectableActionMode.TotalTss:
            pctFind = (tssProducedExpected - action.minValue) / (action.maxValue - action.minValue);
            return tssProducedExpected >= action.minValue && tssProducedExpected <= action.maxValue;
        }
      }) || actionsList[0];

      return {
        action: match,
        pct: pctFind,
      }
    } else {
      throw new Error("No User?  WTF");
    }
  }

  _updateDisplay() {
    const tmNow = new Date().getTime();
    const offset = tmNow - this.get('tmStartEvaluation');

    const span:number = this.get('tmNextEvaluation') - this.get('tmStartEvaluation');
    const pct = offset / span;
    const pctcss = (pct*100).toFixed(1) + '%';

    const prog:HTMLDivElement|null = this.element.querySelector('.battleship-move-selector-bike-cursor__progress');
    if(prog) {
      prog.style.height = pctcss;
    }

    { // doing instant and average indicators
      const user = this.devices.getLocalUser();
      if(!user) {
        throw new Error("wtf, no user?");
      }

      const secondsOfCycle = span / 1000;
      if(true)
      {
        const lastPower = user.getLastPower();
        const avg:PowerTimerAverage = {
          powerAvg: lastPower,
          totalTimeSeconds: 1,
          joules: lastPower,
        }
        const earnedActionInstant:EarnedAction = this._findEarnedAction(avg,
           secondsOfCycle,
           user, 
           this.actionsList);
        const instantIndicator:HTMLDivElement|null = this.element.querySelector(`.battleship-move-selector-bike-cursor__instant.${earnedActionInstant.action.cls}`);
        const allInstantIndicators = this.element.querySelectorAll(`.battleship-move-selector-bike-cursor__instant`);
        allInstantIndicators.forEach((inst) => {
          if(!inst.classList.contains(earnedActionInstant.action.cls)) {
            inst.classList.remove('shown');
          } else {
            inst.classList.add('shown');
          }
        })
        if(instantIndicator) {
          instantIndicator.style.left = (100*earnedActionInstant.pct).toFixed(1) + '%';
        }
      }
      {
        const avg = this.devices.getPowerCounterAverage(this.get('name'));
        const earnedActionAverage:EarnedAction = this._findEarnedAction(avg, 
                                                       secondsOfCycle,
                                                       user, 
                                                       this.actionsList);


        if(this.onPendingSelection) {
          this.onPendingSelection(earnedActionAverage.action);
        }
        const allAverageIndicators = this.element.querySelectorAll(`.battleship-move-selector-bike-cursor__average`);
        const averageIndicator:HTMLDivElement|null = this.element.querySelector(`.battleship-move-selector-bike-cursor__average.${earnedActionAverage.action.cls}`);
      
        allAverageIndicators.forEach((avg) => {
          if(!avg.classList.contains(earnedActionAverage.action.cls)) {
            avg.classList.remove('shown');
          } else {
            avg.classList.add('shown');
          }
        })
  
        if(averageIndicator) {
          averageIndicator.style.left = (100*earnedActionAverage.pct).toFixed(1) + '%';
        }

      }

    }

    if(pct > 1) {
      this._evaluateResult();
    }
  }

  _evaluateResult() {
    if(this.get('resultEvaluated')) {
      return;
    }
    this.set('resultEvaluated', true);

    // this function gets called when the rider has finished an interval and we need to figure out which one they earned!

    const avg = this.devices.getPowerCounterAverage(this.get('name'));
    const findEarnedAction = this._findEarnedAction(avg,
                                                    (this.get('tmNextEvaluation') - this.get('tmStartEvaluation')) / 1000,
                                                    this.devices.getLocalUser(),
                                                    this.actionsList);
    this.onSelectAction(findEarnedAction.action || this.actionsList[0]);
  }

  didInsertElement() {
    assert2(this.get('name'));

    console.log("setting up " + this.get('name'));
    this.set('resultEvaluated', false);
    this.set('tmStartEvaluation', new Date().getTime());
    this.devices.startPowerTimer(this.get('name'));
    this.set('intervalHandle', setInterval(() => {
      this._updateDisplay();
    }, 250));
  }
  willDestroyElement() {
    console.log("destroying " + this.get('name'));
    clearInterval(this.get('intervalHandle'));
  }
};
