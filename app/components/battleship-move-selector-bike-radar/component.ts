import Component from '@ember/component';
import { SelectableActionMode, SelectableAction, applyEffortLevels, MIN_TSS_FOR_TURNPARAMS, MAX_TSS_FOR_TURNPARAMS } from '../battleship-move-selector-bike/component';
import { computed } from '@ember/object';

export default class BattleshipMoveSelectorBikeRadar extends Component.extend({
  // anything which *must* be merged to prototype here
  onSelectRadar: <(arg:SelectableAction)=>void><unknown>null,
  msTempo: 0,
  tmNextEvaluation: 0,
  msTempoDefault: 0,

  actions: {
    onSelectRadar(action:SelectableAction) {
      console.log("radar selected: ", action);
      this.onSelectRadar(action);
    }
  }
}) {
  // normal class body definition here
  didInsertElement() {

    this.set('tmNextEvaluation', new Date().getTime() + this.get('msTempo'));
  }
  @computed()
  get radarActions():SelectableAction[] {

    const secondsPerStep = this.get('msTempoDefault') / 1000;

    const tssPerSecondAtFtp = 100 / 3600;
    const tssPerPercentFtp = secondsPerStep*tssPerSecondAtFtp / 100;
    
    const ret = [{
      assign: {ixCols: -1, ixRows: 1},
      words: "0",
      mode: SelectableActionMode.TotalTss,
      minValue: 0,
      maxValue: tssPerPercentFtp*100,
      cls: 'none',
    }, {
      assign: {count: 4},
      words: "4",
      mode: SelectableActionMode.TotalTss,
      minValue: tssPerPercentFtp*100,
      maxValue: tssPerPercentFtp*107,
      cls: 'radar-1x',
    }, {
      assign: {count: 8},
      words: "8",
      mode: SelectableActionMode.TotalTss,
      minValue: tssPerPercentFtp*107,
      maxValue: tssPerPercentFtp*114,
      cls: 'radar-2x',
    }, {
      assign: {count: 12},
      words: "12",
      mode: SelectableActionMode.TotalTss,
      minValue: tssPerPercentFtp*114,
      maxValue: tssPerPercentFtp*121,
      cls: 'radar-3x',
    }, {
      assign: {count: 16},
      words: "16",
      mode: SelectableActionMode.TotalTss,
      minValue: tssPerPercentFtp*121,
      maxValue: tssPerPercentFtp*128,
      cls: 'radar-4x',
    }, {
      assign: {count: 20},
      words: "20",
      mode: SelectableActionMode.TotalTss,
      minValue: tssPerPercentFtp*128,
      maxValue: tssPerPercentFtp*135,
      cls: 'radar-5x',
    }]

    applyEffortLevels(ret, tssPerPercentFtp*MIN_TSS_FOR_TURNPARAMS, tssPerPercentFtp*MAX_TSS_FOR_TURNPARAMS);

    return ret;
  }
};
