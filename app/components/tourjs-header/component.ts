import Component from '@ember/component';
import { getDeviceFactory } from 'bt-web2/pojs/DeviceFactory';
import { ConnectedDeviceInterface } from 'bt-web2/pojs/WebBluetoothDevice';
import { User } from 'bt-web2/server-client-common/User';
import Connection from 'bt-web2/services/connection';
import Devices, { DeviceFlags } from 'bt-web2/services/devices';
import Ember from 'ember';

export default class TourjsHeader extends Component.extend({
  // anything which *must* be merged to prototype here
  classNames: ['tourjs-header__container'],
  devices: <Devices><unknown>Ember.inject.service('devices'),
  connection: <Connection><unknown>Ember.inject.service('connection'),
  frame: 0,
  frameInterval: null,

  you: Ember.computed('devices.ridersVersion', function() {
    const user:User = this.devices.getLocalUser();
    return user;
  }),

  yourName: Ember.computed('you', function() {
    const user:User = this.get('you');
    if(user) {
      return user.getName();
    } else {
      return 'Unset';
    }
  }),
  yourFtp: Ember.computed('you', function() {
    const user:User = this.get('you');
    if(user) {
      return user.getHandicap().toFixed(1) + 'W';
    } else {
      return 'Unset';
    }
  }),

  hasPower: Ember.computed('devices.ridersVersion', function() {
    return !!this.devices.getPowerDevice()
  }),
  hasHrm: Ember.computed('devices.ridersVersion', function() {
    return !!this.devices.getHrmDevice()
  }),
  lastPower: Ember.computed('frame', 'you', function() {
    const you:User = this.get('you');
    return you && (you.getLastPower().toFixed(0) + 'W') || '---W';
  }),
  lastHrm: Ember.computed('frame', 'you', function() {
    const you:User = this.get('you');
    const hrm = you && (you.getLastHrm(new Date().getTime()).toFixed(0) + 'bpm') || '---bpm';
    return hrm;
  }),

  actions: {
    connectHrm() {
      getDeviceFactory().findHrm().then((device:ConnectedDeviceInterface) => {
        this.devices.setLocalUserDevice(device, DeviceFlags.Hrm);
      });

    },
    connectPower() {
      getDeviceFactory().findPowermeter(false).then((device:ConnectedDeviceInterface) => {
        this.devices.setLocalUserDevice(device, DeviceFlags.AllButHrm);
      })
    },
  }
}) {
  // normal class body definition here
  didInsertElement() {
    this.set('frameInterval', setInterval(() => {
      this.incrementProperty('frame');
    }, 1000));
  }
  willDestroyElement() {
    clearInterval(this.get('frameInterval') as any);
  }
};
