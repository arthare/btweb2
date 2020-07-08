import Controller from '@ember/controller';
import Ember from 'ember';
import Devices from 'bt-web2/services/devices';
import { computed } from '@ember/object';

export default class HrmControl extends Controller.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service(),

  lastBpm: 0,
  targetErg: 150,
  targetBpm: 150,


  actions: {
    up() {
      this.incrementProperty('targetBpm');
    },
    down() {
      this.decrementProperty('targetBpm');
    }
  }
}) {
  // normal class body definition here

  startup() {
    console.log("starting hrm control mode");

    let tmLast = new Date().getTime();
    const doTick = () => {

      const tmNow = new Date().getTime();
      const dt = (tmNow - tmLast) / 1000;
      this._tick(tmNow, dt);

      if(!this.isDestroyed) {
        setTimeout(doTick, 500);
      }
    }

    setTimeout(doTick, 500);
  }

  _tick(tmNow:number, dt:number) {
    const user = this.devices.getLocalUser();
    const targetBpm = this.get('targetBpm');
    const targetErg = this.get('targetErg');
    if(user) {
      const lastBpm = user.getLastHrm(tmNow);
      this.set('lastBpm', lastBpm);

      console.log("tick");
      if(lastBpm > 0) {
        // ok, so we know their lastBpm (in lastBpm), and we know their targetBpm (in targetBpm).
        // we probably need to adjust targetErg up or down based on the delta
        const wattsPerSecToAdjust = 0.1*(targetBpm - lastBpm);
  
  
        let newTargetErg = targetErg + wattsPerSecToAdjust*dt;
        this._applyTargetErg(newTargetErg);
      } else {
        this._applyTargetErg(targetErg);
      }
    }

  }

  _applyTargetErg(erg:number) {
    this.devices.setErgMode(this.get('targetErg'));
    this.set('targetErg', erg);
  }

  
  @computed("lastBpm")
  get strLastBpm():string {
    return this.get('lastBpm').toFixed(0) + 'bpm';
  }
  @computed("targetErg")
  get strTargetErg():string {
    return this.get('targetErg').toFixed(0) + 'W';
  }
  @computed("targetBpm")
  get strTargetBpm():string {
    return this.get('targetBpm').toFixed(0) + 'bpm';
  }

}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'hrm-control': HrmControl;
  }
}
