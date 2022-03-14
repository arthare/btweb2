import { Auth0ContextInterface, useAuth0, User as Auth0User } from "@auth0/auth0-react";
import { Auth0Client } from "@auth0/auth0-spa-js";
import { NavigateFunction } from "react-router-dom";
import { apiGet, secureApiGet } from "./tourjs-client-shared/api-get";
import { ConnectedDeviceInterface } from "./tourjs-client-shared/WebBluetoothDevice";
import { S2CPositionUpdateUser } from "./tourjs-shared/communication";
import { WorkoutFileSaver } from "./tourjs-shared/FileSaving";
import { UserProvider } from "./tourjs-shared/RaceState";
import { TourJsAccount, TourJsAlias } from "./tourjs-shared/signin-types";
import { DEFAULT_HANDICAP_POWER, DEFAULT_RIDER_MASS, User, UserInterface, UserTypeFlags } from "./tourjs-shared/User";


export interface UserSetupParameters {
  name:string;
  handicap:number;
  imageBase64:string|null;
  bigImageMd5:string|null;
}


export class AppPlayerContextType implements UserProvider {
  devices:ConnectedDeviceInterface[] = [];
  users:UserInterface[] = [];
  workoutSaver:WorkoutFileSaver = null;

  constructor() {

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
    return this.users.find((user) => user.getUserType() & UserTypeFlags.Local);
  }

  addRemoteUser(pos:S2CPositionUpdateUser, image:string|null) {
    const tmNow = new Date().getTime();
    const newUser = new User("Unknown User " + pos.id, DEFAULT_RIDER_MASS, DEFAULT_HANDICAP_POWER, UserTypeFlags.Remote);
    if(image) {
      newUser.setImage(image, null);
    }
    newUser.setId(pos.id);
    newUser.absorbPositionUpdate(tmNow, pos);
    this.users.push(newUser);
  }
  addUser(user:UserSetupParameters) {
    console.log("images adding user with image length ", user.imageBase64 && user.imageBase64.length);
    const newUser = new User(user.name, DEFAULT_RIDER_MASS, user.handicap, UserTypeFlags.Local);

    const alreadyHaveLocal = this.localUser;
    if(alreadyHaveLocal) {
      // get rid of the "local" user that we already have
      console.log("we already have a local user ", alreadyHaveLocal);
      this.users = this.users.filter((user) => user.getId() !== alreadyHaveLocal.getId());
    }

    this.workoutSaver = new WorkoutFileSaver(newUser, new Date().getTime());
    if(user.imageBase64) {
      newUser.setImage(user.imageBase64, user.bigImageMd5);
    }
    this.users.push(newUser);
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