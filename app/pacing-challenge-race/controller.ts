import Controller from '@ember/controller';
import { User, UserTypeFlags, DEFAULT_CDA, DEFAULT_RHO, DEFAULT_HANDICAP_POWER, DEFAULT_GRAVITY, DEFAULT_CRR, DEFAULT_RIDER_MASS } from 'bt-web2/server-client-common/User';
import { RideMapPartial, RideMap, MapBounds } from 'bt-web2/server-client-common/RideMap';
import { UserProvider, RaceState } from 'bt-web2/server-client-common/RaceState';
import Ember from 'ember';
import Devices from 'bt-web2/services/devices';
import { PacingChallengeOverlayData } from 'bt-web2/components/pacing-challenge-overlay/component';
import { computed } from '@ember/object';
import { race } from 'rsvp';
import { apiPost } from 'bt-web2/set-up-ride/route';

class PacingChallengeMap extends RideMapPartial implements RideMap {
  getPowerTransform(who: User): (power: number) => number {
    return (power:number) => {
      return DEFAULT_HANDICAP_POWER*(power / who.getHandicap());
    }
  }
  getBounds(): MapBounds {
    return {
      minElev:-40,
      maxElev:50,
      minDist:0,
      maxDist:this.getLength(),
    }
    
  }
  getElevationAtDistance(meters: number): number {
    
    return 15*Math.cos(meters / 400) + 
           2.5*Math.cos(meters / 170) -
           7.5*Math.cos(meters /2200) +
           50*Math.cos(Math.cos(meters / 750)) - 25;
  }
  getLength(): number {
    return 5000;
  }
}

export class PacingChallengeUserProvider implements UserProvider {
  users: User[];

  constructor(localUserOverride:User, pctZeroToOne:number, mapLen:number) {
    if(!localUserOverride) {
      throw new Error("You need to have your devices set up before starting");
    }
    this.users = [
      localUserOverride,
    ];
    

    // generate a bunch of slow AIs so that the user has to overtake them and decide whether to stick around and draft or push harder
    // all the AIs will ride at 90% of the handicapped effort level, so they'll be easy to catch up to and not fast enough to be useful
    const n = 30;
    const aiLead = Math.min(mapLen / 2, 2000);
    for(var x = 1;x < n; x++) {
      const aiUser = new User(`AI ${n - x + 1}`, DEFAULT_RIDER_MASS, 100, UserTypeFlags.Ai | UserTypeFlags.Remote);
      aiUser.setDistance((x / n) * aiLead);
      aiUser.notifyPower(new Date().getTime(), 100 * pctZeroToOne * 0.9);
      this.users.push(aiUser);
    }
    this.users.forEach((user, index) => {
      user.setId(index);
    });
  }

  getUsers(tmNow: number): User[] {
    return this.users.slice();
  }  
  
  getUser(id: number): User | null {
    return this.users.find((user) => user.getId() === id) || null;
  }


}

