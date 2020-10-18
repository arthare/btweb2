import Controller from '@ember/controller';
import Ember from 'ember';
import Devices from 'bt-web2/services/devices';
import { computed } from '@ember/object';
import { User } from 'bt-web2/server-client-common/User';

export default class HrmControl extends Controller.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service(),

  lastBpm: 0,
  targetHandicap: 75,
  targetBpm: 150,


  actions: {
    upTarget() {
      this.incrementProperty('targetBpm');
    },
    downTarget() {
      this.decrementProperty('targetBpm');
    },
    upErg() {
      this.incrementProperty('targetHandicap');
    },
    downErg() {
      this.decrementProperty('targetHandicap');
    },
    downloadFile() {
      this.devices.dumpPwx("HRM-Control", new Date().getTime());
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
      tmLast = tmNow;
      this._tick(tmNow, dt);
      this.devices.tick(tmNow, false);

      if(!this.isDestroyed) {
        setTimeout(doTick, 500);
      }
    }

    setTimeout(doTick, 500);
  }

  _tick(tmNow:number, dt:number) {
    const user = this.devices.getLocalUser();
    const targetBpm = this.get('targetBpm');
    const targetHandicap = this.get('targetHandicap');
    if(user) {
      const lastBpm = user.getLastHrm(tmNow);
      const lastWatts = user.getLastPower();
      this.set('lastBpm', lastBpm);

      console.log("tick");
      if(lastBpm > 0 && lastWatts > 0) {
        // ok, so we know their lastBpm (in lastBpm), and we know their targetBpm (in targetBpm).
        // we probably need to adjust targetErg up or down based on the delta

        let error = targetBpm - lastBpm;
        let handicapsPerSecToAdjust = 0;
        if(error > 0) {
          // we're too low, heartrate wise, so we need to gradually increase the difficulty

          // clamp it to a max of 10bpm error - this way when you initially get on the bike with a HR of 60 it doesn't shoot way the hell up
          error = Math.min(10, error);
          handicapsPerSecToAdjust = 0.025*(Math.min(10, error));
        } else {
          // we're too high.  bring things down fairly quickly.
          handicapsPerSecToAdjust = 0.065*(error);
        }
  
        let newTargetHandicap = targetHandicap + handicapsPerSecToAdjust*dt;
        this._applyTargetErg(user, newTargetHandicap);
      } else {
        this._applyTargetErg(user, targetHandicap);
      }
    }

  }

  _applyTargetErg(user:User, handicap:number) {
    this.devices.setErgMode(handicap * user.getHandicap() / 100);
    this.set('targetHandicap', handicap);
  }

  
  @computed("lastBpm")
  get strLastBpm():string {
    return this.get('lastBpm').toFixed(0) + 'bpm';
  }
  @computed("targetHandicap")
  get strTargetHandicap():string {
    return this.get('targetHandicap').toFixed(1) + '%';
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
