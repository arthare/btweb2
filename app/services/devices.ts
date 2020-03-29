import Service from '@ember/service';
import { ConnectedDeviceInterface } from 'bt-web2/pojs/WebBluetoothDevice';
import { UserSetupParameters } from 'bt-web2/components/user-set-up-widget/component';
import { User, UserTypeFlags } from 'bt-web2/server-client-common/User';
import { UserProvider, RaceState } from 'bt-web2/server-client-common/RaceState';
import { S2CPositionUpdate, S2CPositionUpdateUser } from 'bt-web2/server-client-common/communication';
import Ember from 'ember';




export default class Devices extends Service.extend({
  // anything which *must* be merged to prototype here
}) implements UserProvider {
  // normal class body definition here
  devices:ConnectedDeviceInterface[] = [];
  users:User[] = [];

  
  addDevice(device:ConnectedDeviceInterface) {
    this.devices.push(device);
  }

  clearUsers() {
    this.devices.forEach((dev) => {
      dev.disconnect();
    });
    this.devices = [];
    this.users = [];
  }

  addRemoteUser(pos:S2CPositionUpdateUser) {
    const tmNow = new Date().getTime();
    const newUser = new User("Unknown User " + pos.id, 80, 300, UserTypeFlags.Remote);
    newUser.setId(pos.id);
    newUser.absorbPositionUpdate(tmNow, pos);
    this.users.push(newUser);
  }
  addUser(user:UserSetupParameters) {
    const newUser = new User(user.name, 80, user.handicap, UserTypeFlags.Local);
    this.users.push(newUser);
    const device = user.device;
    device.setCadenceRecipient(newUser);
    device.setPowerRecipient(newUser);
    device.setHrmRecipient(newUser);
    device.setSlopeSource(newUser);
  }
  getLocalUser():User|undefined {
    return this.users.find((user) => user.getUserType() & UserTypeFlags.Local);
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
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'devices': Devices;
  }
}