export default class PacingChallengeRace extends Controller.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service(),
  
}) {
  // normal class body definition here
  _map:PacingChallengeMap|null = null;
  _userProvider:PacingChallengeUserProvider|null = null;
  _raceState:RaceState|null = null;
  pctZeroTo100 = 0;
  handicapSecondsAllowed = 0;
  ticks = 0;
  startingSpeedJoules = 0;

  _setup(params:{pct:string}) {

    const pctAsFloat = parseFloat(params.pct);
    if(pctAsFloat < 0 || pctAsFloat > 200) {
      throw new Error("Effort level out of range");
    }
    this.set('pctZeroTo100', pctAsFloat);

    const localUser = this.devices.getLocalUser();
    if(!localUser) {
      throw new Error("You don't have a user set up yet");
    }

    const pctZeroToOne = pctAsFloat / 100;


    this._map = new PacingChallengeMap();
    this._userProvider = new PacingChallengeUserProvider(localUser, pctAsFloat / 100, this._map.getLength());
    this._raceState = new RaceState(this._map, this._userProvider, `Pacing-Challenge-${(pctAsFloat).toFixed(0)}%`);
    
    // let's figure out how many handicap-seconds are allowed!
    const handicappedPower = DEFAULT_HANDICAP_POWER * pctZeroToOne;
    const joulesForCrr = DEFAULT_CRR * DEFAULT_RIDER_MASS * DEFAULT_GRAVITY * this._map.getLength();
    
    const expectedSteadyStateSpeedMetersPerSec = Math.pow(handicappedPower / (DEFAULT_CDA*DEFAULT_RHO*0.5), 0.333333333);
    const joulesForAero = (0.5 * DEFAULT_CDA * DEFAULT_RHO * Math.pow(expectedSteadyStateSpeedMetersPerSec, 2)) * this._map.getLength();
  
    const joulesForClimb = (this._map.getElevationAtDistance(this._map.getLength()) - this._map.getElevationAtDistance(0)) * DEFAULT_GRAVITY * DEFAULT_RIDER_MASS;

    const expectedCompletionTimeSeconds = (joulesForClimb + joulesForCrr + joulesForAero) / handicappedPower;

    // so we've figured out how fast the handicapped avatar will complete the course.
    // let's figure out what that means for our human rider.
    const expectedPower = localUser.getHandicap() * pctZeroToOne;
    const expectedJoulesAllowed = expectedPower * expectedCompletionTimeSeconds;
    const handicapSecondsAllowed = expectedJoulesAllowed / localUser.getHandicap();
    this.set('handicapSecondsAllowed', handicapSecondsAllowed);
    this.set('startingSpeedJoules', 0.5 * DEFAULT_RIDER_MASS * Math.pow(expectedSteadyStateSpeedMetersPerSec, 2));
    localUser.setDistance(0);
    localUser.setSpeed(expectedSteadyStateSpeedMetersPerSec);

    this._tick();
  }

  _tick() {
    const tmNow = new Date().getTime();
    this.incrementProperty("ticks");
    this.devices.tick(tmNow, false);

    
    const localUser = this.devices.getLocalUser();
    if(!localUser) {
      throw new Error("You don't have a user set up yet");
    }
    const map = this._map;
    if(!map) {
      throw new Error("No map");
    }
    const raceState = this._raceState;
    if(!raceState) {
      throw new Error("No racestate");
    }
    const result = this.devices.getPowerCounterAverage(tmNow, "pacing-challenge");
    const hsUsed = result.joules / localUser.getHandicap();

    if(localUser.getDistance() >= map.getLength()) {
      
      
      alert(`You made it!\nIt took you ${result.totalTimeSeconds.toFixed(1)} seconds and you used ${hsUsed.toFixed(1)} energies.`);

      raceState.stop();

      const hsLeft = this.get("handicapSecondsAllowed") - hsUsed;
      return apiPost('pacing-challenge-result', {
        "name": localUser.getName(),
        "time": result.totalTimeSeconds,
        "hsLeft": hsLeft.toFixed(1),
        "pct": this.get('pctZeroTo100'),
      }).finally(() => {
        raceState.stop();
        this.devices.dumpPwx(new Date().getTime());
        this.transitionToRoute('pacing-challenge');
      });

    }

    if(hsUsed > this.get('handicapSecondsAllowed')) {
      alert(`You failed!\nYou used ${hsUsed.toFixed(1)} energies before finishing the course.`);
      raceState.stop();
      this.devices.dumpPwx(new Date().getTime());

      // we done here!
      return this.transitionToRoute('pacing-challenge');
    }


    if(!this.isDestroyed) {
      setTimeout(() => {
        this._tick();
      }, 200);
    }
  }

  @computed("ticks", "handicapSecondsAllowed")
  get pacingChallengeData():PacingChallengeOverlayData {

    if(!this._map) {
      throw new Error("No map");
    }
    if(!this.get('handicapSecondsAllowed')) {
      throw new Error("No limit on handi-seconds");
    }

    return {
      pctZeroToOne:this.get('pctZeroTo100') / 100,
      handicapSecondsAllowed:this.get('handicapSecondsAllowed'),
      mapLen:this._map.getLength(),
      endOfRideElevation: this._map?.getElevationAtDistance(this._map.getLength()),
      startOfRideElevation: this._map.getElevationAtDistance(0),
      speedJoulesToStart: this.get('startingSpeedJoules'),
    }
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'pacing-challenge-race': PacingChallengeRace;
  }
}
