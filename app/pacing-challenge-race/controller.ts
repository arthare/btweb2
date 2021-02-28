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
import { PacingChallengeResultSubmission } from 'bt-web2/server-client-common/communication';

export class PacingChallengeShortMap extends RideMapPartial implements RideMap {
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
export class PacingChallengeHills1 extends PacingChallengeShortMap {
  getLength() {
    if(window.location.hostname === 'localhost') {
      return 100;
    } else {
      return super.getLength();
    }
  }
  getElevationAtDistance(meters: number): number {    
    return 15*Math.cos(meters / 400) + 
           2.5*Math.cos(meters / 170) -
           7.5*Math.cos(meters /2200) +
           50*Math.cos(Math.cos(meters / 750)) - 25;
  }
}
export class PacingChallengeHills2 extends PacingChallengeShortMap {
  getBounds(): MapBounds {
    return {
      minElev:0,
      maxElev:60,
      minDist:0,
      maxDist:this.getLength(),
    }
  }
  getElevationAtDistance(meters: number): number {    
    return 12*Math.cos(meters / 300) + 
           6.5*Math.cos(meters / 150) +
           50*Math.cos(Math.cos(meters / 750)) - 25 + meters/250;
  }
}
export class PacingChallengeFlat extends PacingChallengeShortMap {
  getBounds(): MapBounds {
    return {
      minElev:0,
      maxElev:20,
      minDist:0,
      maxDist:this.getLength(),
    }
  }
  getElevationAtDistance(meters: number): number {    
    return 2*Math.sin(meters/1000);
  }
}
export class PacingChallengeLong extends PacingChallengeShortMap {
  getBounds(): MapBounds {
    return {
      minElev:-10,
      maxElev:60,
      minDist:0,
      maxDist:this.getLength(),
    }
  }
  getLength(): number {
    return 15000;
  }
  getElevationAtDistance(meters: number): number {    
    if(meters <= 1500) {
      // climb gradually from 0 to 15 meters at a steady grade
      return 0.01*meters;
    } else if(meters <= 3000) {
      // descend back down to zero elevation
      meters -= 1500;
      return 15 - meters*0.01;
    } else if(meters <= 5500) {
      meters -= 3000;
      return 12*Math.sin(meters / 300) + 
           6.5*Math.sin(meters / 150) +
           50*Math.sin(Math.sin(meters / 750));
    } else if (meters <= 7500) {
      // 2km perfectly flat
      const lastElev = this.getElevationAtDistance(5500);
      return lastElev;
    } else {
      // something siney to finish things off
      const lastElev = this.getElevationAtDistance(7500);
      meters -= 7500;
      return lastElev + 8*Math.sin(Math.pow(meters, 0.6) / 1300) + 
                        5.5*Math.sin(meters / 250) +
                        30*Math.sin(Math.sin(meters / 350));
    }
  }
}
export function getPacingChallengeMap(name:string):PacingChallengeShortMap {
  switch(name) {
    default:
    case 'hills1':
      return new PacingChallengeHills1();
    case 'hills2':
      return new PacingChallengeHills2();
    case 'flat':
      return new PacingChallengeFlat();
    case 'long':
      return new PacingChallengeLong();
  }

}

export class PacingChallengeUserProvider implements UserProvider {
  users: User[];

  constructor(localUserOverride:User, pctZeroToOne:number, mapLen:number) {
    if(!localUserOverride) {
      throw new Error("You need to have your devices set up before starting");
    }
    localUserOverride.setDistance(0);
    localUserOverride.setSpeed(10);
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
      if(user.getId() < 0) {
        user.setId(index);
      }
    });
  }

  getUsers(tmNow: number): User[] {
    return this.users.slice();
  }  
  
  getUser(id: number): User | null {
    return this.users.find((user) => user.getId() === id) || null;
  }


}

let pcRaceId = 0;

export default class PacingChallengeRace extends Controller.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service(),
  transitionedOut: false,

}) {
  // normal class body definition here
  pickedMapName = '';
  _map:PacingChallengeShortMap|null = null;
  _userProvider:PacingChallengeUserProvider|null = null;
  _raceState:RaceState|null = null;
  pctZeroTo100 = 0;
  handicapSecondsAllowed = 0;
  ticks = 0;
  startingSpeedJoules = 0;
  _id = 0;
  usedAllPower = false;

  _setup(params:{pct:string, map:string}) {
    this._id = pcRaceId++;
    this.set('usedAllPower', false);
    console.log("starting pacing challenge id ", this._id);

    this.set('transitionedOut', false);
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

    this.set('pickedMapName', params.map);
    this._map = getPacingChallengeMap(params.map);
    this._userProvider = new PacingChallengeUserProvider(localUser, pctAsFloat / 100, this._map.getLength());
    this.set('_raceState', new RaceState(this._map, this._userProvider, `Pacing-Challenge-${(pctAsFloat).toFixed(0)}%`));
    
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

    this.devices.startPowerTimer("pacing-challenge");
    this._tick();
  }

  _tick() {
    console.log(`pacing-challenge-race ${this._id} tick`);
    const tmNow = new Date().getTime();
    this.incrementProperty("ticks");
    this.devices.tick(tmNow, true);

    
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

      const submission:PacingChallengeResultSubmission = {
        mapName: this.get('pickedMapName'),
        "name": localUser.getName(),
        "time": result.totalTimeSeconds,
        "hsLeft": hsLeft,
        "pct": this.get('pctZeroTo100'),
      }

      return apiPost('pacing-challenge-result', submission).finally(() => {
        raceState.stop();
        this.devices.dumpPwx("Pacing-Challenge-Success", new Date().getTime());
        this.transitionToRoute('pacing-challenge');
      });

    }

    if(hsUsed > this.get('handicapSecondsAllowed')) {
      this.set('usedAllPower', true);
      this.devices.setPowerFilter((power:number) => {
        console.log("filtered ", power.toFixed(0), " watts to zero");
        return 0;
      });

      if(localUser.getSpeed() < 1.5) {
        alert(`You failed!\nYou used ${hsUsed.toFixed(1)} energies before finishing the course.`);
        raceState.stop();
        this.devices.dumpPwx("Pacing-Challenge-Failure", new Date().getTime());
        // we done here!
        return this.transitionToRoute('pacing-challenge');
      } else {
        // they're still coasting.  maybe they'll make it!
      }

    }


    if(!this.isDestroyed && !this.get('transitionedOut')) {
      setTimeout(() => {
        this._tick();
      }, 200);
    } else {
      raceState.stop();
    }
  }

  notifyTransitionOut() {
    this.set('transitionedOut', true);
  }

  @computed("ticks", "handicapSecondsAllowed", "usedAllPower")
  get pacingChallengeData():PacingChallengeOverlayData {

    if(!this._map) {
      throw new Error("No map");
    }
    if(!this.get('handicapSecondsAllowed')) {
      throw new Error("No limit on handi-seconds");
    }

    console.log("used all power? ", this.get('usedAllPower'));
    return {
      pctZeroToOne:this.get('pctZeroTo100') / 100,
      handicapSecondsAllowed:this.get('handicapSecondsAllowed'),
      mapLen:this._map.getLength(),
      endOfRideElevation: this._map?.getElevationAtDistance(this._map.getLength()),
      startOfRideElevation: this._map.getElevationAtDistance(0),
      speedJoulesToStart: this.get('startingSpeedJoules'),
      usedAllPower: this.get('usedAllPower'),
    }
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'pacing-challenge-race': PacingChallengeRace;
  }
}
