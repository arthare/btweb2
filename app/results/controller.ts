import Controller from '@ember/controller';

export default class Results extends Controller.extend({
  // anything which *must* be merged to prototype here
  queryParams: ['md5'],
  md5: '',
}) {
  // normal class body definition here
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'results': Results;
  }
}
