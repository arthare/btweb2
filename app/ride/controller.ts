import Controller from '@ember/controller';
import { RideMap } from 'bt-web2/server-client-common/RideMap';
import { RideMapHandicap } from 'bt-web2/server-client-common/RideMapHandicap';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
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
  frame:number = 0;
  _raceState:RaceState|null = null;

  _setup(gameId:string):Promise<any> {

    const user = this.devices.getLocalUser();
    if(!user) {
      throw new Error("User isn't valid");
    }
    const targetHost = 'localhost';
    return this.connection.connect(targetHost, gameId, "TheJoneses", user).then((raceState:RaceState) => {
      this._raceState = raceState;
      this.myTimeout = setTimeout(() => this._tick(), 15);
      return this._raceState;
    }, (failure:any) => {
      const yn = confirm(`Failed to connect to ${targetHost}.  Start setup again?`);
      if(yn) {
        return this.transitionToRoute('set-up-user');
      }
    })
  }

  _tick() {
    const tmNow = new Date().getTime();
    const users = this.devices.getUsers(tmNow);
    if(users.length <= 0) {
      const yn = confirm("There aren't any users.  Start setup again?");
      if(yn) {
        return this.transitionToRoute('set-up-user');
      }
    }

    const raceState = this._raceState;
    if(!raceState) {
      throw new Error("Failed to find race state");
    }
    raceState.tick(tmNow);

    this.devices.updateSlopes(tmNow);
    


    this.myTimeout = setTimeout(() => this._tick(), 15);
    this.incrementProperty('frame');
  }

  @computed("frame")
  get localRiders():UserDisplay[] {
    if(!this._raceState) {
      return [];
    }
    const tmNow = new Date().getTime();

    return this.devices.getUsers(tmNow).filter((user) => {
      return user.getUserType() & UserTypeFlags.Local;
    }).map((localUser) => {
      return localUser.getDisplay(this._raceState);
    })
  }
  @computed("frame")
  get remoteRiders():UserDisplay[] {
    if(!this._raceState) {
      return [];
    }
    const tmNow = new Date().getTime();

    return this.devices.getUsers(tmNow).filter((user) => {
      return user.getUserType() & UserTypeFlags.Remote;
    }).map((localUser) => {
      return localUser.getDisplay(this._raceState);
    })
  }
  
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'ride': Ride;
  }
}
