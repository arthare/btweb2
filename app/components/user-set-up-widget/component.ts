import Component from '@ember/component';
import { getDeviceFactory } from 'bt-web2/pojs/DeviceFactory';
import { ConnectedDeviceInterface, BTDeviceState, PowerDataDistributor } from 'bt-web2/pojs/WebBluetoothDevice';
import Ember from 'ember';
import { computed } from '@ember/object';
import Devices from 'bt-web2/services/devices';

export interface UserSetupParameters {
  name:string;
  handicap:number;
  device:ConnectedDeviceInterface;
}

class FakeDevice extends PowerDataDistributor {
  constructor() {
    super();
    setInterval(() => {
      this._notifyNewPower(new Date().getTime(), Math.random()*50 + 200);
    }, 500);
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

export default class UserSetUp extends Component.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service('devices'),

  userName:'Art',
  userHandicap:'300',
  device:<ConnectedDeviceInterface|null>null,
  onDone: (param:UserSetupParameters) => {},

  actions: { 
    connectDevice() {

      if(window.location.hostname === 'localhost') {

        const device = new FakeDevice();
        this.set('device', device);
        this.devices.addDevice(device);
      } else {
        return getDeviceFactory().findPowermeter().then((device:ConnectedDeviceInterface) => {
          this.set('device', device);
          this.devices.addDevice(device);
        });
      }
    },
    done() {
      if(this.device) {
        this.onDone({
          name: this.userName,
          handicap: parseFloat(this.userHandicap),
          device: this.device,
        })
      }
    }

  }
}) {

  didInsertElement() {
    window.assert2(this.onDone);
  }

  // normal class body definition here
  @computed("userName", "userHandicap", "device")
  get disableDone():boolean {
    return !this.get('userName') || !this.get('userHandicap') || !this.get('device');
  }
};
