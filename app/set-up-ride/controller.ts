import Controller from '@ember/controller';

export default class SetUpRide extends Controller.extend({
  // anything which *must* be merged to prototype here
  actions: {
    go() {
      this.transitionToRoute('ride');
    },
    joinRace(gameId:string) {
      this.transitionToRoute('ride', gameId);
    }
  }
}) {
  // normal class body definition here
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'set-up-ride': SetUpRide;
  }
}
