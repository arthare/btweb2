import Route from '@ember/routing/route';
import { BattleshipGameShip, BattleshipShipType, BattleshipGameMap, BattleshipMapCreate, BattleshipMapCreateResponse, inflateMap, BATTLESHIP_DEFAULT_GRIDSIZE } from 'bt-web2/server-client-common/battleship-game';
import { apiPost, apiGet } from 'bt-web2/set-up-ride/route';
import Ember from 'ember';
import Devices from 'bt-web2/services/devices';

export default class Battleship extends Route.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service('devices'),
}) {
  // normal class body definition here

  model() {
    const shipTypesNeeded = [
      BattleshipShipType.BATTLESHIP,
      BattleshipShipType.CARRIER,
      BattleshipShipType.CRUISER,
      BattleshipShipType.PATROL,
      BattleshipShipType.SUB,
    ]
    const nGrid = BATTLESHIP_DEFAULT_GRIDSIZE;
    const yourShips:BattleshipGameShip[] = [];
    shipTypesNeeded.forEach((typ) => {

      while(true) {
        const ixCol = Math.floor(Math.random()*nGrid);
        const ixRow = Math.floor(Math.random()*nGrid);
  
        const shipAttempt = new BattleshipGameShip(typ, ixCol, ixRow, Math.random() > 0.5, nGrid);
        if(!shipAttempt.isValidPlacement()) {
          continue;
        }
  
        const intersect = yourShips.find((theirShip) => {
          return (theirShip.intersects(shipAttempt));
        });
        if(!intersect) {
          // we don't intersect other ships, we're good
          yourShips.push(shipAttempt);
          break;
        }
      }
    })

    const user = this.get('devices').getLocalUser();
    if(user) {
      const mapCreate:BattleshipMapCreate = {
        nGrid,
        ships: yourShips,
        mapId: `${user.getName()} @ ${user.getHandicap().toFixed(0)}W`,
      }
  
      return apiPost('create-battleship-map', mapCreate).then((mapCreateResponse:BattleshipMapCreateResponse) => {
        // we also need to do an initial lookup for the other maps available to shoot at
        return apiGet('battleship-waiting-players').then((waitingPlayers) => {
          return {
            mapCreate: mapCreateResponse,
            waitingPlayers,
          }
        })
      })
    } else {
      return Promise.reject("You need to set a user up first");
    }

  }

  setupController(controller:any, model:{mapCreate:BattleshipMapCreateResponse, waitingPlayers:string[]}) {
    
    // the model will be the response from create-battleship-map
    const yourGame = inflateMap(model.mapCreate.create);
    controller.startup(yourGame);
    controller.set('otherGames', model.waitingPlayers);
    controller.set('yourGameId', model.mapCreate.mapId);
  }
}
