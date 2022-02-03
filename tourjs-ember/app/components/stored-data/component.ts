import Component from '@ember/component';
import { RaceResultSubmission } from 'bt-web2/shared/communication';
import { assert2 } from 'bt-web2/shared/Utils';
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
  override: '',
  yourImage: '',

  riders: <Riders[]>[],

  yourmd5: Ember.computed('yourImage', 'override', function() {
    console.log("your md5");
    if(this.get('override')) {
      return this.get('override');
    } else {
      const user = this.devices.getLocalUser();
      if(user && user.getBigImageMd5()) {
        return user.getBigImageMd5();
      } else {
        const imgBase64 = this.get('yourImage')
        const md5Result = md5(imgBase64);
        return md5Result;
      }
    }
  }),
  observeImage: Ember.observer('devices.ridersVersion', function(this:StoredData) {

    const localUser = this.devices.getLocalUser();
    if(localUser) {
      const imgBase64 = window.localStorage.getItem(USERSETUP_KEY_IMAGE);
      
      this.set('userHasImageSet', !!imgBase64);
      if(imgBase64) {
        this.set('yourImage', imgBase64);
      }
    }
  }),

  observeMd5: Ember.observer('yourmd5', function(this:StoredData) {
    const md5Result = this.get('yourmd5');
    const arg = {imageMd5: md5Result};
    this.incrementProperty('imageUpdateCount');
    const myReqNumber = this.get('imageUpdateCount');
    
    apiGet('user-ride-results', arg).then((rideResults:{[key:string]:RaceResultSubmission[]}) => {
      if(this.isDestroyed) {
        return;
      }
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
      if(this.isDestroyed) return;

      this.set('triedToGetData', true);
    })
  }),

  actions: {
    downloadRide(targetRide:RaceResultSubmission) {

      assert2(targetRide.samples.length === 0, "we're expecting the parameter here to be a basic ride.  we need to ask the server for the whole thing");

      const yourMd5 = this.get('yourmd5')
      const md5Result = this.get('override') || yourMd5;
      const arg = {tmStart: targetRide.tmStart, riderName: targetRide.riderName, imageMd5: md5Result};

      return apiGet('user-ride-result', arg).then((fullResult:RaceResultSubmission) => {
        assert2(fullResult.samples.length > 0, "the one we fetch specifically should have full samples");
        assert2(fullResult.tmStart === targetRide.tmStart && 
                fullResult.rideName === targetRide.rideName);
        dumpRaceResultToPWX(fullResult);
      })
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
    this.observeMd5();
  }
};
