import Route from '@ember/routing/route';
import Ember from 'ember';
import Devices from 'bt-web2/services/devices';

export default class UserSetUp extends Route.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service(),
}) {
  // normal class body definition here
  beforeModel() {
    return this.devices.clearUsers();
  }
}
