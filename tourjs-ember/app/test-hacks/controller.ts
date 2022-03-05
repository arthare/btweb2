import Controller from '@ember/controller';
import { PureCosineMap, IntoAHillMap } from 'bt-web2/tourjs-shared/RideMap';
import { RaceState, UserProvider } from 'bt-web2/tourjs-shared/RaceState';
import { User, UserTypeFlags, DEFAULT_HANDICAP_POWER, DEFAULT_RIDER_MASS, UserInterface } from 'bt-web2/tourjs-shared/User';
import { ServerMapDescription } from 'bt-web2/tourjs-shared/communication';
import { RideMapHandicap } from 'bt-web2/tourjs-shared/RideMapHandicap';
import Devices from 'bt-web2/services/devices';
import Ember from 'ember';
import { MathUtils } from 'three';


export class FakeUserProvider implements UserProvider {
  users: UserInterface[];
  _local:UserInterface|null;

  constructor(localUserOverride:UserInterface|null) {
    this._local = localUserOverride;
    this.users = [
      localUserOverride ? localUserOverride : new User("Local User", DEFAULT_RIDER_MASS, 100, UserTypeFlags.Local),
      new User("Human Remote", DEFAULT_RIDER_MASS, 260, UserTypeFlags.Remote),
      new User("Human Remote", DEFAULT_RIDER_MASS, 260, UserTypeFlags.Remote),
      new User("Human Remote", DEFAULT_RIDER_MASS, 240, UserTypeFlags.Remote),
      //new User("Slow Fella", DEFAULT_RIDER_MASS, 900, UserTypeFlags.Remote),
      //new User("Fast Fella", DEFAULT_RIDER_MASS, 30, UserTypeFlags.Remote),
    ];

    for(var x = 0;x < 0; x++) {
      const aiUser = new User(`AI Remote ${x}`, DEFAULT_RIDER_MASS, 200 + Math.random()*150, UserTypeFlags.Ai | UserTypeFlags.Remote);
      this.users.push(aiUser);
    }
    this.users.forEach((user, index) => {
      user.setId(index);
      user.setImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAFiUAABYlAUlSJPAAAADpSURBVEhL7ZZBEkQwEEUtcwTLOUqWjuAIbmGlHMPWDRzNMv7Ib2WQQWOqZszbdaL7hVRaIncxPyao67ooCgZ7aJrm0VNVFYeEFwGqR5HmnVAaicAYwyHhnE9UlqUXZFnGIeGze3AFf8EqdxMojvo+geKo320PFJwmQMe21q606yPEcYz9D7brkH87fbd+wlhgPPjVDl8dMBYYo7SfVjt8OmAsMB5+SUDnYHJIAI448jxn5hsBGDvA4i1hjL9M8OmeNE05J0yFE8cukiRp25aFhKkA6BxY+7w6WBB4tmvmV5UxQcFZfLvAuQ7+9Jkk3ToNzAAAAABJRU5ErkJggg==', '');
    });
  }

  getUsers(tmNow: number): UserInterface[] {
    return this.users.slice();
  }  
  
  getUser(id: number): UserInterface | null {
    return this.users.find((user) => user.getId() === id) || null;
  }
  getLocalUser():UserInterface|null {
    return this._local || null;
  }


}

export default class TestHacks extends Controller.extend({
  // anything which *must* be merged to prototype here
  raceState: <RaceState|null>null,
  userProvider: <FakeUserProvider|null>null,
  devices: <Devices><unknown>Ember.inject.service('devices'),
  frame: 0,
}) {
  // normal class body definition here
  controllerInit() {
    console.log("test-hacks controller init");
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
              user.notifyPower(tmNow, Math.random()*50 + 300 + index*2);
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
