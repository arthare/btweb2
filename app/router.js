import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('set-up-user');
  this.route('set-up-ride');
  this.route('ride', {path:'/ride/:gameId'});
  this.route('set-up-join');
});

export default Router;
