import Component from '@ember/component';
import { RaceResultSubmission } from 'bt-web2/server-client-common/communication';
import Devices, { dumpRaceResultToPWX } from 'bt-web2/services/devices';
import { apiGet } from 'bt-web2/set-up-ride/route';
import Ember from 'ember';
import md5 from 'ember-md5';
import { USERSETUP_KEY_IMAGE } from '../user-set-up-widget/component';

type Riders = {name:string;rides:RaceResultSubmission[]};

export default class StoredData extends Component.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service(),
  
  classNames: ['stored-data__content'],

  hasData: false,
  triedToGetData: false,
  userHasImageSet: false,

  imageUpdateCount: 0,
  yourImage: '',

  riders: <Riders[]>[],

  observeImage: Ember.observer('devices.ridersVersion', function(this:StoredData) {
    this.incrementProperty('imageUpdateCount');
    const myReqNumber = this.get('imageUpdateCount');

    const localUser = this.devices.getLocalUser();
    if(localUser) {
      const imgBase64 = window.localStorage.getItem(USERSETUP_KEY_IMAGE);
      
      this.set('userHasImageSet', !!imgBase64);
      if(imgBase64) {
        this.set('yourImage', imgBase64);
        const md5Result = md5(imgBase64);
        const arg = {imageMd5: md5Result};
        console.log("looking up past data with ", imgBase64.length, "-long image that hashes to ", md5Result); 
        
        apiGet('user-ride-results', arg).then((rideResults:{[key:string]:RaceResultSubmission[]}) => {
          this.set('triedToGetData', true);
          if(myReqNumber === this.get('imageUpdateCount')) {
            // ok, there hasn't been a new request since we spawned this one
            const riders = [];
            for(var key in rideResults) {
              riders.push({
                name: key,
                rides: rideResults[key],
              })
            }
            this.set('hasData', riders.length > 0);
            this.set('riders', riders);
          }
        }).finally(() => {
          this.set('triedToGetData', true);
        })
      }
    }
  }),

  actions: {
    downloadRide(ride:RaceResultSubmission) {
      dumpRaceResultToPWX(ride);
    },
    downloadImg() {
      const user = this.devices.getLocalUser();
      if(user) {
        const img = this.get('yourImage');
        var data = new Blob([img], {type: 'application/octet-stream'});
        var url = window.URL.createObjectURL(data);
        const linky = document.createElement('a');
        linky.href = img;
        linky.download = `${user.getName()}-security-image.png`;
        linky.target="_blank";
        document.body.appendChild(linky);
        linky.click();
        document.body.removeChild(linky);
      }
    }
  }

}) {
  // normal class body definition here
  didInsertElement() {
    this.observeImage();
  }
};
