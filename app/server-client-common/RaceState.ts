import { RideMap } from "./RideMap";
import { User, UserTypeFlags } from "./User";
import { assert2 } from "./Utils";


// why UserProvider?  this lets us have a network-connected module that figures out all the users that are currently
// in existence.
export interface UserProvider {
  getUsers():User[];
}

export class RaceState {
  private _map:RideMap;
  private _userProvider:UserProvider;
  constructor(map:RideMap, users:UserProvider) {
    this._map = map;
    this._userProvider = users;
  }
  tick(tmNow:number) {

    const users = this._userProvider.getUsers();
    users.forEach((user) => {
      user.physicsTick(tmNow, this._map, users);
    });
  }
  getMap():RideMap {
    return this._map;
  }
  getLocalUser():User|null {
    const users = this._userProvider.getUsers();
    const allLocal = users.filter((user) => {
      return user.getUserType() & UserTypeFlags.Local;
    });
    assert2(allLocal.length === 1);
    return allLocal[0];
  }

}