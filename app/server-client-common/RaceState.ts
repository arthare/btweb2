import { RideMap } from "./RideMap";
import { User, UserTypeFlags } from "./User";
import { assert2 } from "./Utils";
import { S2CPositionUpdate, S2CNameUpdate } from "./communication";


// why UserProvider?  this lets us have a network-connected module that figures out all the users that are currently
// in existence.
export interface UserProvider {
  getUsers():User[];
  getUser(id:number):User|null;
}

export class RaceState {
  private _map:RideMap;
  private _userProvider:UserProvider;
  private _gameId:string;
  constructor(map:RideMap, users:UserProvider, gameId:string) {
    this._map = map;
    this._userProvider = users;
    this._gameId = gameId;
  }
  tick(tmNow:number) {

    const users = this._userProvider.getUsers();
    users.forEach((user) => {
      user.physicsTick(tmNow, this._map, users);
    });
  }
  getGameId():string {
    return this._gameId;
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

  absorbPositionUpdate(msg:S2CPositionUpdate) {
    msg.clients.forEach((client) => {
      const user = this._userProvider.getUser(client.id);
      if(user) {
        user.absorbPositionUpdate(client);
      }
    })
  }
  absorbNameUpdate(msg:S2CNameUpdate) {
    msg.ids.forEach((id, index) => {
      const user = this._userProvider.getUser(id);
      if(user) {
        user.absorbNameUpdate(msg.names[index]);
      }
    })
  }

}