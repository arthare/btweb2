import { Auth0ContextInterface, useAuth0, User as Auth0User } from "@auth0/auth0-react";
import { Auth0Client } from "@auth0/auth0-spa-js";
import EventEmitter from "events";
import { NavigateFunction } from "react-router-dom";
import { apiGet, secureApiGet } from "./tourjs-client-shared/api-get";
import { ConnectedDeviceInterface } from "./tourjs-client-shared/WebBluetoothDevice";
import { S2CPositionUpdateUser } from "./tourjs-shared/communication";
import { WorkoutFileSaver } from "./tourjs-shared/FileSaving";
import { RaceState, UserProvider } from "./tourjs-shared/RaceState";
import { TourJsAccount, TourJsAlias } from "./tourjs-shared/signin-types";
import { DEFAULT_HANDICAP_POWER, DEFAULT_RIDER_MASS, User, UserInterface, UserTypeFlags } from "./tourjs-shared/User";


export interface UserSetupParameters {
  name:string;
  handicap:number;
  imageBase64:string|null;
  bigImageMd5:string|null;
}


export class AppPlayerContextType extends EventEmitter implements UserProvider {
  devices:ConnectedDeviceInterface[] = [];
  users:UserInterface[] = [];
  workoutSaver:WorkoutFileSaver = null;
  powerDevice:ConnectedDeviceInterface = null;
  hrmDevice:ConnectedDeviceInterface = null;
  _localUser:UserInterface|null = null;

  

  constructor() {
    super();
  }


  
  clearUsers() {
    this.devices.forEach((dev) => {
      dev.disconnect();
    });
    console.log("cleared out devices ", this.devices);
    this.devices = [];
    this.users = [];
  }

  get localUser() {
    return this._localUser;
  }

  setPowerDevice(dev:ConnectedDeviceInterface) {
    
    console.log("setting power device");
    this.disconnectPowerDevice(); // disconnect the old one
    this.powerDevice = dev;
    dev.setPowerRecipient((tmNow, watts) => {
      
      const activeRaceState = RaceState.getActiveRaceState();
      if(activeRaceState) {
        const user = activeRaceState.getLocalUser();
        if(user) {
          console.log("power received!");
          if(dev === this.powerDevice) {
            dev.setCadenceRecipient(user);
            // ok, we're sure this event is for the power device we're actively trying to use.  this.powerDevice could conceivably change and a poorly-behaved notifier could keep notifying
            this.emit('deviceDataChange');
            user.notifyPower(tmNow, watts);
          } else {
            dev.disconnect();
          }
        }
      }
    });
    this.emit('deviceChange');
    
  }
  setHrmDevice(dev:ConnectedDeviceInterface) {
    const user = this.localUser;
    if(user) {
      this.disconnectHrmDevice();
      dev.setHrmRecipient(user);
      this.hrmDevice = dev;
    }
  }
  disconnectPowerDevice() {
    if(this.powerDevice) {
      const dev = this.powerDevice;
      dev.disconnect();
      this.powerDevice = null;
      this.emit('deviceChange');
    }
  }
  disconnectHrmDevice() {
    if(this.hrmDevice) {
      const dev = this.hrmDevice;
      dev.disconnect();
      this.hrmDevice = null;
      this.emit('deviceChange');
    }
  }
  
  addRemoteUser(pos:S2CPositionUpdateUser, image:string|null) {
    const tmNow = new Date().getTime();
    const newUser = new User("Unknown User " + pos.id, DEFAULT_RIDER_MASS, DEFAULT_HANDICAP_POWER, UserTypeFlags.Remote);
    if(image) {
      newUser.setImage(image, null);
    }
    newUser.setId(pos.id);
    newUser.absorbPositionUpdate(tmNow, tmNow, pos);
    this.users.push(newUser);
  }
  addUser(user:UserSetupParameters) {
    console.log("images adding user with image length ", user.imageBase64 && user.imageBase64.length);
    const newUser = new User(user.name, DEFAULT_RIDER_MASS, user.handicap, UserTypeFlags.Local);

    const alreadyHaveLocal = this.localUser;
    if(alreadyHaveLocal) {
      // get rid of the "local" user that we already have
      console.log("we already have a local user ", alreadyHaveLocal);
    }

    this.workoutSaver = new WorkoutFileSaver(newUser, new Date().getTime());
    if(user.imageBase64) {
      newUser.setImage(user.imageBase64, user.bigImageMd5);
    }
    this.setLocalUser(newUser);
  }
  setLocalUser(user:UserInterface) {
    console.log("ContextPlayer now knows who your player is!", user);
    const alreadyHaveLocal = this.localUser;
    this.users = this.users.filter((user) => user.getId() !== alreadyHaveLocal?.getId());
    this.users.push(user);
    this._localUser = user;
  }
  getUsers(tmNow: number): UserInterface[] {
    return this.users;
  }
  getUser(id: number): UserInterface {
    return this.users.find((user) => user.getId() === id) || null;
  }
  getLocalUser(): UserInterface {
    return this.localUser;
  }
}