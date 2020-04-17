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
import ENV from 'bt-web2/config/environment';
import { UserSetupParameters } from 'bt-web2/components/user-set-up-widget/component';

var noSleep:any;

export default class Ride extends Controller.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service(),
  connection: <Connection><unknown>Ember.inject.service(),
  _raceState: <RaceState | null>null,
  _gameId: '',
  _setup: (gameId:string)=>{},

  actions: {
    newRide() {
      this.connection.disconnect();
      const raceState: RaceState | null = this.get('_raceState');

      if (raceState) {
        raceState.stop();
      }
      this.devices.getLocalUser()?.setId(-1);
      this.transitionToRoute('set-up-ride');
    },
    doneAddingUser(user:UserSetupParameters) {
      console.log("done adding user", arguments);
      this.devices.addUser(user);
      this._setup(this.get('_gameId'));
    }
  }
}) {
  // normal class body definition here
  lastLocalMeters: number = 0;
  myTimeout: any = 0;
  frame: number = 0;
  _raceState: RaceState | null = null;
  _userSignedIn: false = false;

  _setup(gameId: string): Promise<any> {

    this.set('_gameId', gameId);

    const user = this.devices.getLocalUser();
    if (!user) {
      // nuthin to do yet
      this.set('_userSignedIn', false);
      return;
    }
    this.set('_userSignedIn', true);

    const targetHost = ENV.gameServerHost;
    return this.connection.connect(targetHost, gameId, "TheJoneses", user).then((raceState: RaceState) => {
      this.set('_raceState', raceState);
      this.myTimeout = setTimeout(() => this._tick(), 15);
      noSleep = new NoSleep();
      return this._raceState;
    }, (failure: any) => {
      const yn = confirm(`Failed to connect to ${targetHost}.  Start setup again?`);
      if (yn) {
        return this.transitionToRoute('set-up-user');
      }
    })
  }

  _tick() {
    if (this.isDestroyed || this.isDestroying) {
      return;
    }
    const tmNow = new Date().getTime();
    const users = this.devices.getUsers(tmNow);
    if (users.length <= 0) {
      const yn = confirm("There aren't any users.  Start setup again?");
      if (yn) {
        return this.transitionToRoute('set-up-user');
      }
    }

    const raceState = this._raceState;
    if (!raceState) {
      throw new Error("Failed to find race state");
    }

    raceState.tick(tmNow);

    {
      const user = raceState.getLocalUser();
      if (user) {
        window.pending.lastPhysics = user.getDistance();
        window.tick(tmNow);
      }
    }
    this.devices.tick(tmNow);



    this.myTimeout = setTimeout(() => this._tick(), 15);
    this.incrementProperty('frame');
  }

  @computed("devices.ridersVersion", "connection.updateVersion")
  get localRidersPreRace(): UserDisplay[] {
    if (!this._raceState) {
      return [];
    }
    const tmNow = new Date().getTime();

    return this.devices.getUsers(tmNow).filter((user) => {
      return user.getUserType() & UserTypeFlags.Local;
    }).map((localUser) => {
      return localUser.getDisplay(this._raceState);
    })
  }
  @computed("devices.ridersVersion", "connection.updateVersion")
  get nonLocalHumans(): UserDisplay[] {
    if (!this._raceState) {
      return [];
    }
    const tmNow = new Date().getTime();

    return this.devices.getUsers(tmNow).filter((user) => {
      return !(user.getUserType() & UserTypeFlags.Local) && !(user.getUserType() & UserTypeFlags.Ai);
    }).map((localUser) => {
      return localUser.getDisplay(this._raceState);
    })
  }
  @computed("devices.ridersVersion", "connection.updateVersion")
  get ais(): UserDisplay[] {
    if (!this._raceState) {
      return [];
    }
    const tmNow = new Date().getTime();

    return this.devices.getUsers(tmNow).filter((user) => {
      return !(user.getUserType() & UserTypeFlags.Local) && (user.getUserType() & UserTypeFlags.Ai);
    }).map((localUser) => {
      return localUser.getDisplay(this._raceState);
    })
  }
  @computed("frame")
  get remoteRiders(): UserDisplay[] {
    if (!this._raceState) {
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
