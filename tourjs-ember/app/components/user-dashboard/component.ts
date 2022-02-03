import Component from '@ember/component';
import { assert2 } from 'bt-web2/shared/Utils';
import { User, UserDisplay } from 'bt-web2/shared/User';
import { RaceState } from 'bt-web2/shared/RaceState';
import { computed } from '@ember/object';

export default class UserDashboard extends Component.extend({
  // anything which *must* be merged to prototype here
  user: <User|null>null,
  frame: <number|null>null,
  raceState: <RaceState|null>null,

  classNames: ['user-dashboard__container'],
}) {
  // normal class body definition here
  didInsertElement() {
    assert2(this.get('raceState'));
    assert2(this.get('frame') !== undefined);

    const rs:RaceState|null = this.get('raceState');
    if(rs) {
      const user = rs.getLocalUser();
      if(user) {
        this.set('user', user);
      } else {
        throw new Error("Can't have a dashboard for a user that doesn't exist!");
      }
      
    } else {
      throw new Error("Can't have a dashboard when there's no race!");
    }
  }

  @computed("frame", "user")
  get userDisplay():UserDisplay|null {
    const rs:RaceState|null = this.get('raceState');
    if(rs) {
      const user = rs.getLocalUser();
      if(user) {
        const ret = user.getDisplay(rs);
        return ret;
      }
    }
    return null;
  }
};
