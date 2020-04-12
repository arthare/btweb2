import Controller from '@ember/controller';
import { refreshRaceList } from './route';

export default class SetUpRide extends Controller.extend({
  // anything which *must* be merged to prototype here
  settingUpRide: false,

  actions: {
    go() {
      this.transitionToRoute('ride');
    },
    joinRace(gameId:string) {
      this.transitionToRoute('ride', gameId);
    },
    toggleRideWidget() {
      this.toggleProperty('settingUpRide');
    },
    onRaceCreated(this:SetUpRide) {
      this._refreshAllRaces();
      alert("Your ride has been created!");
      this.set('settingUpRide', false);
    },
    refreshAllRaces(this:SetUpRide):void {
      this._refreshAllRaces();
    }
  },

  frame: 0,
}) {
  // normal class body definition here

  _refreshAllRaces():void {
    refreshRaceList().then((model) => {
      this.set('model', model);
    });
  }


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
