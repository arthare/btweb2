import Route from '@ember/routing/route';
import { USERSETUP_KEY_IMAGE, USERSETUP_KEY_NAME, USERSETUP_KEY_HANDICAP, storeFromVirginImage } from 'bt-web2/components/user-set-up-widget/component';
import Ember from 'ember';
import Devices from 'bt-web2/services/devices';
import md5 from 'ember-md5';

export default class Application extends Route.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service('devices'),
}) {
  // normal class body definition here
  beforeModel(params:any) {
    console.log("Params to application/beforemodel ", params);

    const image = localStorage.getItem(USERSETUP_KEY_IMAGE) || null;
    const name = localStorage.getItem(USERSETUP_KEY_NAME);
    const handicap = localStorage.getItem(USERSETUP_KEY_HANDICAP);

    let imagePromise:Promise<string> = Promise.resolve('');
    if(image) {
      console.log("loaded image ", image?.substr(0, 100), " with length ", image.length, " from localstorage");
      // the image is always going to be the super-high-res image that they initially loaded.  We want to resize that down
      imagePromise = storeFromVirginImage(image, false, null);
      
    }
    

    return imagePromise.then((imageBase64) => {
      console.log("resized image to " + imageBase64.length + " bytes");
      if(name && handicap) {
        // this is enough to set up a user
        this.devices.addUser({
          name:name,
          handicap:parseInt(handicap),
          imageBase64:imageBase64,
          bigImageMd5: md5(image),
        })
      } else if(params.to.name === 'strava-auth') {
        // I'm going to allow this
      } else {
        // no name, no handicap?  user has to go sign up
        if(params.to.name === 'ride') {
          // this is allowed - the ride screen now has inline signup
        } else {
          console.log("transitioning to set-up-user");
          //return this.transitionTo('set-up-user');
        }
      }

    })
    
  }

  setupController(controller:any, model:any) {
    controller.set('model', model);
    controller.start();
  }
}
