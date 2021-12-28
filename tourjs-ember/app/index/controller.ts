import Controller from '@ember/controller';
import Ember from 'ember';

export default class Index extends Controller.extend({
  // anything which *must* be merged to prototype here
  devices: Ember.inject.service(),
}) {
  // normal class body definition here
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'index': Index;
  }
}
