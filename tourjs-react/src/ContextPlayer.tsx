import { Auth0ContextInterface, useAuth0, User as Auth0User } from "@auth0/auth0-react";
import { Auth0Client } from "@auth0/auth0-spa-js";
import { ifft } from "@tensorflow/tfjs-node";
import EventEmitter from "events";
import { NavigateFunction } from "react-router-dom";
import { apiGet, apiPost, secureApiGet } from "./tourjs-client-shared/api-get";
import { ConnectedDeviceInterface } from "./tourjs-client-shared/WebBluetoothDevice";
import { RaceResultSubmission, S2CPositionUpdateUser } from "./tourjs-shared/communication";
import { samplesToPWX, WorkoutFileSaver } from "./tourjs-shared/FileSaving";
import { RaceState, UserProvider } from "./tourjs-shared/RaceState";
import { TourJsAccount, TourJsAlias } from "./tourjs-shared/signin-types";
import { DEFAULT_HANDICAP_POWER, DEFAULT_RIDER_MASS, User, UserInterface, UserTypeFlags } from "./tourjs-shared/User";


export interface UserSetupParameters {
  name:string;
  handicap:number;
  imageBase64:string|null;
  bigImageMd5:string|null;
}

export function dumpRaceResultToPWX(submission:RaceResultSubmission) {
  
  const pwx = samplesToPWX("Workout", submission);

  const lengthMeters = submission.samples[submission.samples.length - 1].distance - submission.samples[0].distance;

  var data = new Blob([pwx], {type: 'application/octet-stream'});
  var url = window.URL.createObjectURL(data);
  const linky = document.createElement('a');
  linky.href = url;
  linky.download = `TourJS-${submission.activityName}-${lengthMeters.toFixed(0)}m-${new Date(submission.samples[0].tm).toDateString()}.pwx`;
  linky.target="_blank";
  document.body.appendChild(linky);
  linky.click();
  document.body.removeChild(linky);
}


export class AppPlayerContextType extends EventEmitter implements UserProvider {
  devices:ConnectedDeviceInterface[] = [];
  users:UserInterface[] = [];
  workoutSaver:WorkoutFileSaver = null;
  powerDevice:ConnectedDeviceInterface = null;
  hrmDevice:ConnectedDeviceInterface = null;
  _localUser:UserInterface|null = null;
  _hasSavedPwxForRide:Map<string,boolean> = new Map();
  doublePower:boolean = false;
  

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

  private _dumpPwx(activityName:string, tmNow:number, user:UserInterface, workoutSaver:WorkoutFileSaver) {
    debugger;
    if(workoutSaver && user) {
      const samples = workoutSaver.getWorkout();
      
      let ixLastNonzeroPower = samples.length - 1;
      while(ixLastNonzeroPower > 0 && samples[ixLastNonzeroPower].power <= 0) {
        ixLastNonzeroPower--;
      }

      const strStart = new Date(samples[0].tm).toLocaleString();
      const strEnd = new Date(samples[ixLastNonzeroPower].tm).toLocaleString();

      const lengthMeters = samples[samples.length - 1].distance - samples[0].distance;
      const userImage = user.getImage();

      const submission:RaceResultSubmission = {
        rideName: `${user.getName()} doing ${activityName} for ${lengthMeters.toFixed(0)}m from ${strStart} to ${strEnd}`,
        riderName: user.getName(),
        tmStart: samples[0].tm,
        tmEnd: samples[ixLastNonzeroPower].tm,
        activityName,
        handicap: user.getHandicap(),
        samples,
        deviceName: "tourjs-react",
        bigImageMd5: user.getBigImageMd5() || '',
      }

      dumpRaceResultToPWX(submission);

      // let's also send this to the main server.  This only happens if the user has an image.
      // the image acts as their authentication.
      if(userImage) {
        apiPost('submit-ride-result', submission);
      }
    }
  }
  set2XMode(enable:boolean) {
    this.doublePower = enable;
  }
  setPowerDevice(dev:ConnectedDeviceInterface) {
    
    console.log("setting power device.  New device is ", dev.getDeviceId(), " new one is ", this.powerDevice?.getDeviceId());
    if(this.powerDevice?.getDeviceId() !== dev.getDeviceId()) {
      this.disconnectPowerDevice(); // disconnect the old one
    } else {
      // erm, whatevs
    }
    this.powerDevice = dev;
    dev.setPowerRecipient((tmNow, watts) => {
      console.log("setpowerrecip", tmNow, watts, " from dev ", dev);
      if(this.doublePower) {
        watts*=2;
      }
      const activeRaceState = RaceState.getActiveRaceState();
      if(activeRaceState) {
        const gameId = activeRaceState.getGameId();
        
        if(!this._hasSavedPwxForRide.has(gameId)) {
          this._hasSavedPwxForRide.set(gameId, false);
        }

        const user = activeRaceState.getLocalUser();
        if(user) {
          if(!this.workoutSaver) {
            this.workoutSaver = new WorkoutFileSaver(user, tmNow);
          }
          this.workoutSaver.tick(tmNow);
        }

        if(user?.getDistance() >= activeRaceState.getMap()?.getLength()) {
          // this user has finished their race
          const hasSavedPwxForRide = this._hasSavedPwxForRide.get(gameId);
          if(!hasSavedPwxForRide) {
            console.log("this user has finished '" + gameId + "' and we haven't saved their PWX yet");

            this._dumpPwx("Ride", tmNow, user, this.workoutSaver);
            this._hasSavedPwxForRide.set(gameId, true);
          }
          
        }

      }
      if(this.localUser) {
        if(dev === this.powerDevice) {
          dev.setCadenceRecipient(this.localUser);
          // ok, we're sure this event is for the power device we're actively trying to use.  this.powerDevice could conceivably change and a poorly-behaved notifier could keep notifying
          this.emit('deviceDataChange');
          this.localUser.notifyPower(tmNow, watts);
        } else {
          dev.disconnect();
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
  async zeroOffset() {
    if(this.powerDevice) {
      const dev = this.powerDevice;
      await dev.zeroOffset();
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
    this.workoutSaver = new WorkoutFileSaver(user, new Date().getTime());
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