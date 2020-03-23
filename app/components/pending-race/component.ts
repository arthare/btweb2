import Component from '@ember/component';
import { assert2 } from 'bt-web2/server-client-common/Utils';

export default class PendingRace extends Component.extend({
  // anything which *must* be merged to prototype here
}) {
  // normal class body definition here
  didInsertElement() {
    assert2(this.joinRace);
  }
};
