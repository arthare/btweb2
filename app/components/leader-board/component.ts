import Component from '@ember/component';
import { UserDisplay } from 'bt-web2/server-client-common/User';
import { assert2 } from 'bt-web2/server-client-common/Utils';
import { RaceState } from 'bt-web2/server-client-common/RaceState';
import { computed } from '@ember/object';

export default class LeaderBoard extends Component.extend({
  // anything which *must* be merged to prototype here
  raceState:<RaceState|null>null,
  classNames: ['leader-board__container'],
}) {
  // normal class body definition here

  didInsertElement() {
    assert2(this.get('raceState'));
  }

  @computed("frame")
  get rankings():UserDisplay[]|null {
    const rs:RaceState|null = this.get('raceState');
    if(rs) {
      let users = rs.getUserProvider().getUsers();

      users = users.sort((u1, u2) => {
        return u1.getDistance() > u2.getDistance() ? -1 : 1;
      });
      return users.map((user) => user.getDisplay(rs));
    } else {
      return [];
    }
  }
};
