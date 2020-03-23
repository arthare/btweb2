import Component from '@ember/component';
import { computed } from '@ember/object';
import Ember from 'ember';
import Connection from 'bt-web2/services/connection';
export default class DisplayPreRace extends Component.extend({
  // anything which *must* be merged to prototype here
  connection: <Connection><unknown>Ember.inject.service(),
  frame: 0,
}) {
  // normal class body definition here

  @computed("connection.msOfStart", "frame")
  get startsInSeconds():string {
    const tmOfStart = this.get('connection').msOfStart;
    if(tmOfStart > 0) {
      const tmNow = new Date().getTime();
      const msAhead = Math.max(0, tmOfStart - tmNow);
      return (msAhead / 1000.0).toFixed(1);
    } else {
      return "Unknown";
    }
  }
};
