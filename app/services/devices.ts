import Service from '@ember/service';
import { ConnectedDeviceInterface } from 'bt-web2/pojs/WebBluetoothDevice';
import { UserSetupParameters } from 'bt-web2/components/user-set-up-widget/component';
import { User, UserTypeFlags } from 'bt-web2/server-client-common/User';
import { UserProvider } from 'bt-web2/server-client-common/RaceState';




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

  addUser(user:UserSetupParameters) {
    const newUser = new User(user.name, 80, user.handicap, UserTypeFlags.Local);
    this.users.push(newUser);
    const device = user.device;
    if(device.hasCadence()) {
      device.setCadenceRecipient(newUser);
    }
    if(device.hasPower()) {
      device.setPowerRecipient(newUser);
    }
    if(device.hasHrm()) {
      device.setHrmRecipient(newUser);
    }
  }
  getLocalUser():User|undefined {
    return this.users.find((user) => user.getUserType() & UserTypeFlags.Local);
  }

  getUsers():User[] {
    return this.users;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'devices': Devices;
  }
}
