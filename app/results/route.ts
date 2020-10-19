import Route from '@ember/routing/route';

export default class Results extends Route.extend({
  // anything which *must* be merged to prototype here
}) {
  // normal class body definition here
  setupController(controller:any, model:any) {
    controller.set('model', model);
  }
}
