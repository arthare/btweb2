import Component from '@ember/component';
import { computed } from '@ember/object';
import { RideMapElevationOnly, PureCosineMap, RideMapPartial, RideMap } from 'bt-web2/server-client-common/RideMap';
import { SimpleElevationMap } from 'bt-web2/server-client-common/communication';
import { ScheduleRacePostRequest } from 'bt-web2/server-client-common/ServerHttpObjects';
import Ember from 'ember';
import Devices from 'bt-web2/services/devices';
import { apiPost } from 'bt-web2/set-up-ride/route';
import PlatformManager, { ElevDistanceMap, StravaMapSummary } from 'bt-web2/services/platform-manager';
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

function handleFileSelect(this:CreateRideWidget, evt:any) {
  var files = evt.target.files; // FileList object
  // Loop through the FileList and render image files as thumbnails.
  for (var i = 0, f; f = files[i]; i++) {

    // Only process image files.
    if(!f.name.endsWith('.gpx')) {
      continue;
    }

    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = (theFile) => {
      const xml:string|undefined|null|ArrayBuffer = theFile.target?.result;
      if(!(typeof xml === 'string')) {
        console.error("File contents showed up as ", theFile.target?.result);
        alert("Couldn't parse.");
        return;
      }
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml,"text/xml");

      const trackPoints = xmlDoc.querySelectorAll('trkseg trkpt');
      if(trackPoints.length <= 0) {
        alert("No dist/elev data found");
        return;
      }

      let distances:number[] = [0];
      let elevs:number[] = [parseFloat(trackPoints[0].querySelector('ele').innerHTML)];
      if(!isFinite(elevs[0]) && isNaN(elevs[0])) {
        alert("Failed to parse data");
        return;
      }
      let cumeDistance = 0;
      [...trackPoints].slice(1).forEach((trkpt, index) => {
        // these individually look like:
        //<trkpt lon="-80.48777635" lat="43.4883684333">
        //  <time>2013-02-06T18:44:15Z</time>
        //  <ele>330.387824331</ele>
        //</trkpt>
        // so now we have to measure distances from each latlng and spit it into a ElevDistanceMap
        const realIndex = index + 1;
        const last = trackPoints[realIndex - 1];
        const lastLatLng = {
          latitude: parseFloat(last.attributes['lat'].value),
          longitude: parseFloat(last.attributes['lon'].value),
        };
        const thisLatLng = {
          latitude: parseFloat(trkpt.attributes['lat'].value),
          longitude: parseFloat(trkpt.attributes['lon'].value),
        };
        const distThisStep = (window as any).geolib.getDistance(lastLatLng, thisLatLng, 0.1);
        const elevThisStep = parseFloat(trkpt.querySelector('ele')?.innerHTML || "");
        cumeDistance += distThisStep;

        
        if(!isFinite(cumeDistance) && isNaN(cumeDistance)) {
          alert("Failed to parse data");
          return;
        }
        
        if(!isFinite(elevThisStep) && isNaN(elevThisStep)) {
          alert("Failed to parse data");
          return;
        }
        distances.push(cumeDistance);
        elevs.push(elevThisStep);
      })

      if(distances.length > 0 && elevs.length > 0 && distances.length === elevs.length) {
        // we good!
        this.set('uploadMapData', new ElevDistanceMap(elevs, distances));
        this.set('stravaMapData', null);
      } else {
        alert("Failed to import map data");
      }
    };

    // Read in the image file as a data URL.
    reader.readAsText(f);
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
  uploadMapData:<RideMapElevationOnly><unknown>null,
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
    buildFromTcx() {
      
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

    const files = this.element.querySelector('input[type="file"]');
    if(files) {
      files.addEventListener('change', handleFileSelect.bind(this), false);
    }

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

  @computed("meters", "rideName", "stravaMapData", "uploadMapData")
  get race():RideMapElevationOnly {
    const stravaMap = this.get('stravaMapData');
    if(stravaMap) {
      // we've got a strava map.  We will want to resample it
      return new RideMapResampleDistance(stravaMap, this.get('meters'));
    }
    const uploadMap = this.get('uploadMapData');
    if(uploadMap) {
      return new RideMapResampleDistance(uploadMap, this.get('meters'));
    }
    return new PureCosineMap(parseInt('' + this.get('meters')));
  }

};
