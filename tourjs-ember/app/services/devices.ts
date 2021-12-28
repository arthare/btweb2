import Service from '@ember/service';
import { BluetoothKickrDevice, ConnectedDeviceInterface } from 'bt-web2/pojs/WebBluetoothDevice';
import { UserSetupParameters } from 'bt-web2/components/user-set-up-widget/component';
import { User, UserTypeFlags, DEFAULT_HANDICAP_POWER, DEFAULT_RIDER_MASS, UserInterface } from 'bt-web2/server-client-common/User';
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
  users:UserInterface[] = [];
  deviceDescription:string = "No Device Connected";
  workoutSaver:WorkoutFileSaver|null = null;
  _displayControlPoint:BluetoothRemoteGATTCharacteristic|null = null;
  _displayWriteQueue:Promise<any> = Promise.resolve();
  ridersVersion = 0;

  goodUpdates = 0;
  badUpdates = 0;

  ftmsLevel = 100;

  _powerCounters:Map<string,PowerTimer> = new Map<string,PowerTimer>();
  
  private _fnPowerFilter:(power:number)=>number = (num)=>{return num;};

  setDisplayDevice(controlPoint:BluetoothRemoteGATTCharacteristic) {
    this._displayControlPoint = controlPoint;
    this._internalTick(new Date().getTime());
  }
  setPowerFilter(fnPower:(power:number)=>number) {
    this._fnPowerFilter = fnPower;
  }
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
        // pacing challenge mode uses the power filter to make users coast to a stop once they've used their energy allotment
        power = this._fnPowerFilter(power);

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

  getLocalUser():UserInterface|null {
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

  getUsers(tmNow:number):UserInterface[] {
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
  getUser(id:number):UserInterface|null {
    return this.users.find((user) => user.getId() === id) || null;
  }

  _tmLastDisplayUpdate = 0;
  _displayUpdates = 0;
  _updateDisplay() {
    if(this._displayControlPoint) {
      const tmNow = new Date().getTime();
      if(tmNow - this._tmLastDisplayUpdate > 1000) {
        const cp = this._displayControlPoint;
        const local = this.getLocalUser();
        if(local) {
          this._displayWriteQueue = this._displayWriteQueue.then(async () => {
            this._displayUpdates++;

            { // #1: current power
              const charOut = new DataView(new ArrayBuffer(20));
              const pwr = local.getLastPower();
  
              charOut.setUint8(0, 0x11); // SetUISlot
              charOut.setUint8(1, 0x0); // slot zero, no flags
              charOut.setUint8(2, 0); // UISLOT_DISPLAY::POWER
              charOut.setUint8(3, 0); // params[0] = 0
              charOut.setUint8(4, 0); // params[1] = 0
              charOut.setFloat32(5, pwr, true); // their power!
              await cp.writeValue(charOut);
            }
            { // #2: current distance
              const charOut = new DataView(new ArrayBuffer(20));
              const dist = local.getDistance();
  
              charOut.setUint8(0, 0x11); // SetUISlot
              charOut.setUint8(1, 0x1); // slot one, no flags
              charOut.setUint8(2, 5); // UISLOT_DISPLAY::DISTANCE
              charOut.setUint8(3, 0); // params[0] = 0
              charOut.setUint8(4, 0); // params[1] = 0
              charOut.setFloat32(5, dist, true); // their distance!
              await cp.writeValue(charOut);
            }
            { // #3: current speed
              const charOut = new DataView(new ArrayBuffer(20));
              const speed = local.getSpeed();
  
              charOut.setUint8(0, 0x11); // SetUISlot
              charOut.setUint8(1, 0x2); // slot two, no flags
              charOut.setUint8(2, 6); // UISLOT_DISPLAY::SPEED
              charOut.setUint8(3, 0); // params[0] = 0
              charOut.setUint8(4, 0); // params[1] = 0
              charOut.setFloat32(5, speed, true); // their speed!
              await cp.writeValue(charOut);
            }
            { // #4: current slope [text]
              const charOut = new DataView(new ArrayBuffer(20));
              const slope:number = local.getLastSlopeInWholePercent();
              charOut.setUint8(0, 0x11); // SetUISlot

              const flags = (this._displayUpdates % 10 === 0) ? 1 : 0;
              const slot = 3;
              const slotFlags = slot | (flags << 4);

              let slopeText;
              if(flags) {
                slopeText = `Slope`;
              } else {
                slopeText = `${slope.toFixed(1)}%`;
              }
              charOut.setUint8(1, slotFlags); // slot three, no flags
              charOut.setUint8(2, 4); // UISLOT_DISPLAY::TEXT
              charOut.setUint8(3, 0); // params[0] = 0
              charOut.setUint8(4, 0); // params[1] = 0
              for(var x = 0;x < slopeText.length; x++) {
                charOut.setUint8(5 + x, slopeText.charCodeAt(x)); // their speed!
              }
              charOut.setUint8(5 + slopeText.length, 0); // c-style string ender
              await cp.writeValue(charOut);
            }
  
          }).catch(() => {
            // whatevs
            console.log("display send failed.  that's fine");
          })
        }
        this._tmLastDisplayUpdate = tmNow;
      }
    }
  }

  tmLastInternalTick = 0;
  nextTickHandle:any = 0;
  _internalTick(tmNow:number) {
    if(this._displayControlPoint) {
      this._updateDisplay();
    }
    this.tmLastInternalTick = tmNow;

    if(!this.nextTickHandle) {
      this.nextTickHandle = setTimeout(() => {
        this.nextTickHandle = 0;
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
