import Route from '@ember/routing/route';

export default class Application extends Route.extend({
  // anything which *must* be merged to prototype here
}) {
  // normal class body definition here
  beforeModel(params:any) {
    console.log(params);
    if(params.to.name === 'index') {
      return this.transitionTo('set-up-user');
    }
  }
}
