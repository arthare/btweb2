import Controller from '@ember/controller';
import { BluetoothKickrDevice, SlopeSource } from 'bt-web2/pojs/WebBluetoothDevice';
import Devices from 'bt-web2/services/devices';
import Ember from 'ember';

class SimpleSlopeSource implements SlopeSource {
  slope = 0;

  getLastSlopeInWholePercent(): number {
    return this.slope;
  }
  setSlope(slope:number) {
    this.slope = slope;
  }
}

export default class KickrSetup extends Controller.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service('devices'),
  downhillStrength: 0x3fff,
  uphillStrength: 0x2000,
  currentHill: 0,
  mySlopeSource: new SimpleSlopeSource(),
  frame:0,

  _applyToKickr(dh:number, uh:number) {
    const kickr = BluetoothKickrDevice.getKickrDevice();
    if(kickr) {
      kickr.setUphillDownhill(Math.floor(dh), Math.floor(uh));
      console.log("applied uphill/downhill to kickr");
    }
  },

  hillObserver: Ember.observer('currentHill', 'downhillStrength', 'uphillStrength', 'frame', function(this:KickrSetup) {
    if(this.isDestroyed) {
      return;
    }
    const percents = this.get('currentHill');
    const currentDown = parseInt('' + this.get('downhillStrength'));
    const currentUp = parseInt('' + this.get('uphillStrength'));
    const frame = this.get('frame');

    console.log("kickr setup frame " + frame + " setting slope to ", percents);
    this.get('mySlopeSource').setSlope(percents);

    const kickr = BluetoothKickrDevice.getKickrDevice();
    if(kickr) {
      kickr.setUphillDownhill(currentDown, currentUp);
      kickr.setSlopeSource(this.get('mySlopeSource'));
      kickr.updateSlope(new Date().getTime(), 1);
    }
  }),

  actions: {
    downhill(pct:number) {
      const currentDown = parseInt('' + this.get('downhillStrength'));
      const afterDown = Math.min(0x3fff, Math.max(0, currentDown * pct));
      const currentUp = parseInt('' + this.get('uphillStrength'));
      const afterUp = Math.min(afterDown - 1, currentUp);
      
      this.set('downhillStrength', Math.floor(afterDown));
      this.set('uphillStrength', Math.floor(afterUp));

      this._applyToKickr(afterDown, afterUp);
    },
    uphill(pct:number) {
      const currentUp = parseInt('' + this.get('uphillStrength'));
      const afterUp = Math.min(0x3fff, Math.max(0, currentUp * pct));
      const currentDown = parseInt('' + this.get('uphillStrength'));
      const afterDown = Math.max(afterUp + 1, currentDown);
      
      this.set('downhillStrength', Math.floor(afterDown));
      this.set('uphillStrength', Math.floor(afterUp));

      this._applyToKickr(afterDown, afterUp);

    },
    save() {
      window.localStorage.setItem('kickr-downhill-number', '' + parseInt('' + this.get('downhillStrength')));
      window.localStorage.setItem('kickr-uphill-number', '' + parseInt('' + this.get('uphillStrength')));
      alert("Saved kickr configs");
    },
    setHill(percents:number) {
      this.set('currentHill', percents);
    },
  }
}) {
  // normal class body definition here
  _setup() {
    const dh = parseInt(window.localStorage.getItem('kickr-downhill-number') || '0x3fff');
    this.set('downhillStrength', dh);

    const uh = parseInt(window.localStorage.getItem('kickr-uphill-number') || '0x2000');
    this.set('uphillStrength', uh);


    const incrementFrame = () => {
      this.incrementProperty('frame');

      if(window.location.pathname.includes('kickr-setup')) {
        setTimeout(() => incrementFrame(), 1000);
      }
    }
    setTimeout(() => incrementFrame(), 1000);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'kickr-setup': KickrSetup;
  }
}
