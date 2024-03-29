import Route from '@ember/routing/route';

export default class Index extends Route.extend({
  // anything which *must* be merged to prototype here
  actions: {
    goto(where:string) {
      this.transitionTo(where);
    }
  }
}) {
  // normal class body definition here
}
