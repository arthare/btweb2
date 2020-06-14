import Component from '@ember/component';
import { BattleshipGameDisplayCell } from '../battleship-map/component';
import { computed } from '@ember/object';

export default class BattleshipMapCell extends Component.extend({
  // anything which *must* be merged to prototype here
  tagName: 'div',
  classNames: ['battleship-map-cell__container'],
  classNameBindings: ['wide'],
  ixCol: -1,
  ixRow: -1,
  onPickSquare: <(ixCol:number, ixRow:number)=>void><unknown>null,
  cell: <BattleshipGameDisplayCell><unknown>null,
}) {
  // normal class body definition here
  click() {
    if(this.get('onPickSquare')) {
      this.onPickSquare(this.get('cell').ixCol, this.get('cell').ixRow);
    }
  }

  @computed("cell")
  get cellDisplay():string {
    if(this.get('cell').ixCol === 0) {
      return '' + (this.get('cell').ixRow + 1);
    } else if(this.get('cell').ixRow === 0) {
      return String.fromCharCode('A'.charCodeAt(0) + this.get('cell').ixCol);
    } else {
      return '';
    }
  }
};
