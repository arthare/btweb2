import Route from '@ember/routing/route';

export default class HrmControl extends Route.extend({
  // anything which *must* be merged to prototype here
}) {
  // normal class body definition here

  setupController(controller:any, model:any) {
    controller.set('model', model);
    controller.startup();
  }
}
