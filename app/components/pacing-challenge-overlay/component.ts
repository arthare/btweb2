import Component from '@ember/component';
import Devices, { PowerTimerAverage } from 'bt-web2/services/devices';
import {computed} from '@ember/object';
import Ember from 'ember';
import { DEFAULT_GRAVITY, DEFAULT_HANDICAP_POWER, DEFAULT_RIDER_MASS } from 'bt-web2/server-client-common/User';

interface PacingChallengeDisplayData {
  powerRemaining:string;
  powerRemainingPerKm:string;
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
    const timerData = this.devices.getPowerCounterAverage("pacing-challenge");

    const mySettings:PacingChallengeOverlayData = this.get('overlayData');
    const user = this.devices.getLocalUser();
    if(!user) {
      throw new Error("Uh-oh");
    }

    
    const climbingLeft = mySettings.endOfRideElevation - user.getLastElevation();
    const climbingJoulesLeft = climbingLeft * DEFAULT_GRAVITY * DEFAULT_RIDER_MASS;
    const climbingHandicapSecondsLeft = climbingJoulesLeft / DEFAULT_HANDICAP_POWER;

    const climbingUsed = mySettings.startOfRideElevation - user.getLastElevation();
    const climbingJoulesUsed = climbingUsed * DEFAULT_GRAVITY * DEFAULT_RIDER_MASS;
    const speedJoulesStillOwned = 0.5 * DEFAULT_RIDER_MASS * Math.pow(user.getSpeed(),2) - mySettings.speedJoulesToStart;
    const climbingHandicapSecondsUsed = (climbingJoulesUsed-speedJoulesStillOwned) / DEFAULT_HANDICAP_POWER;

    const joulesUsed = timerData.joules;
    const handicapSecondsUsed = ((joulesUsed) / user.getHandicap()) + climbingHandicapSecondsUsed;
    const handicapSecondsLeft = mySettings.handicapSecondsAllowed - handicapSecondsUsed;

    const kmLeft = Math.max(0.001, (mySettings.mapLen - user.getDistance()) / 1000);

    return {
      powerRemaining: (handicapSecondsLeft - climbingHandicapSecondsLeft).toFixed(1),
      powerRemainingPerKm: (handicapSecondsLeft / kmLeft).toFixed(1),
      powerUsedPerKm: (handicapSecondsUsed / (user.getDistance() / 1000)).toFixed(1),
    }
  }
};
