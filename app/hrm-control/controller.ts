import Controller from '@ember/controller';
import Ember from 'ember';
import Devices from 'bt-web2/services/devices';
import { computed } from '@ember/object';
import { User } from 'bt-web2/server-client-common/User';
import { HeartRateEngine } from 'bt-web2/server-client-common/heart-rate-engine';

export default class HrmControl extends Controller.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service(),

  lastBpm: 0,
  targetHandicap: 75,
  targetBpm: 150,
  gain: 100,
  hrmEngine: <HeartRateEngine|null>null,

  actions: {
    upTarget(amount:number) {
      this.incrementProperty('targetBpm', amount);
    },
    downTarget(amount:number) {
      this.decrementProperty('targetBpm', amount);
    },
    upErg() {
      this.incrementProperty('targetHandicap');
    },
    downErg() {
      this.decrementProperty('targetHandicap');
    },
    gainAdjust(amount:number) {
      this.incrementProperty('gain', amount);
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

    const user = this.devices.getLocalUser();
    if(user) {
      this.set('hrmEngine', new HeartRateEngine(user.getLastHrm(tmLast)));
  
      const doTick = () => {
  
        const tmNow = new Date().getTime();
        const dt = (tmNow - tmLast) / 1000;
        tmLast = tmNow;
        const targetBpm = this.get('targetBpm');
        let targetHandicap = this.get('targetHandicap');
        const hrmEngine = this.get('hrmEngine');
        if(hrmEngine && user) {
          const {newTargetHandicap} = hrmEngine.tick(user, tmNow, dt, targetBpm, targetHandicap, this.get('gain') / 100);
          this.set('targetHandicap', newTargetHandicap);
        }
        this.devices.tick(tmNow, false);
  
        if(!this.isDestroyed) {
          setTimeout(doTick, 500);
        }
      }
      setTimeout(doTick, 500);
    } else {
      alert("Somehow we don't have a user");
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
