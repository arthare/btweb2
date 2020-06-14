import Component from '@ember/component';
import { SelectableActionMode, SelectableAction } from '../battleship-move-selector-bike/component';
import { computed } from '@ember/object';
import { BattleshipGameMap } from 'bt-web2/server-client-common/battleship-game';


export default class BattleshipMoveSelectorBikeShoot extends Component.extend({
  // anything which *must* be merged to prototype here
  tmNextEvaluation: 0,
  msTempo: 0,
  colSelected: false,
  onSelectShoot: <(ixCol:number, ixRow:number)=>void><unknown>null,
  ixCol: -1,
  ixRow: -1,
  game: <BattleshipGameMap><unknown>null,

  actions: {
    onSelectRow(action:SelectableAction) {
      if(typeof action.assign.ixRow === 'number') {
        this.set('ixRow', action.assign.ixRow);
        this.onSelectShoot(this.get('ixCol'), this.get('ixRow'));
      } else {
        this.onSelectShoot(-1, -1);
      }

    },
    onSelectCol(action:SelectableAction) {
      const tmNow = new Date().getTime();
      if(typeof action.assign.ixCol === 'number') {
        this.set('ixCol', action.assign.ixCol);
        this.set('colSelected', true);
        this.set('tmNextEvaluation', tmNow + this.get('msTempo') / 2);
      } else {
        this.onSelectShoot(-1, -1);
      }
    }
  }
}) {
  // normal class body definition here
  @computed()
  get rowActions():SelectableAction[] {

    const game:BattleshipGameMap = this.get('game');
    const n = game.nGrid;
    const secondsPerStep = (this.get('msTempo') / 1000) / 2;

    const tssPerSecondAtFtp = 100 / 3600;
    const tssPerPercentFtp = secondsPerStep*tssPerSecondAtFtp / 100;
    
    const ret = [{
      assign: {},
      words: "Misfire",
      mode: SelectableActionMode.TotalTss,
      minValue: 0,
      maxValue: tssPerPercentFtp*100,
      cls: 'misfire',
    }];
    
    const stepPerRow = (150 - 100) / n;
    for(var x = 0;x < n; x++) {
      const char = '' + (x+1);
      ret.push({
        assign: {ixRow: x},
        words: char,
        mode: SelectableActionMode.TotalTss,
        minValue: tssPerPercentFtp*(100 + stepPerRow*x),
        maxValue: tssPerPercentFtp*(100 + stepPerRow*(x+1)),
        cls: 'row-' + char,
      })
    }

    return ret;
  }
  
  @computed()
  get colActions():SelectableAction[] {

    const game:BattleshipGameMap = this.get('game');
    const n = game.nGrid;
    const secondsPerStep = (this.get('msTempo') / 1000) / 2;

    const tssPerSecondAtFtp = 100 / 3600;
    const tssPerPercentFtp = secondsPerStep*tssPerSecondAtFtp / 100;
    
    const ret = [{
      assign: {},
      words: "Misfire",
      mode: SelectableActionMode.TotalTss,
      minValue: 0,
      maxValue: tssPerPercentFtp*100,
      cls: 'misfire',
    }];
    
    const stepPerCol = (150 - 100) / n;

    for(var x = 0;x < n; x++) {
      const char = String.fromCharCode('A'.charCodeAt(0) + x);
      ret.push({
        assign: {ixCol: x},
        words: char,
        mode: SelectableActionMode.TotalTss,
        minValue: tssPerPercentFtp*(100 + stepPerCol*x),
        maxValue: tssPerPercentFtp*(100 + stepPerCol*(x+1)),
        cls: 'col-' + char,
      })
    }

    return ret;
  }

  didInsertElement() {
    const tmNow = new Date().getTime();
    this.set('tmNextEvaluation', tmNow + this.get('msTempo') / 2);
  }
};
