import Component from '@ember/component';
import { assert2 } from 'bt-web2/server-client-common/Utils';
import { RaceState } from 'bt-web2/server-client-common/RaceState';
import { computed } from '@ember/object';
import { ServerHttpGameListElement } from 'bt-web2/server-client-common/communication';
import Ember from 'ember';
import Devices from 'bt-web2/services/devices';

export default class DisplayRace extends Component.extend({
  // anything which *must* be merged to prototype here
  frame: 0,
  raceState: <RaceState|null>null,
  devices: <Devices><unknown>Ember.inject.service('devices'),
}) {
  // normal class body definition here
  didInsertElement() {
    const rs = this.get('raceState');
    assert2(rs);

    
    const fnUpdatePowers = () => {
      if(!this.isDestroyed) {
        this.incrementProperty('frame');

        setTimeout(fnUpdatePowers, 200);
      }
    }
    setTimeout(fnUpdatePowers);
  }

  @computed("frame")
  get recentHandicapChange():string|null {
    const tmNow = new Date().getTime();
    const localGuy = this.devices.getLocalUser();
    if(localGuy) {
      const tmHandicapChange = localGuy.getLastHandicapChangeTime();
      if(tmHandicapChange >= tmNow - 15000) {
        return localGuy.getHandicap().toFixed(1) + 'W';
      }
    }

    return null;
  }
};
