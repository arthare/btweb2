import Component from '@ember/component';
import { assert2 } from 'bt-web2/server-client-common/Utils';
import { RaceState } from 'bt-web2/server-client-common/RaceState';

export default class DisplayRace extends Component.extend({
  // anything which *must* be merged to prototype here
  frame: 0,
  raceState: <RaceState|null>null,
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
};
