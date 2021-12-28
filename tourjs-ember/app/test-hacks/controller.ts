import Controller from '@ember/controller';
import { PureCosineMap, IntoAHillMap } from 'bt-web2/server-client-common/RideMap';
import { RaceState, UserProvider } from 'bt-web2/server-client-common/RaceState';
import { User, UserTypeFlags, DEFAULT_HANDICAP_POWER, DEFAULT_RIDER_MASS, UserInterface } from 'bt-web2/server-client-common/User';
import { ServerMapDescription } from 'bt-web2/server-client-common/communication';
import { RideMapHandicap } from 'bt-web2/server-client-common/RideMapHandicap';
import Devices from 'bt-web2/services/devices';
import Ember from 'ember';


export default class TestHacks extends Controller.extend({
  // anything which *must* be merged to prototype here
  raceState: <RaceState|null>null,
  userProvider: <FakeUserProvider|null>null,
  devices: <Devices><unknown>Ember.inject.service('devices'),
  frame: 0,
}) {
  // normal class body definition here
  controllerInit() {
    const baseMap = new PureCosineMap(5000);
    const fullMap = new RideMapHandicap(new ServerMapDescription(baseMap));
    
    const userProvider = new FakeUserProvider(this.devices.getLocalUser());
    this.set('raceState', new RaceState(fullMap, userProvider, "Test Game"));


    const fnUpdatePowers = () => {
      if(!this.isDestroyed) {
        const tmNow = new Date().getTime();
        userProvider.getUsers(tmNow).forEach((user, index) => {
          //if(user.getUserType() & UserTypeFlags.Local) 
          {
            // this is a local guy.  we'll send fake power if there's not a device connected
            if(this.devices.devices.length > 0) {
              // there's already a device for this guy
            } else {
              user.notifyHrm(tmNow, Math.random() + 170 + index*5);
              user.notifyPower(tmNow, Math.random()*50 + 100 + index*2);
            }
          }
        })

        setTimeout(fnUpdatePowers, 200);
        this.devices.tick(tmNow, true);
      }
    }
    setTimeout(fnUpdatePowers);
    

  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'test-hacks': TestHacks;
  }
}
