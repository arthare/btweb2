import Controller from '@ember/controller';
import Ember from 'ember';
import Devices from 'bt-web2/services/devices';
import { getDeviceFactory } from 'bt-web2/pojs/DeviceFactory';
import { ConnectedDeviceInterface, PowerDataDistributor, BTDeviceState } from 'bt-web2/pojs/WebBluetoothDevice';
import { UserDisplay } from 'bt-web2/server-client-common/User';
import { computed } from '@ember/object';
import Connection from 'bt-web2/services/connection';


export class FakeDevice extends PowerDataDistributor {
  constructor() {
    super();
    setInterval(() => {
      console.log("fake device notifying power");
      this._notifyNewPower(new Date().getTime(), Math.random()*50 + 100);
    }, 500);
  }
  getDeviceTypeDescription():string {
    return "Fake Device";
  }
  updateSlope(tmNow: number): void {
    
  }
  disconnect(): Promise<void> {
    return Promise.resolve();
  }  
  getState(): BTDeviceState {
    return BTDeviceState.Ok;
  }
  name(): string {
    return "Fake Device";
  }

}


export default class Application extends Controller.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service('devices'),
  connection: <Connection><unknown>Ember.inject.service('connection'),
  bluetoothWarning: false,
  canDoBluetooth: false,
  frame: 0,
  
  observeGoodUpdates: Ember.observer('devices.goodUpdates', function(this:Application) {
    const deviceWrite = document.querySelector('.application__device-write');
    if(deviceWrite) {
      deviceWrite.classList.add('good');
      setTimeout(() => {
        deviceWrite.classList.remove('good');
      }, 250);
    }
  }),

  actions: {
    connectDevice() {
      const canDoBluetooth = this.get('canDoBluetooth');
      if(!canDoBluetooth || (window.location.search && window.location.search.includes("fake"))) {

        const device = new FakeDevice();
        this.devices.setLocalUserDevice(device);
      } else {
        getDeviceFactory().findPowermeter().then((device:ConnectedDeviceInterface) => {
          this.devices.setLocalUserDevice(device);
        });
      }
    },

    connectPlugin() {
      getDeviceFactory().findPowermeter(true).then((device:ConnectedDeviceInterface) => {
        this.devices.setLocalUserDevice(device);
      })
    }
  }
}) {
  // normal class body definition here

  _tick() {
    const hasLocalUser = !!this.devices.getLocalUser();
    const hasBluetoothDevice = this.devices.isLocalUserDeviceValid();
    if(hasLocalUser && !hasBluetoothDevice) {
      this.set('bluetoothWarning', true);
    } else {
      this.set('bluetoothWarning', false);
    }
    this.incrementProperty('frame');

    fetch('http://localhost:63939/device-list').then(() => {
      this.set('hasPlugins', true);
    }, (failure) => {
      this.set('hasPlugins', false);
    })


    setTimeout(() => this._tick(), 2000);
  }

  start() {
    if(!window.navigator || !window.navigator.bluetooth || !window.navigator.bluetooth.getAvailability) {
      this.set('canDoBluetooth', false);
    } else {
      navigator.bluetooth.getAvailability().then((available) => {
        console.log("Bluetooth is available? ", available);
        this.set('canDoBluetooth', available);
      })
    }
    this._tick();
  }

  @computed("frame")
  get localUser():UserDisplay|null {

    if(this.get('bluetoothWarning')) {
      // don't display the user if we have a bluetooth warning
      return null;
    }

    const user = this.devices.getLocalUser();
    try {
      const raceState = this.connection.getRaceState();
      if(raceState) {
        return null;
      }
    } catch(e) {
    }
    if(user) {
      return user.getDisplay(null);
    }
    return null;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'application': Application;
  }
}
