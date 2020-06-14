import { BattleshipGameShip, BattleshipShipType, BattleshipTurnResultMove } from "./battleship-game";
import { assert2 } from "./Utils";
import { ScheduleRacePostRequest } from "./ServerHttpObjects";

function shipTests() {
  
  { // hit detection
    let ship = new BattleshipGameShip(BattleshipShipType.BATTLESHIP, 0, 0, true, 20);
    assert2(ship.isShipPresent(0,0));
    assert2(ship.isShipPresent(0,1));
    assert2(ship.isShipPresent(0,2));
    assert2(ship.isShipPresent(0,3));
    assert2(ship.isShipPresent(0,4));

    // row below
    assert2(!ship.isShipPresent(1,1));
    assert2(!ship.isShipPresent(1,2));
    assert2(!ship.isShipPresent(1,3));
    assert2(!ship.isShipPresent(1,4));

    // is a vertical ship, so check the column beside
    assert2(!ship.isShipPresent(1,0));
    assert2(!ship.isShipPresent(2,0));
    assert2(!ship.isShipPresent(3,0));
    assert2(!ship.isShipPresent(4,0));
  
    ship.isVertical = false;
    assert2(ship.isShipPresent(0,0));
    assert2(ship.isShipPresent(1,0));
    assert2(ship.isShipPresent(2,0));
    assert2(ship.isShipPresent(3,0));
    assert2(ship.isShipPresent(4,0));

    // is a horizontal ship, so check the row below
    assert2(!ship.isShipPresent(0,1));
    assert2(!ship.isShipPresent(1,1));
    assert2(!ship.isShipPresent(2,1));
    assert2(!ship.isShipPresent(3,1));
    assert2(!ship.isShipPresent(4,1));

  }

  { // damage checks
    let ship = new BattleshipGameShip(BattleshipShipType.BATTLESHIP, 1, 1, false, 20);
    assert2(!ship.isSunk());

    let ret = ship.applyShot({ixCol: 1, ixRow: 1}); // hit the tip of the ship
    assert2(ship.damaged[0]);
    assert2(!ship.damaged[1]);
    assert2(!ship.damaged[2]);
    assert2(!ship.damaged[3]);
    assert2(!ship.damaged[4]);
    assert2(!ship.isSunk());
    assert2(ret.hit && !ret.newlysunk && !ret.sunk);
    ret = ship.applyShot({ixCol: 3, ixRow: 1}); // hit the middle of the ship
    assert2(ship.damaged[0]);
    assert2(!ship.damaged[1]);
    assert2(ship.damaged[2]);
    assert2(!ship.damaged[3]);
    assert2(!ship.damaged[4]);
    assert2(!ship.isSunk());
    assert2(ret.hit && !ret.newlysunk && !ret.sunk);

    // missed shots
    ret = ship.applyShot({ixCol: 1, ixRow: 2});
    assert2(!ret.hit && !ret.newlysunk && !ret.sunk);
    ret = ship.applyShot({ixCol: 2, ixRow: 2});
    assert2(!ret.hit && !ret.newlysunk && !ret.sunk);
    ret = ship.applyShot({ixCol: 3, ixRow: 2});
    assert2(!ret.hit && !ret.newlysunk && !ret.sunk);
    ret = ship.applyShot({ixCol: 4, ixRow: 2});
    assert2(!ret.hit && !ret.newlysunk && !ret.sunk);
    ret = ship.applyShot({ixCol: 5, ixRow: 2});
    assert2(!ret.hit && !ret.newlysunk && !ret.sunk);

    // same damage after this barrage of missed shots
    assert2(ship.damaged[0]);
    assert2(!ship.damaged[1]);
    assert2(ship.damaged[2]);
    assert2(!ship.damaged[3]);
    assert2(!ship.damaged[4]);

    // finish sinking the ship
    ret = ship.applyShot({ixCol: 2, ixRow: 1});
    assert2(ret.hit && !ret.newlysunk && !ret.sunk);

    ret = ship.applyShot({ixCol: 4, ixRow: 1});
    assert2(ret.hit && !ret.newlysunk && !ret.sunk);

    ret = ship.applyShot({ixCol: 5, ixRow: 1});
    assert2(ret.hit && ret.newlysunk && ret.sunk);
    assert2(ship.isSunk());

    // kick the dead horse
    ret = ship.applyShot({ixCol: 5, ixRow: 1});
    assert2(ret.hit && !ret.newlysunk && ret.sunk);
  }

  { // ship motion
    let ship = new BattleshipGameShip(BattleshipShipType.BATTLESHIP, 1, 1, false, 20);

    let ret:BattleshipTurnResultMove = ship.applyMove({ ship:BattleshipShipType.BATTLESHIP, ixCols: 1, ixRows: 0, push: false}); // east
    assert2(ship.ixTopLeftCol === 2 && ship.ixTopLeftRow === 1);
    assert2(ret.ixColsMoved === 1 && ret.ixRowsMoved === 0);
    
    ret = ship.applyMove({ ship:BattleshipShipType.BATTLESHIP, ixCols: 1, ixRows: 1, push: false}); // southeast
    assert2(ship.ixTopLeftCol === 3 && ship.ixTopLeftRow === 2);
    assert2(ret.ixColsMoved === 1 && ret.ixRowsMoved === 1);
    
    ret = ship.applyMove({ ship:BattleshipShipType.BATTLESHIP, ixCols: 0, ixRows: 1, push: false}); // south
    assert2(ship.ixTopLeftCol === 3 && ship.ixTopLeftRow === 3);
    assert2(ret.ixColsMoved === 0 && ret.ixRowsMoved === 1);
    
    ret = ship.applyMove({ ship:BattleshipShipType.BATTLESHIP, ixCols: -1, ixRows: 1, push: false}); // southwest
    assert2(ship.ixTopLeftCol === 2 && ship.ixTopLeftRow === 4);
    assert2(ret.ixColsMoved === -1 && ret.ixRowsMoved === 1);
    
    ret = ship.applyMove({ ship:BattleshipShipType.BATTLESHIP, ixCols: -1, ixRows: 0, push: false}); // west
    assert2(ship.ixTopLeftCol === 1 && ship.ixTopLeftRow === 4);
    assert2(ret.ixColsMoved === -1 && ret.ixRowsMoved === 0);
    
    ret = ship.applyMove({ ship:BattleshipShipType.BATTLESHIP, ixCols: -1, ixRows: -1, push: false}); // northwest
    assert2(ship.ixTopLeftCol === 0 && ship.ixTopLeftRow === 3);
    assert2(ret.ixColsMoved === -1 && ret.ixRowsMoved === -1);
    
    ret = ship.applyMove({ ship:BattleshipShipType.BATTLESHIP, ixCols: 0, ixRows: -1, push: false}); // north
    assert2(ship.ixTopLeftCol === 0 && ship.ixTopLeftRow === 2);
    assert2(ret.ixColsMoved === 0 && ret.ixRowsMoved === -1);
    
    ret = ship.applyMove({ ship:BattleshipShipType.BATTLESHIP, ixCols: 1, ixRows: -1, push: false}); // northeast
    assert2(ship.ixTopLeftCol === 1 && ship.ixTopLeftRow === 1);
    assert2(ret.ixColsMoved === 1 && ret.ixRowsMoved === -1);

    {// let's bounce it off the walls
      let ship = new BattleshipGameShip(BattleshipShipType.BATTLESHIP, 1, 1, false, 20);
      ret = ship.applyMove({ ship:BattleshipShipType.BATTLESHIP, ixCols: 0, ixRows: -100, push: false}); // north wall
      assert2(ship.ixTopLeftRow === 0, "should stop at top row");
      assert2(ret.ixRowsMoved === -1, "should have moved from row 1 to row 0");
      assert2(ret.ixColsMoved === 0, "we didn't ask for any col movement");


      ret = ship.applyMove({ ship:BattleshipShipType.BATTLESHIP, ixCols: 0, ixRows: 100, push: false}); // south wall
      assert2(ship.ixTopLeftRow === 19, "should stop when the rest of the boat hits the bottom");
      assert2(ret.ixRowsMoved === 19, "should have moved from row 0 to row 19");
      assert2(ret.ixColsMoved === 0, "we didn't ask for any col movement");

      ret = ship.applyMove({ ship:BattleshipShipType.BATTLESHIP, ixCols: 100, ixRows: -0, push: false}); // east wall
      assert2(ship.ixTopLeftCol === 15, "should stop when rest of boat hits east wall");
      for(var x = 0; x < 5; x++) {
        assert2(ship.isShipPresent(ship.ixTopLeftCol + x, ship.ixTopLeftRow));
        assert2(ship.isShipPresent(ship.ixTopLeftCol + x, ship.ixTopLeftRow - 1));
        assert2(ship.isShipPresent(ship.ixTopLeftCol + x, ship.ixTopLeftRow + 1));
      }
      assert2(ret.ixRowsMoved === 0, "should have moved from col 1 to col 15");
      assert2(ret.ixColsMoved === 14, "should have moved from col 1 to col 15");

      ret = ship.applyMove({ ship:BattleshipShipType.BATTLESHIP, ixCols: -100, ixRows: 0, push: false}); // west wall
      assert2(ship.ixTopLeftCol === 0, "should stop at west col");
      assert2(ret.ixRowsMoved === 0, "we didn't ask for any row movement");
      assert2(ret.ixColsMoved === -15, "should have moved from col 15 to col 0");
    }

  }
}

export function testBattleshipGame() {
  shipTests();
}