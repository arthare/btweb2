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

      if(transition.from && transition.from.name === 'ride') {
        console.log("they jumped away from the ride screen.  We probably need to disconnect");
        console.log("connections = ", this.get('connection'));
        this.get('connection').disconnect();
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
});

export default Router;
