import Component from '@ember/component';
import { assert2 } from 'bt-web2/server-client-common/Utils';

export default class DisplayRace extends Component.extend({
  // anything which *must* be merged to prototype here
}) {
  // normal class body definition here
  didInsertElement() {
    const rs = this.get('raceState');
    assert2(rs);
  }
};
