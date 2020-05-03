import Controller from '@ember/controller';
import { PureCosineMap } from 'bt-web2/server-client-common/RideMap';
import { RaceState, UserProvider } from 'bt-web2/server-client-common/RaceState';
import { User, UserTypeFlags } from 'bt-web2/server-client-common/User';
import { ServerMapDescription } from 'bt-web2/server-client-common/communication';
import { RideMapHandicap } from 'bt-web2/server-client-common/RideMapHandicap';

class FakeUserProvider implements UserProvider {
  users: User[];

  constructor() {
    this.users = [
      new User("Local User", 80, 600, UserTypeFlags.Local),
      new User("Human Remote", 80, 280, UserTypeFlags.Remote),
      new User("Slow Fella", 80, 900, UserTypeFlags.Remote),
      new User("Fast Fella", 80, 30, UserTypeFlags.Remote),
    ];

    for(var x = 1;x < 50; x++) {
      const aiUser = new User(`AI Remote ${x}`, 80, 300 + x*30, UserTypeFlags.Ai | UserTypeFlags.Remote);
      this.users.push(aiUser);
    }
    this.users.forEach((user, index) => {
      user.setId(index);
      user.setImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAY0lEQVR42u3QAREAAAQEsJdcdHI4W4RVMp3HSoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECLhvAcDdX8EOJRgWAAAAAElFTkSuQmCC');
    });
  }

  getUsers(tmNow: number): User[] {
    
    return this.users.slice();
  }  
  
  getUser(id: number): User | null {
    return this.users.find((user) => user.getId() === id) || null;
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
    const baseMap = new PureCosineMap(5000);
    const fullMap = new RideMapHandicap(new ServerMapDescription(baseMap));
    
    const userProvider = new FakeUserProvider();
    this.set('raceState', new RaceState(fullMap, userProvider, "Test Game"));


    const fnUpdatePowers = () => {
      if(!this.isDestroyed) {
        const tmNow = new Date().getTime();
        userProvider.getUsers(tmNow).forEach((user, index) => {
          user.notifyPower(tmNow, Math.random()*50 + 200 + index*2);
        })

        setTimeout(fnUpdatePowers, 200);
        this.devices.tick(tmNow);
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
