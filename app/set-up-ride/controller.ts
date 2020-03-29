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
  },

  frame: 0,
}) {
  // normal class body definition here

  beginFrames() {
    
    const incrementFrame = () => {
      this.incrementProperty('frame');
      console.log("frame!");
      if(!this.isDestroyed) {
        setTimeout(incrementFrame, 15000);
      }
    }
    incrementFrame();
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'set-up-ride': SetUpRide;
  }
}
