import Route from '@ember/routing/route';
import Devices from 'bt-web2/services/devices';
import { apiGet } from 'bt-web2/set-up-ride/route';
import Ember from 'ember';

export default class PacingChallenge extends Route.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service(),
}) {
  // normal class body definition here
  model() {
    const dev = this.get('devices');
    const user = dev.getLocalUser();
    const name = user && user.getName();
    return apiGet('pacing-challenge-records', {name}).then((currentRecords) => {
      return currentRecords;
    })
  }
}
