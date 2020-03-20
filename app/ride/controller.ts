import Controller from '@ember/controller';
import { RideMap } from 'bt-web2/server-client-common/RideMap';
import { RideMapHandicap } from 'bt-web2/server-client-common/RideMapHandicap';
import { computed } from '@ember/object';
import { RaceState } from 'bt-web2/server-client-common/RaceState';
import Ember from 'ember';
import Devices from 'bt-web2/services/devices';
import { UserTypeFlags, UserDisplay } from 'bt-web2/server-client-common/User';
import Connection from 'bt-web2/services/connection';

export default class Ride extends Controller.extend({
  // anything which *must* be merged to prototype here
  devices:<Devices><unknown>Ember.inject.service(),
  connection:<Connection><unknown>Ember.inject.service(),
}) {
  // normal class body definition here
  lastLocalMeters: number = 0;
  myTimeout:any = 0;
  map:RideMap|null = null;
  raceState:RaceState|null = null;
  frame:number = 0;

  _setup(gameId):Promise<any> {

    const user = this.devices.getLocalUser();
    if(!user) {
      throw new Error("User isn't valid");
    }
    const targetHost = 'localhost';
    return this.connection.connect(targetHost, gameId, "TheJoneses", user).then(() => {
      this.myTimeout = setTimeout(() => this._tick(), 15);
    }, (failure:any) => {
      const yn = confirm(`Failed to connect to ${targetHost}.  Start setup again?`);
      if(yn) {
        return this.transitionToRoute('set-up-user');
      }
    })
  }

  _tick() {
    const tmNow = new Date().getTime();
    const users = this.devices.getUsers();
    if(users.length <= 0) {
      const yn = confirm("There aren't any users.  Start setup again?");
      if(yn) {
        return this.transitionToRoute('set-up-user');
      }
    }
    this.raceState?.tick(tmNow);
    


    this.myTimeout = setTimeout(() => this._tick(), 15);
    this.incrementProperty('frame');
  }

  @computed("frame")
  get localRiders():UserDisplay[] {
    return this.devices.getUsers().filter((user) => {
      return user.getUserType() & UserTypeFlags.Local;
    }).map((localUser) => {
      return localUser.getDisplay();
    })
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'ride': Ride;
  }
}
