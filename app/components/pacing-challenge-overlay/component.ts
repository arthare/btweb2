import Component from '@ember/component';
import Devices, { PowerTimerAverage } from 'bt-web2/services/devices';
import {computed} from '@ember/object';
import Ember from 'ember';
import { DEFAULT_GRAVITY, DEFAULT_HANDICAP_POWER, DEFAULT_RIDER_MASS } from 'bt-web2/server-client-common/User';

interface PacingChallengeDisplayData {
  powerRemaining:string;
  powerRemainingPerKm:string;

  rawPowerRemaining:string;
  rawPowerRemainingPerKm:string;

  powerUsed:string;
  powerUsedPerKm:string;
}
export interface PacingChallengeOverlayData {
  pctZeroToOne:number;
  handicapSecondsAllowed:number;
  mapLen:number;
  endOfRideElevation:number;
  startOfRideElevation:number;
  speedJoulesToStart:number;
}

export default class PacingChallengeOverlay extends Component.extend({
  // anything which *must* be merged to prototype here
  classNames: ['pacing-challenge-overlay__container'],
  devices: <Devices><unknown>Ember.inject.service(),
  overlayData:<PacingChallengeOverlayData><unknown>null,
}) {
  // normal class body definition here
  

  didInsertElement() {
    this.devices.startPowerTimer("pacing-challenge");
    

  }

  @computed("frame")
  get powerData():PacingChallengeDisplayData {
    const tmNow = new Date().getTime();
    const timerData = this.devices.getPowerCounterAverage(tmNow, "pacing-challenge");

    const mySettings:PacingChallengeOverlayData = this.get('overlayData');
    const user = this.devices.getLocalUser();
    if(!user) {
      throw new Error("Uh-oh");
    }

    
    const climbingLeft = mySettings.endOfRideElevation - user.getLastElevation();
    const climbingJoulesLeft = climbingLeft * DEFAULT_GRAVITY * DEFAULT_RIDER_MASS;
    const climbingHandicapSecondsLeft = Math.max(0, climbingJoulesLeft / DEFAULT_HANDICAP_POWER);

    const velocityJoulesLeft = 0.5 * DEFAULT_RIDER_MASS * Math.pow(user.getSpeed(), 2);
    const velocityHandicapSecondsLeft = velocityJoulesLeft / DEFAULT_HANDICAP_POWER;

    const joulesUsed = timerData.joules;
    const handicapSecondsUsed = ((joulesUsed) / user.getHandicap());
    const handicapSecondsLeft = mySettings.handicapSecondsAllowed - handicapSecondsUsed;

    const kmLeft = Math.max(0.001, (mySettings.mapLen - user.getDistance()) / 1000);

    const powerRemaining = (handicapSecondsLeft - climbingHandicapSecondsLeft + velocityHandicapSecondsLeft);
    const rawPowerRemaining = handicapSecondsLeft;

    return {
      powerRemaining: powerRemaining.toFixed(0),
      powerRemainingPerKm: (powerRemaining / kmLeft).toFixed(0),

      rawPowerRemaining: (rawPowerRemaining).toFixed(0),
      rawPowerRemainingPerKm: (rawPowerRemaining / kmLeft).toFixed(0),

      powerUsed: handicapSecondsUsed.toFixed(),
      powerUsedPerKm: (handicapSecondsUsed / (user.getDistance() / 1000)).toFixed(1),
    }
  }
};
