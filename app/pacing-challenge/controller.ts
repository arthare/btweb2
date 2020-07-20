import Controller from '@ember/controller';

export default class PacingChallenge extends Controller.extend({
  // anything which *must* be merged to prototype here
  actions: {
    start(pct:number) {
      this.transitionToRoute('pacing-challenge-race', {pct});
    }
  }
}) {
  // normal class body definition here
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'pacing-challenge': PacingChallenge;
  }
}
