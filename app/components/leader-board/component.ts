import Component from '@ember/component';
import { UserDisplay, UserTypeFlags, User, DistanceHistoryElement, DEFAULT_HANDICAP_POWER, DEFAULT_RIDER_MASS } from 'bt-web2/server-client-common/User';
import { assert2 } from 'bt-web2/server-client-common/Utils';
import { RaceState } from 'bt-web2/server-client-common/RaceState';
import { computed } from '@ember/object';

function formatDelta(secondsAhead:number) {
  const prefix = secondsAhead >= 0 ? '' : '-';

  if(secondsAhead > -10 && secondsAhead < 10) {
    return `${prefix}${Math.abs(secondsAhead).toFixed(2)}s`
  } else if(secondsAhead > -60 && secondsAhead < 60) {
    return `${prefix}${Math.abs(secondsAhead).toFixed(1)}s`
  } else {
    // minutes!
    const absSeconds = Math.abs(secondsAhead);
    const m = Math.floor(absSeconds / 60);
    const s = absSeconds - m*60;

    return `${prefix}${m.toFixed(0)}m${s.toFixed(0)}s`;
  }
}

interface CompactedUser {
  rank:string;
  user:User;
}

function compactUserList(users:User[]):CompactedUser[] {
  let compacted:CompactedUser[] = [];
  let lastUser = users[0];
  let ixStartOfGroup = 0;

  const localUser = users.find((user) => user.getUserType() & UserTypeFlags.Local);
  if(!localUser) {
    return;
  }

  for(var x = 0; x < users.length; x++) {
    const thisUser = users[x];
    if(lastUser.getUserType() & UserTypeFlags.Ai) {
      if(thisUser.getUserType() & UserTypeFlags.Ai) {
        // just continuing a run of AIs
      } else {
        // finished a run of AIs
        const compactedUser = new User("Gr. " + lastUser.getName(), DEFAULT_RIDER_MASS, DEFAULT_HANDICAP_POWER, lastUser.getUserType());

        const leadOfGroup = users[ixStartOfGroup];
        const isBeatingLocal = leadOfGroup.getDistance() > localUser.getDistance();
        const representativeRider = isBeatingLocal ? lastUser : leadOfGroup;

        compactedUser.setDistance(representativeRider.getDistance());
        compactedUser.setSpeed(representativeRider.getSpeed());
        compactedUser.setDistanceHistory(representativeRider.getDistanceHistory());
        compacted.push({
          user: compactedUser,
          rank: `#${ixStartOfGroup+1}`
        });
        compacted.push({
          user: thisUser,
          rank: `#${x+1}`,
        });
        ixStartOfGroup = x+1;
      }
    } else {
      // last user was not an AI, so they must have been put in the list
      if(thisUser.getUserType() & UserTypeFlags.Ai) {
        // just continue a run of AIs
      } else {
        // this user is also not an AI, so they gotta go in
        compacted.push({
          user: thisUser,
          rank: `#${x+1}`,
        });
        ixStartOfGroup = x+1;
      }
    }

    lastUser = thisUser;
  }

  // if the last user was an AI, then they wouldn't have gotten inserted
  if(lastUser.getUserType() & UserTypeFlags.Ai) {
    const compactedUser = new User("Gr. " + lastUser.getName(), DEFAULT_RIDER_MASS, DEFAULT_HANDICAP_POWER, lastUser.getUserType());
    const leadOfGroup = users[ixStartOfGroup];
    const isBeatingLocal = leadOfGroup.getDistance() > localUser.getDistance();
    const representativeRider = isBeatingLocal ? lastUser : leadOfGroup;

    compactedUser.setDistance(representativeRider.getDistance());
    compactedUser.setSpeed(representativeRider.getSpeed());
    compactedUser.setDistanceHistory(representativeRider.getDistanceHistory());
    compacted.push({
      user: compactedUser,
      rank: `#${ixStartOfGroup+1}`
    });
  }
  return compacted;
}

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
      if(users.length <= 0) {
        return null;
      }
      users = users.sort((u1, u2) => {
        return u1.getDistance() > u2.getDistance() ? -1 : 1;
      });


      // let's compact groups of Ais
      let compactedUsers = compactUserList(users);

      let ixUser = 0;
      let localUser:User|null = null;
      for(var x = 0;x < compactedUsers.length; x++) {
        if(compactedUsers[x].user.getUserType() & UserTypeFlags.Local) {
          ixUser = x;
          localUser = compactedUsers[x].user;
          break;
        }
      }
      if(!localUser) {
        return [];
      }

      let nToShow = 6;
      let ixStart = Math.max(0, Math.min(compactedUsers.length - nToShow, ixUser - 2));
      let ixEnd = Math.min(ixStart + nToShow, users.length);
      compactedUsers = compactedUsers.slice(ixStart, ixEnd);

      return compactedUsers.map((compacted, index) => {

        const user = compacted.user;
        const display:UserDisplay = Object.assign({rankString: compacted.rank}, compacted.user.getDisplay(rs))

        if(localUser && user.getId() !== localUser.getId()) {
          if(user.getDistance() > localUser.getDistance()) {
            // this rider is ahead of our local hero.
            const secondsAhead = user.getSecondsAgoToCross(tmNow, localUser.getDistance());
            if(secondsAhead !== null && secondsAhead > 1) {
              display.secondsDelta = formatDelta(secondsAhead);
            }
          } else {
            const secondsAhead = localUser.getSecondsAgoToCross(tmNow, user.getDistance());
            if(secondsAhead !== null && secondsAhead > 1) {
              display.secondsDelta = formatDelta(-secondsAhead);
            }
          }
        }

        return display;
      });
    } else {
      return [];
    }
  }
};
