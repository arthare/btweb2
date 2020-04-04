import Component from '@ember/component';
import { UserDisplay, UserTypeFlags } from 'bt-web2/server-client-common/User';
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
    const tmNow = new Date().getTime();
    const rs:RaceState|null = this.get('raceState');
    if(rs) {
      let users = rs.getUserProvider().getUsers(tmNow);

      users = users.sort((u1, u2) => {
        return u1.getDistance() > u2.getDistance() ? -1 : 1;
      });

      // let's figure out which 6 people are around our guy
      const finalUsers:User[] = [];

      let ixUser = 0;
      for(var x = 0;x < users.length; x++) {
        if(users[x].getUserType() & UserTypeFlags.Local) {
          ixUser = x;
          break;
        }
      }

      let nToShow = 5;
      let ixStart = Math.max(0, Math.min(users.length - nToShow - 1, ixUser - 2));
      let ixEnd = Math.min(ixStart + nToShow, users.length - 1);
      users = users.slice(ixStart, ixEnd);

      return users.map((user, index) => {
        return Object.assign({rankString: `#${ixStart+index+1}`}, user.getDisplay(rs)
        );
      });
    } else {
      return [];
    }
  }
};
