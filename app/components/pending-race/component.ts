import Component from '@ember/component';
import { assert2, formatSecondsHms } from 'bt-web2/server-client-common/Utils';
import { ServerHttpGameListElement, CurrentRaceState, getElevationFromEvenSpacedSamples, SimpleElevationMap } from 'bt-web2/server-client-common/communication';
import { computed } from '@ember/object';
import { RideMapElevationOnly } from 'bt-web2/server-client-common/RideMap';
import { RideMapHandicap } from 'bt-web2/server-client-common/RideMapHandicap';

export default class PendingRace extends Component.extend({
  // anything which *must* be merged to prototype here
  classNames: ['pending-race__content'],
  race:<ServerHttpGameListElement|null>null,
}) {
  // normal class body definition here
  didInsertElement() {
    assert2(this.joinRace);
  }

  @computed("race")
  get raceTime():string {
    const race = this.get('race');
    if(race) {
      return new Date(race.tmScheduledStart).toLocaleString();
    } else {
      return "Unknown";
    }
  }

  @computed("race")
  get hasWhen():boolean {
    const race = this.get('race');
    if(race) {
      return !!(race.tmActualStart > 0 || race.tmScheduledStart > 0);
    } else {
      return false;
    }
  }

  @computed("race", "frame")
  get lengthString():string {
    const race = this.get('race');
    if(race) {
      return `${(race.lengthMeters / 1000).toFixed(1)}km`;
    } else {
      return "Unknown";
    }
  }

  @computed("race")
  get raceElevations():RideMapElevationOnly|null {
    const race = this.get('race');
    if(race) {
      return new SimpleElevationMap(race.elevations, race.lengthMeters);
    } else {
      return null;
    }
  }

  @computed("race", "frame")
  get statusString():string {
    const race = this.get('race');
    if(!race) {
      return "Unknown";
    }
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
