import Route from '@ember/routing/route';

export default class KickrSetup extends Route.extend({
  // anything which *must* be merged to prototype here
}) {
  // normal class body definition here
  setupController(controller:any) {
    controller._setup();
  }
}
