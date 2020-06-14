import Route from '@ember/routing/route';
import { BattleshipGameShip, BattleshipShipType, BattleshipGameMap } from 'bt-web2/server-client-common/battleship-game';

export default class Battleship extends Route.extend({
  // anything which *must* be merged to prototype here
}) {
  // normal class body definition here

  setupController(controller:any, model:any) {
    
    const nGrid = 15;

    const ships:BattleshipGameShip[] = [];
    ships.push(new BattleshipGameShip(BattleshipShipType.BATTLESHIP, 1, 1, true, nGrid));
    ships.push(new BattleshipGameShip(BattleshipShipType.CARRIER, 3, 7, true, nGrid));
    ships.push(new BattleshipGameShip(BattleshipShipType.CRUISER, 5, 5, false, nGrid));
    ships.push(new BattleshipGameShip(BattleshipShipType.PATROL, 15, 2, true, nGrid));
    ships.push(new BattleshipGameShip(BattleshipShipType.SUB, 12, 12, false, nGrid));

    const yourGame = new BattleshipGameMap(nGrid, ships);
    
    const theirShips:BattleshipGameShip[] = [];

    const shipTypesNeeded = [
      BattleshipShipType.BATTLESHIP,
      BattleshipShipType.CARRIER,
      BattleshipShipType.CRUISER,
      BattleshipShipType.PATROL,
      BattleshipShipType.SUB,
    ]
    shipTypesNeeded.forEach((typ) => {

      while(true) {
        const ixCol = Math.floor(Math.random()*nGrid);
        const ixRow = Math.floor(Math.random()*nGrid);
  
        const shipAttempt = new BattleshipGameShip(typ, ixCol, ixRow, Math.random() > 0.5, nGrid);
        if(!shipAttempt.isValidPlacement()) {
          continue;
        }
  
        const intersect = theirShips.find((theirShip) => {
          return (theirShip.intersects(shipAttempt));
        });
        if(!intersect) {
          // we don't intersect other ships, we're good
          theirShips.push(shipAttempt);
          break;
        }
      }
    })

    const theirGame = new BattleshipGameMap(nGrid, theirShips);
      

    controller.startup(yourGame, theirGame);
  }
}
