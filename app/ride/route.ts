import Route from '@ember/routing/route';

export default class Ride extends Route.extend({
  // anything which *must* be merged to prototype here
}) {
  // normal class body definition here

  setupController(controller:any, model:any) {
    controller._setup(model.gameId);
  }
}
