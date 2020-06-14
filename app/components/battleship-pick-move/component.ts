import Component from '@ember/component';
import { BattleshipShipType, BattleshipGameMap, BattleshipGameShip } from 'bt-web2/server-client-common/battleship-game';

export default class BattleshipPickMove extends Component.extend({
  // anything which *must* be merged to prototype here
  pickedShip: <BattleshipShipType|null>null,

  game: <BattleshipGameMap><unknown>null,
  ships: [],

  onSetupMove: <(ship:BattleshipShipType, ixCols:number, ixRows:number)=>void><unknown>null,

  actions: {
    pickDirection(ixCols:number, ixRows:number) {
      const ship = this.get('pickedShip');
      if(ship !== null && ship !== BattleshipShipType.UNKNOWN) {
        this.onSetupMove(ship, ixCols, ixRows);
      }
    },
    pickShip(ship:BattleshipGameShip) {
      this.set('pickedShip', ship.shipType);
    }
  }
}) {
  // normal class body definition here
  didInsertElement() {
    // we need to figure out what ships are actually available
    const liveShips = this.game.ships.filter((ship) => !ship.isSunk());
    this.set('ships', liveShips);
  }
};
