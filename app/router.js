import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import {BluetoothKickrDevice} from 'bt-web2/pojs/WebBluetoothDevice';



let lastRoute = '';
const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
  connection: Ember.inject.service(),
  devices: Ember.inject.service(),

  init() {
    this._super(...arguments);
    this.on('routeDidChange', (transition) => {
      console.log("transition = ", transition);

      if(transition.from) {
        switch(transition.from.name) {
          case 'pacing-challenge-race':
            this.get('devices').dumpPwx('pacing-challenge-abandoned');
            break;
          case 'ride':
          case 'battleship':
            console.log("they jumped away from the ride screen.  We probably need to disconnect");
            console.log("connections = ", this.get('connection'));
            this.get('connection').disconnect(`Quit-${transition.from.name}`);
            break;
          case 'kickr-setup':
            // in kickr-setup, they're likely to have screwed around with the kickr's slope source and settings
            console.log("they've exited kickr-setup");
            const kickr = BluetoothKickrDevice.getKickrDevice();
            if(kickr) {
              this.get('devices').setLocalUserDevice(kickr, 0x7);
              console.log("reset their use of the kickr");
            }
            break;
        }
        
      }
    })
  }
});

Router.map(function() {
  this.route('set-up-user');
  this.route('set-up-ride');
  this.route('ride', {path:'/ride/:gameId'});
  this.route('set-up-join');
  this.route('test-hacks');
  this.route('strava-auth');
  this.route('battleship');
  this.route('hrm-control');
  this.route('pacing-challenge');
  this.route('pacing-challenge-race', {path:'/pacing-challenge-race/:pct'});
  this.route('results');
  this.route('kickr-setup');
});

export default Router;
