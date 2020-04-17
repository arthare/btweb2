import Route from '@ember/routing/route';
import { USERSETUP_KEY_IMAGE, USERSETUP_KEY_NAME, USERSETUP_KEY_HANDICAP } from 'bt-web2/components/user-set-up-widget/component';
import Ember from 'ember';
import Devices from 'bt-web2/services/devices';

var noSleep:any = new NoSleep();

export default class Application extends Route.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service('devices'),
}) {
  // normal class body definition here
  beforeModel(params:any) {
    document.addEventListener('click', function enableNoSleep() {
      document.removeEventListener('click', enableNoSleep, false);
      noSleep.enable();
      console.log("nosleeped");
    }, false);

    console.log(params);

    const image = localStorage.getItem(USERSETUP_KEY_IMAGE) || null;
    const name = localStorage.getItem(USERSETUP_KEY_NAME);
    const handicap = localStorage.getItem(USERSETUP_KEY_HANDICAP);

    if(name && handicap) {
      // this is enough to set up a user
      this.devices.addUser({
        name:name,
        handicap:parseInt(handicap),
        imageBase64:image,
      })

      if(params && params.to) {
        if(params.to.name === 'index') {
          // we've got a name, but they can't really go to the index route
          return this.transitionTo('set-up-ride');
        }
      }

    } else if(params.to.name === 'strava-auth') {
      // I'm going to allow this
    } else {
      // no name, no handicap?  user has to go sign up
      return this.transitionTo('set-up-user');
    }
  }

  setupController(controller:any, model:any) {
    controller.set('model', model);
    controller.start();
  }
}
