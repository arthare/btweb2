import Route from '@ember/routing/route';
import { RaceState } from 'bt-web2/server-client-common/RaceState';
import { RideMap, MapBounds, RideMapPartial } from 'bt-web2/server-client-common/RideMap';
import { User } from 'bt-web2/server-client-common/User';
import Devices from 'bt-web2/services/devices';
import Ember from 'ember';



export default class PacingChallengeRace extends Route.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service(),
}) {
  // normal class body definition here

  beforeModel() {
    if(!this.devices.getLocalUser()) {
      alert("You can't do a pacing challenge without having set yourself up first!");
      this.transitionTo('pacing-challenge');
    }
  }

  setupController(controller:any, model:any) {
    controller._setup(model);
  }
}
