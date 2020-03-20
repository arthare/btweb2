import Component from '@ember/component';
import { getDeviceFactory } from 'bt-web2/pojs/DeviceFactory';
import { ConnectedDeviceInterface } from 'bt-web2/pojs/WebBluetoothDevice';
import Ember from 'ember';
import { computed } from '@ember/object';

export interface UserSetupParameters {
  name:string;
  handicap:number;
  device:ConnectedDeviceInterface;
}

export default class UserSetUp extends Component.extend({
  // anything which *must* be merged to prototype here
  devices: <any>Ember.inject.service('devices'),

  userName:'Art',
  userHandicap:'300',
  device:<ConnectedDeviceInterface|null>null,
  onDone: (param:UserSetupParameters) => {},

  actions: { 
    connectDevice() {
      return getDeviceFactory().findPowermeter().then((device:ConnectedDeviceInterface) => {
        this.set('device', device);
        this.devices.addDevice(device);
      });
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
