import { UserProvider, RaceState } from "../../tourjs-shared/RaceState";
import { RideMap } from "../../tourjs-shared/RideMap";
import { UserInterface, DEFAULT_RIDER_MASS, UserTypeFlags, User } from "../../tourjs-shared/User";



export class FakeUserProvider implements UserProvider {
  users: UserInterface[];
  _local:UserInterface|null;

  constructor(localUserOverride:UserInterface|null) {
    this._local = localUserOverride;
    this.users = [
      localUserOverride ? localUserOverride : new User("Local User", DEFAULT_RIDER_MASS, 100, UserTypeFlags.Local),
      new User("Human Remote", DEFAULT_RIDER_MASS, 280, UserTypeFlags.Remote),
      //new User("Slow Fella", DEFAULT_RIDER_MASS, 900, UserTypeFlags.Remote),
      //new User("Fast Fella", DEFAULT_RIDER_MASS, 30, UserTypeFlags.Remote),
    ];

    for(var x = 0;x < 1; x++) {
      const aiUser = new User(`AI Remote ${x}`, DEFAULT_RIDER_MASS, 75, UserTypeFlags.Ai | UserTypeFlags.Remote);
      this.users.push(aiUser);
    }
    this.users.forEach((user, index) => {
      user.setId(index);
      user.setImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAY0lEQVR42u3QAREAAAQEsJdcdHI4W4RVMp3HSoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECLhvAcDdX8EOJRgWAAAAAElFTkSuQmCC', '');
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



// helper function that guides the caller through the bits they'll need to make a race state
export async function setupRace(fnMakeMap:()=>Promise<RideMap>, fnMakeUserProvider:()=>Promise<UserProvider>, raceName:string):Promise<RaceState> {
  
  const fullMap = await fnMakeMap();
  
  const userProvider = await fnMakeUserProvider();
  const raceState = new RaceState(fullMap, userProvider, raceName);

  return raceState;
}