import Service from '@ember/service';
import { BluetoothKickrDevice, ConnectedDeviceInterface } from 'bt-web2/pojs/WebBluetoothDevice';
import { UserSetupParameters } from 'bt-web2/components/user-set-up-widget/component';
import { User, UserTypeFlags, DEFAULT_HANDICAP_POWER, DEFAULT_RIDER_MASS } from 'bt-web2/server-client-common/User';
import { UserProvider, RaceState } from 'bt-web2/server-client-common/RaceState';
import { RaceResultSubmission, S2CPositionUpdate, S2CPositionUpdateUser } from 'bt-web2/server-client-common/communication';
import Ember from 'ember';
import { WorkoutFileSaver, samplesToPWX } from 'bt-web2/server-client-common/FileSaving';
import { assert2 } from 'bt-web2/server-client-common/Utils';
import { apiPost } from 'bt-web2/set-up-ride/route';


export interface PowerTimerAverage {
  powerAvg:number,
  totalTimeSeconds:number,
  joules:number,
}

export class PowerTimer {
  tmStart:number;
  tmLast:number;
  sumPower:number;
  countPower:number;

  constructor(tmStart:number) {
    this.tmStart = tmStart;
    this.tmLast = tmStart;
    this.sumPower = 0;
    this.countPower = 0;
  }

  notifyPower(tmNow:number, power:number) {
    const dt = Math.min(2, (tmNow - this.tmLast) / 1000);
    if(dt <= 0) {
      return;
    }
    this.sumPower += power * dt;
    this.countPower += dt;
    this.tmLast = tmNow;
  }

  getAverage(tmNow:number):PowerTimerAverage {

    const elapsedSeconds = this.countPower > 0 ? this.countPower : (tmNow - this.tmStart) / 1000;
    return {
      powerAvg: this.countPower > 0 ? this.sumPower / elapsedSeconds : 0,
      joules: this.sumPower,
      totalTimeSeconds: elapsedSeconds,
    }
  }
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

export enum DeviceFlags {
  PowerOnly = 0x1,
  Trainer =   0x2,
  Cadence =   0x4,
  Hrm =       0x8,

