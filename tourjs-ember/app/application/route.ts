import Route from '@ember/routing/route';
import { USERSETUP_KEY_IMAGE, USERSETUP_KEY_NAME, USERSETUP_KEY_HANDICAP, storeFromVirginImage } from 'bt-web2/components/user-set-up-widget/component';
import Ember from 'ember';
import Devices from 'bt-web2/services/devices';
import md5 from 'ember-md5';
import Auth from 'bt-web2/services/auth';

export default class Application extends Route.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service('devices'),
  auth: <Auth><unknown>Ember.inject.service('auth'),
}) {
  // normal class body definition here
  async beforeModel(params:any) {
    const auth = await this.get('auth').auth;
    debugger;
  }

  setupController(controller:any, model:any) {
    controller.set('model', model);
    controller.start();
  }
}
