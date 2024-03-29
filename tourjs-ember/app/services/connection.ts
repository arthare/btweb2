import Service from '@ember/service';
import ConnectionManager, { S2CFinishUpdate, S2CPositionUpdateUser}  from 'bt-web2/tourjs-shared/communication';
import { RaceState } from 'bt-web2/tourjs-shared/RaceState';
import { User, UserInterface } from 'bt-web2/tourjs-shared/User';
import { RideMapHandicap } from 'bt-web2/tourjs-shared/RideMapHandicap';
import Ember from 'ember';
import Devices from './devices';
import { assert2 } from 'bt-web2/tourjs-shared/Utils';
import { computed } from '@ember/object';
import ENV from 'bt-web2/config/environment';
import { USERSETUP_KEY_HANDICAP } from 'bt-web2/components/user-set-up-widget/component';
import { TourJsSignin } from 'bt-web2/tourjs-client-shared/signin-client';

export default class Connection extends Service.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service(),
}) {

  _connectManager:ConnectionManager = new ConnectionManager((newFtp:number) => this._onHandicapChange(newFtp),
                                                            () => this._onLastServerRaceStateChange(),
                                                            () => this._onNetworkUpdateComplete(),
                                                            (client:S2CPositionUpdateUser, image:string|null) => this._notifyNewUserNoticed(client, image));
  _lastServerRaceState:number = 0;
  _updateVersion = 0;

  _onHandicapChange(newHandicap:number) {
    localStorage.setItem(USERSETUP_KEY_HANDICAP, newHandicap.toFixed(1));
  }
  _onLastServerRaceStateChange() {
    this.incrementProperty('_lastServerRaceState');
  }
  _onNetworkUpdateComplete() {
    this.incrementProperty('_updateVersion');
    this.set('msOfStart', this._connectManager.msOfStart);
  }
  _notifyNewUserNoticed(client:S2CPositionUpdateUser, image:string|null) {
    this.devices.addRemoteUser(client, image);
  }

  connect(targetHost:string, gameId:string, accountId:string, user:UserInterface, fnOnNewRaceState:(raceState:RaceState)=>void):Promise<RaceState> {
    let url = ENV.environment === 'production' ? `wss://${targetHost}:8080` : `ws://${targetHost}:8080`;

    return this._connectManager.connect(url, this.devices, gameId, accountId, user, fnOnNewRaceState);
  }

  disconnect(activityName:string) {

    const tmNow = new Date().getTime();

    if(activityName) {
      this.devices.dumpPwx(activityName, tmNow);
    }
    const user = this.devices.getLocalUser();
    if(user) {
      user.setId(-1);
    }

    this._connectManager.disconnect();
  }

  getUser(userId:number):UserInterface|null {
    const user = this.devices.getUser(userId);
    return user || null;
  }
  getUserName(userId:number):string {
    const user = this.devices.getUser(userId);
    return user && user.getName() || "Unknown";
  }

  chat(chat:string) {
    return this._connectManager.chat(chat);
  }

  @computed("_lastServerRaceState")
  get preRace():boolean {
    return this._connectManager.preRace;
  }
  @computed("_lastServerRaceState")
  get racing():boolean {
    return this._connectManager.racing;
  }
  @computed("_lastServerRaceState")
  get postRace():boolean {
    return this._connectManager.postRace;
  }
  @computed("_lastServerRaceState")
  get msOfStart():number {
    return this._connectManager.msOfStart;
  }
  @computed("_updateVersion")
  get raceResults():S2CFinishUpdate|null {
    return this._connectManager.raceResults;
  }

  getRaceState():RaceState {
    return this._connectManager.getRaceState();
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'connection': Connection;
  }
}