  AllButHrm = 0x7,
  All =       0xf,
}

export default class Devices extends Service.extend({
  // anything which *must* be merged to prototype here
}) implements UserProvider {
  // normal class body definition here
  devices:ConnectedDeviceInterface[] = [];
  users:User[] = [];
  deviceDescription:string = "No Device Connected";
  workoutSaver:WorkoutFileSaver|null = null;
  ridersVersion = 0;

  goodUpdates = 0;
  badUpdates = 0;

  ftmsLevel = 100;

  _powerCounters:Map<string,PowerTimer> = new Map<string,PowerTimer>();
  
  addDevice(device:ConnectedDeviceInterface) {
    this.set('deviceDescription', `A ${device.getDeviceTypeDescription()} named ${device.name()}`);
    this.devices.push(device);
    console.log("added a device to device man: ", this.devices);
  }

  ftmsAdjust(amt:number) {
    this.incrementProperty('ftmsLevel', amt);
  }

  clearUsers() {
    this.devices.forEach((dev) => {
      dev.disconnect();
    });
    console.log("cleared out devices ", this.devices);
    this.devices = [];
    this.users = [];
    this.incrementProperty('ridersVersion');
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
    this.incrementProperty('ridersVersion');
  }
  addUser(user:UserSetupParameters) {
    console.log("images adding user with image length ", user.imageBase64 && user.imageBase64.length);
    const newUser = new User(user.name, DEFAULT_RIDER_MASS, user.handicap, UserTypeFlags.Local);

    const alreadyHaveLocal = this.getLocalUser();
    if(alreadyHaveLocal) {
      // get rid of the "local" user that we already have
      this.users = this.users.filter((user) => user.getId() !== alreadyHaveLocal.getId());
    }

    this.workoutSaver = new WorkoutFileSaver(newUser, new Date().getTime());
    if(user.imageBase64) {
      newUser.setImage(user.imageBase64, user.bigImageMd5);
    }
    this.users.push(newUser);
    this.incrementProperty('ridersVersion');
  }

  _updatePowerCounters(tmNow:number, power:number) {
    this._powerCounters.forEach((counter) => {
      counter.notifyPower(tmNow, power);
    })
  }

  getPowerCounterAverage(tmNow:number, name:string):PowerTimerAverage {
    const counter = this._powerCounters.get(name);
    if(counter) {
      return counter.getAverage(tmNow);
    } else {
      return {
        powerAvg: 0,
        joules: 0,
        totalTimeSeconds: 0,
      }
    }
  }

  startPowerTimer(name:string) {
    console.log("devices service: setting power timer " + name);
    this._powerCounters.set(name, new PowerTimer(new Date().getTime()));
  }
  stopPowerTimer(name:string) {
    this._powerCounters.delete(name);
  }

  setLocalUserDevice(device:ConnectedDeviceInterface, deviceFlags:number) {

    this.set('kickrConnected', !!BluetoothKickrDevice.getKickrDevice());

    const user = this.getLocalUser();
    if(!user) {
      throw new Error("You can't set a device for a local user that doesn't exist");
    }

    if(deviceFlags & DeviceFlags.Cadence) {
      device.setCadenceRecipient(user);
    }
    if(deviceFlags & DeviceFlags.Hrm) {
      device.setHrmRecipient(user);
    }
    if(deviceFlags & DeviceFlags.PowerOnly || deviceFlags & DeviceFlags.Trainer) {
      device.setPowerRecipient((tmNow:number, power:number) => {
        user.notifyPower(tmNow, power);
        this._updatePowerCounters(tmNow, power);
      });
    }
    if(deviceFlags && DeviceFlags.Hrm) {
      device.setHrmRecipient(user);
    }
    if(deviceFlags & DeviceFlags.Trainer) {
      device.setSlopeSource(user);
    }
    
    this._internalTick(new Date().getTime());

    // get rid of all the old devices
    this.devices = this.devices.filter((oldDevice) => {
      const oldDeviceRemainingDeviceFlags = oldDevice.getDeviceFlags() & (~deviceFlags);
      if(oldDevice.getDeviceId() !== device.getDeviceId()) {

        // ok, this is a physically separate device.  But is it providing a different purpose?
        if(oldDeviceRemainingDeviceFlags !== 0) {
          oldDevice.setDeviceFlags(oldDeviceRemainingDeviceFlags);
          return true;
        } else {
          console.log("disconnecting " + oldDevice.name() + " because new device is a physically separate device");
          oldDevice.disconnect();
          return false;
        }
      } else {
        // exact same device.  don't send a physical disconnect because that'll kill the new device too.  but we don't want this device around anymore either
        return false;
      }
    })

    device.setDeviceFlags(deviceFlags);
    this.devices.push(device);
    this.incrementProperty('ridersVersion');
  }

  getHrmDevice():ConnectedDeviceInterface|null {
    return this.devices.find((dev) => dev.getDeviceFlags() & DeviceFlags.Hrm) || null;
  }
  getPowerDevice():ConnectedDeviceInterface|null {
    return this.devices.find((dev) => dev.getDeviceFlags() & (DeviceFlags.Trainer | DeviceFlags.PowerOnly)) || null;
  }

  getLocalUser():User|null {
    return this.users.find((user) => user.getUserType() & UserTypeFlags.Local) || null;
  }

  isLocalUserDeviceValid() {
    const tmNow = new Date().getTime();

    const user = this.getLocalUser();
    if(user) {
      if(user.isPowerValid(tmNow)) {
        return true;
      }
    }
    return false;
  }

  dumpPwx(activityName:string, tmNow:number) {
    const user = this.getLocalUser();
    if(this.workoutSaver && user) {
      const samples = this.workoutSaver.getWorkout();
      
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
        deviceName: this.get('deviceDescription'),
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

  getUsers(tmNow:number):User[] {
    return this.users.filter((user) => {
      return user.getUserType() & UserTypeFlags.Local ||
             user.getUserType() & UserTypeFlags.Ai ||
             user.getMsSinceLastPacket(tmNow) < 5000 ||
             user.isFinished();
    });
  }

  setErgMode(watts:number) {
    this.devices = this.devices.filter((device:ConnectedDeviceInterface) => {
      return device.userWantsToKeep();
    });
    const tmNow = new Date().getTime();
    this.devices.forEach((device) => {
      console.log("setting erg mode for ", device);
      device.updateErg(tmNow, watts).then((good:boolean) => {
        if(good) {
          this.incrementProperty('goodUpdates');
        } else {
          // benign "failure", such as the device doing rate-limiting or just doesn't support slope changes
        }
      }, (failure) => {
        this.incrementProperty('badUpdates');
      });
    })
  }
  setResistanceMode(pct:number) {
    assert2(pct >= 0 && pct <= 1, "resistance fractions should be between 0 and 1");
    this.devices = this.devices.filter((device:ConnectedDeviceInterface) => {
      return device.userWantsToKeep();
    });

    const tmNow = new Date().getTime();
    this.devices.forEach((device) => {
      console.log("setting resistance mode for ", device);
      device.updateResistance(tmNow, pct).then((good:boolean) => {
        if(good) {
          this.incrementProperty('goodUpdates');
        } else {
          // benign "failure", such as the device doing rate-limiting or just doesn't support slope changes
        }
      }, (failure) => {
        this.incrementProperty('badUpdates');
      });
    })
  }

  updateSlopes(tmNow:number) {
    this.devices = this.devices.filter((device:ConnectedDeviceInterface) => {
      return device.userWantsToKeep();
    });

    this.devices.forEach((device) => {
      device.updateSlope(tmNow, this.ftmsLevel / 100).then((good:boolean) => {
        if(good) {
          this.incrementProperty('goodUpdates');
        } else {
          // benign "failure", such as the device doing rate-limiting or just doesn't support slope changes
        }
        
      }, (failure) => {
        this.incrementProperty('badUpdates');
      });
    })
  }
  getUser(id:number):User|null {
    return this.users.find((user) => user.getId() === id) || null;
  }

  tmLastInternalTick = 0;
  nextTickHandle = 0;
  _internalTick(tmNow:number) {
    
    this.nextTickHandle = 0;
    
    this.tmLastInternalTick = tmNow;

    if(!this.nextTickHandle) {
      setTimeout(() => {
        this._internalTick(new Date().getTime());
      }, 100);
    }
  }
  tick(tmNow:number, needSlopes:boolean) {

    if(needSlopes) {
      this.updateSlopes(tmNow);
    }


    if(this.workoutSaver) {
      this.workoutSaver.tick(tmNow);
    }
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'devices': Devices;
  }
}
