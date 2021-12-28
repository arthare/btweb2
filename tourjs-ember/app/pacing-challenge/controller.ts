import Controller from '@ember/controller';
import { getPacingChallengeMap } from 'bt-web2/pacing-challenge-race/controller';
import Devices from 'bt-web2/services/devices';
import { apiGet } from 'bt-web2/set-up-ride/route';
import Ember from 'ember';

export default class PacingChallenge extends Controller.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service(),

  pickedMapName: <'hills1'|'hills2'|'flat'|'long'>'hills1',
  pickedMap: Ember.computed('pickedMapName', function() {
    return getPacingChallengeMap(this.get('pickedMapName'));
  }),
  pickedHills1: Ember.computed.equal('pickedMapName', 'hills1'),
  pickedHills2: Ember.computed.equal('pickedMapName', 'hills2'),
  pickedFlat: Ember.computed.equal('pickedMapName', 'flat'),
  pickedLong: Ember.computed.equal('pickedMapName', 'long'),

  

  actions: {
    start(pct:number) {
      const map = this.get('pickedMapName');
      this.transitionToRoute('pacing-challenge-race', {pct, map});
    },
    pickMap(map:string) {
      this.set('pickedMapName', map);
      window.localStorage.setItem('pacing-challenge-map-name', map);

      // gotta requery for records
      const dev = this.get('devices');
      const user = dev.getLocalUser();
      const name = user && user.getName();
      return apiGet('pacing-challenge-records', {name, map}).then((currentRecords) => {
        this.set('model', currentRecords);
      })

    }
  }
}) {
  // normal class body definition here
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'pacing-challenge': PacingChallenge;
  }
}
