import Component from '@ember/component';
import { BattleshipGameMap, BattleshipGameSquare, BattleshipGameSquareType, BattleshipShipType } from 'bt-web2/server-client-common/battleship-game';
import { assert2 } from 'bt-web2/server-client-common/Utils';
import Ember from 'ember';

export interface BattleshipGameDisplayCell {
  hasShip: boolean;
  hasShot: boolean;
  hasRadar: boolean;
  shipDamaged: boolean;
  type: BattleshipGameSquareType;
  shipType: BattleshipShipType;
  ixCol: number,
  ixRow: number,
}

class BattleshipGameDisplay {
  game:BattleshipGameMap;
  
  rows: {cols: BattleshipGameDisplayCell[]}[];

  constructor(game:BattleshipGameMap, hidden:boolean) {
    this.game = game;
    this.rows = [];
    this.update(hidden);
  }

  update(hidden:boolean) {
    this.rows = this.game.grid.map((gridRow, ixRow) => {
      const cols = gridRow.map((gridRowCell:BattleshipGameSquare, ixCol) => {

        let ship = this.game.getShipAt(ixCol, ixRow);

        let canSeeShip = !hidden;
        if(this.game.getRadarAt(ixCol, ixRow) || this.game.getShotAt(ixCol, ixRow)) {
          canSeeShip = true;
        }
        if(!canSeeShip) {
          ship = undefined;
        }

        return {
          type: gridRowCell.eType,
          hasShip: !!ship,
          hasShot: this.game.getShotAt(ixCol, ixRow),
          hasRadar: this.game.getRadarAt(ixCol, ixRow),
          shipDamaged: (ship && ship.isDamagedAt(ixCol, ixRow)) || false,
          shipType: BattleshipShipType.UNKNOWN,

          ixCol,
          ixRow,
        }
      })

      return {
        cols,
      }
    })

  }
}

export default class BattleshipMap extends Component.extend({
  // anything which *must* be merged to prototype here
  game: <BattleshipGameMap><unknown>null,
  gameDisplay: <BattleshipGameDisplay><unknown>null,
  rows: [],

  classNames: ['battleship-map'],
  classNameBindings: ['showMode'],

  wide: '',
  hidden: true,

  onPickSquare:<any>null,

  updater: Ember.observer('updateCounter', 'ixColHighlight', 'ixRowHighlight', function(this:BattleshipMap) {
    this.gameDisplay.update(this.get('hidden'));
    this.set('rows', this.gameDisplay.rows);
  }),

  actions: {
    onPickSquare(ixCol:number, ixRow:number) {
      if(this.onPickSquare) {
        this.onPickSquare(ixCol, ixRow);
      }
    }
  }
}) {
  // normal class body definition here
  didInsertElement() {
    assert2(this.get('game'));

    this.set('gameDisplay', new BattleshipGameDisplay(this.get('game'), this.get('hidden')));
    this.updater();

    if(this.element.clientWidth > this.element.clientHeight) {
      this.set('wide', 'wide');
    } else {
      this.set('wide', '');
    }
  }
};
