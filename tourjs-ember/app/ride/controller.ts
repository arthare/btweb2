import Controller from '@ember/controller';
import { RideMap } from 'bt-web2/shared/RideMap';
import { RideMapHandicap } from 'bt-web2/shared/RideMapHandicap';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { RaceState } from 'bt-web2/shared/RaceState';
import Ember from 'ember';
import Devices from 'bt-web2/services/devices';
import { UserTypeFlags, UserDisplay } from 'bt-web2/shared/User';
import Connection from 'bt-web2/services/connection';
import ENV from 'bt-web2/config/environment';
import { map } from 'rsvp';
import { UserSetupParameters } from 'bt-web2/components/user-set-up-widget/component';
import { S2CFinishUpdate } from 'bt-web2/shared/communication';

export default class Ride extends Controller.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service(),
  connection: <Connection><unknown>Ember.inject.service(),
  _raceState: <RaceState | null>null,
  hasSentPwx: false,
  _gameId: '',

  actions: {
    doneAddingUser(user:UserSetupParameters) {
      console.log("done adding user", user, " with md5 ", user.bigImageMd5);
      this.devices.addUser(user);
      (<any>this)._setup(this.get('_gameId'));
    }
  },

  watchForRaceCompletion: Ember.observer('connection.postRace', function(this:Ride) {
  })
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
      return Promise.resolve();
    }
    this.set('_userSignedIn', true);

    const targetHost = ENV.gameServerHost;
    
    const fnOnNewRaceState = (raceState: RaceState) => {
      console.log("connected, new race state! ", raceState);
      this.set('_raceState', raceState);
      this.myTimeout = setTimeout(() => this._tick(), 15);
      this.set('hasSentPwx', false);
      return this._raceState;
    }

    return this.connection.connect(targetHost, gameId, "TheJoneses", user, fnOnNewRaceState).then(fnOnNewRaceState, (failure: any) => {
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

    const raceState = this.get('_raceState');
    if (!raceState) {
      throw new Error("Failed to find race state");
    }
    if(raceState.isOldNews()) {
      return;
    }

    raceState.tick(tmNow);

    {
      const user = raceState.getLocalUser();
      if (user) {
        if(user.getDistance() >= raceState.getMap().getLength() && !this.get('hasSentPwx')) {
          this.devices.dumpPwx("Online-Race", tmNow);
          this.set('hasSentPwx', true);
        }
      }
    }
    this.devices.tick(tmNow, true);


    const conn = this.get('connection');
    if(conn.postRace && conn.raceResults) {
      // we're post race!  let's just transition to the post-race route
      conn.disconnect('');
      const rr = conn.raceResults;
      setTimeout(() => {
        window.location.href = `/race-results/${S2CFinishUpdate.getPermanentKey(rr)}`;
      }, 1000);
      
    } else {
      this.myTimeout = setTimeout(() => this._tick(), 15);
      this.incrementProperty('frame');
    }


  }

  @computed("devices.ridersVersion", "connection._updateVersion")
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
  @computed("devices.ridersVersion", "connection._updateVersion")
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
  @computed("devices.ridersVersion", "connection._updateVersion")
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
