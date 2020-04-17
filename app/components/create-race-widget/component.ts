import Component from '@ember/component';
import { computed } from '@ember/object';
import { RideMapElevationOnly, PureCosineMap, RideMapPartial, RideMap } from 'bt-web2/server-client-common/RideMap';
import { SimpleElevationMap } from 'bt-web2/server-client-common/communication';
import { ScheduleRacePostRequest } from 'bt-web2/server-client-common/ServerHttpObjects';
import Ember from 'ember';
import Devices from 'bt-web2/services/devices';
import { apiPost } from 'bt-web2/set-up-ride/route';
import PlatformManager, { StravaMapSummary } from 'bt-web2/services/platform-manager';
import { writeToCharacteristic } from 'bt-web2/pojs/DeviceUtils';

export class RideMapResampleDistance extends RideMapPartial {
  _src:RideMapElevationOnly;
  _myDistance:number;
  constructor(src:RideMapElevationOnly, myDistance:number) {
    super();
    this._src = src;
    this._myDistance = myDistance;
  }
  getElevationAtDistance(meters: number): number {
    const pct = meters / this._myDistance;
    const theirDistance = pct * this._src.getLength();
    return this._src.getElevationAtDistance(theirDistance);
  }
  getLength(): number {
    return this._myDistance;
  }
}

export default class CreateRideWidget extends Component.extend({
  // anything which *must* be merged to prototype here
  meters: 20000,
  raceName: "My Ride",
  raceDate: new Date(new Date().getTime() + 5*3600*1000),
  raceTime: '12:00',
  classNames: ['create-race-widget__container'],
  race:<RideMapElevationOnly><unknown>null,
  stravaMapData:<RideMapElevationOnly><unknown>null,
  onRaceCreated:(req:ScheduleRacePostRequest)=>{},

  devices: <Devices><unknown>Ember.inject.service('devices'),
  platformManager: <PlatformManager><unknown>Ember.inject.service('platform-manager'),

  actions: {
    setUpStrava() {
      // gotta redirect them to a strava link, then callback to a server, and blah blah
      this.get('platformManager').getStravaMapList().then((mapList:StravaMapSummary[]) => {
        const names = mapList.map((map, index) => index + ') ' + map.name + ' (' + (map.distance/1000).toFixed(1) + 'km)');
        const pick = prompt("Select a map \n" + names.join('\n'));
        if(pick) {
          const pickNumber = parseInt(pick);
          if(isFinite(pickNumber)) {
            return this.get('platformManager').getStravaMapDetails(mapList[pickNumber]).then((mapDetails:RideMapElevationOnly) => {
              this.set('stravaMapData', mapDetails);
              this.set('meters', mapDetails.getLength());
              this.set('raceName', mapList[pickNumber].name);
            });
          }
        }
        debugger;
      })
    },
    createRace() {
      const race:RideMapElevationOnly = this.get('race');

      const raceDate = this.get('raceDate');
      const raceTime = this.get('raceTime');
      const raceTimeSplit = raceTime.split(':');
      if(raceTimeSplit.length !== 2) {
        throw new Error("Invalid/expected time");
      }
      const hoursOfDay = parseInt(raceTimeSplit[0]);
      if(!isFinite(hoursOfDay) || hoursOfDay < 0 || hoursOfDay >= 24) {
        throw new Error("Invalid hours");
      }
      const minutesOfHour = parseInt(raceTimeSplit[1]);
      if(!isFinite(minutesOfHour) || minutesOfHour < 0 || minutesOfHour >= 60) {
        throw new Error("Invalid minutes");
      }

      let date = new Date(raceDate);
      const offset = date.getTimezoneOffset()*60*1000;
      date = new Date(date.getTime() + offset);
      date.setHours(hoursOfDay);
      date.setMinutes(minutesOfHour);

      const localUser = this.devices.getLocalUser();
      if(!localUser) {
        throw new Error("You're not signed in!");
      }

      const req = new ScheduleRacePostRequest(race, 
                                              date,
                                              this.get('raceName'),
                                              localUser.getName());
      return apiPost('create-race', req).then(() => {
        this.onRaceCreated(req);
      }, (failure) => {
        console.error(failure);
        alert("Failed to create your ride");
      })
    }
  }
}) {
  // normal class body definition here

  didInsertElement() {

    let raceDateInitial = new Date();
    raceDateInitial = new Date(raceDateInitial.getTime() - raceDateInitial.getTimezoneOffset() * 60000);

    this.set('raceDate', raceDateInitial.toISOString().split('T')[0]);
    this.set('raceTime', ((new Date().getHours()+1)%24) + ':00');
    
    const localUser = this.devices.getLocalUser();
    if(!localUser) {
      throw new Error("You're not signed in!");
    }
    this.set('raceName', `${localUser.getName()}'s Race`);
  }

  @computed("meters", "rideName", "stravaMapData")
  get race():RideMapElevationOnly {
    const stravaMap = this.get('stravaMapData');
    if(stravaMap) {
      // we've got a strava map.  We will want to resample it
      return new RideMapResampleDistance(stravaMap, this.get('meters'));
    }
    return new PureCosineMap(parseInt('' + this.get('meters')));
  }

};
