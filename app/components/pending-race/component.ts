import Component from '@ember/component';
import { assert2, formatSecondsHms } from 'bt-web2/server-client-common/Utils';
import { ServerHttpGameListElement, CurrentRaceState } from 'bt-web2/server-client-common/communication';
import { computed } from '@ember/object';

export default class PendingRace extends Component.extend({
  // anything which *must* be merged to prototype here
}) {
  // normal class body definition here
  didInsertElement() {
    assert2(this.joinRace);
  }

  @computed("race")
  get raceTime():string {
    const race:ServerHttpGameListElement = this.get('race');

    return new Date(race.tmScheduledStart).toLocaleString();
  }

  @computed("race")
  get hasWhen():boolean {
    const race:ServerHttpGameListElement = this.get('race');
    return !!(race.tmActualStart > 0 || race.tmScheduledStart > 0);
  }

  @computed("race", "frame")
  get lengthString():string {
    const race:ServerHttpGameListElement = this.get('race');
    return `${(race.lengthMeters / 1000).toFixed(1)}km`;
  }

  @computed("race", "frame")
  get statusString():string {
    const race:ServerHttpGameListElement = this.get('race');
    const frame = this.get('frame');

    switch(race.status) {
      case CurrentRaceState.PostRace:
        return "Finished!";
      case CurrentRaceState.PreRace:
      {
        if(race.tmScheduledStart <= 0) {
          return "Will start when players join";
        }
        const msToStart = race.tmScheduledStart - new Date().getTime();
        if(msToStart > 0) {
          return `Starting in ${formatSecondsHms(msToStart/1000)}`;
        } else {
          return `Started ${formatSecondsHms(-msToStart/1000)} ago`;
        }
      }
      case CurrentRaceState.Racing:
      {
        const msToStart = race.tmActualStart - new Date().getTime();
        if(msToStart > 0) {
          return `Starting in ${formatSecondsHms(msToStart/1000)}`;
        } else {
          return `Started ${formatSecondsHms(-msToStart/1000)} ago`;
        }
      }
    }
  }
};
