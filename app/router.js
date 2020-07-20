import EmberRouter from '@ember/routing/router';
import config from './config/environment';



let lastRoute = '';
const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
  connection: Ember.inject.service(),

  init() {
    this._super(...arguments);
    this.on('routeDidChange', (transition) => {
      console.log("transition = ", transition);

      if(transition.from) {
        switch(transition.from.name) {
          case 'ride':
          case 'battleship':
            console.log("they jumped away from the ride screen.  We probably need to disconnect");
            console.log("connections = ", this.get('connection'));
            this.get('connection').disconnect();
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
});

export default Router;
