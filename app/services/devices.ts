import Service from '@ember/service';
import { ConnectedDeviceInterface } from 'bt-web2/pojs/WebBluetoothDevice';
import { UserSetupParameters } from 'bt-web2/components/user-set-up-widget/component';
import { User, UserTypeFlags } from 'bt-web2/server-client-common/User';
import { UserProvider, RaceState } from 'bt-web2/server-client-common/RaceState';
import { S2CPositionUpdate, S2CPositionUpdateUser } from 'bt-web2/server-client-common/communication';
import Ember from 'ember';
import { WorkoutFileSaver, samplesToPWX } from 'bt-web2/server-client-common/FileSaving';




export default class Devices extends Service.extend({
  // anything which *must* be merged to prototype here
}) implements UserProvider {
  // normal class body definition here
  devices:ConnectedDeviceInterface[] = [];
  users:User[] = [];
  deviceDescription:string = "No Device Connected";
  workoutSaver:WorkoutFileSaver|null = null;
  ridersVersion = 0;
  
  addDevice(device:ConnectedDeviceInterface) {
    this.set('deviceDescription', `A ${device.getDeviceTypeDescription()} named ${device.name()}`);
    this.devices.push(device);
    console.log("added a device to device man: ", this.devices);
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
    const newUser = new User("Unknown User " + pos.id, 80, 300, UserTypeFlags.Remote);
    if(image) {
      newUser.setImage(image);
    }
    newUser.setId(pos.id);
    newUser.absorbPositionUpdate(tmNow, pos);
    this.users.push(newUser);
    this.incrementProperty('ridersVersion');
  }
  addUser(user:UserSetupParameters) {
    const newUser = new User(user.name, 80, user.handicap, UserTypeFlags.Local);

    const alreadyHaveLocal = this.getLocalUser();
    if(alreadyHaveLocal) {
      // get rid of the "local" user that we already have
      this.users = this.users.filter((user) => user.getId() !== alreadyHaveLocal.getId());
    }

    this.workoutSaver = new WorkoutFileSaver(newUser, new Date().getTime());
    if(user.imageBase64) {
      newUser.setImage(user.imageBase64);
    }
    this.users.push(newUser);
    this.incrementProperty('ridersVersion');
  }

  setLocalUserDevice(device:ConnectedDeviceInterface) {
    const user = this.getLocalUser();
    if(!user) {
      throw new Error("You can't set a device for a local user that doesn't exist");
    }
    device.setCadenceRecipient(user);
    device.setPowerRecipient(user);
    device.setHrmRecipient(user);
    device.setSlopeSource(user);
    this.devices.push(device);
  }

  getLocalUser():User|undefined {
    return this.users.find((user) => user.getUserType() & UserTypeFlags.Local);
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

  dumpPwx(tmNow:number) {
    const user = this.getLocalUser();
    if(this.workoutSaver && user) {
      const samples = this.workoutSaver.getWorkout();
      
      const pwx = samplesToPWX("Workout", user, this.get('deviceDescription'), samples);

      const lengthMeters = samples[samples.length - 1].distance - samples[0].distance;

      var data = new Blob([pwx], {type: 'application/octet-stream'});
      var url = window.URL.createObjectURL(data);
      const linky = document.createElement('a');
      linky.href = url;
      linky.download = `TourJS-Workout-${lengthMeters.toFixed(0)}m-${new Date(tmNow).toDateString()}.pwx`;
      linky.target="_blank";
      document.body.appendChild(linky);
      linky.click();
      document.body.removeChild(linky);
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
  updateSlopes(tmNow:number) {
    this.devices.forEach((device) => {
      device.updateSlope(tmNow);
    })
  }
  getUser(id:number):User|null {
    return this.users.find((user) => user.getId() === id) || null;
  }
  tick(tmNow:number) {
    this.updateSlopes(tmNow);
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
