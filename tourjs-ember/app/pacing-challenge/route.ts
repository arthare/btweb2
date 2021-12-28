import Route from '@ember/routing/route';
import Devices from 'bt-web2/services/devices';
import { apiGet } from 'bt-web2/set-up-ride/route';
import Ember from 'ember';

export default class PacingChallenge extends Route.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service(),
  pickedMapName: 'hills1',
}) {
  // normal class body definition here
  model() {
    const dev = this.get('devices');
    const user = dev.getLocalUser();
    const name = user && user.getName();

    const oldMap = window.localStorage.getItem('pacing-challenge-map-name') || 'hills1';

    this.set('pickedMapName', oldMap);
    return apiGet('pacing-challenge-records', {name, map: this.get('pickedMapName')}).then((currentRecords:any) => {
      return currentRecords;
    })
  }

  setupController(controller:any, model:any) {
    console.log("setting up controller for pacing-challenge ", model);
    controller.set('model', model);
    controller.set('pickedMapName', this.get('pickedMapName'));
  }
}
