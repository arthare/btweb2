import { User, UserTypeFlags } from "./User";
import { UserProvider, RaceState } from "./RaceState";
import { ClientConnectionRequest, CurrentRaceState } from "./communication";
import { RideMap } from "./RideMap";
import { assert2 } from "./Utils";
import { SERVER_PHYSICS_FRAME_RATE } from "../../api/ServerConstants";

export class ServerUser extends User {
  _tmLastNameSent:number;
  _tmLastFinishUpdate:number;

  constructor(name:string, massKg:number, handicap:number, typeFlags:number) {
    super(name, massKg, handicap, typeFlags);

    this._tmLastFinishUpdate = -1;
    this._tmLastNameSent = -1;
  }

  noteLastNameUpdate(tmWhen:number) {
    this._tmLastNameSent = tmWhen;
  }
  getLastNameUpdate():number {
    return this._tmLastNameSent;
  }
  
  public getTimeSinceFinishUpdate(tmNow:number):number {    
    return tmNow - this._tmLastFinishUpdate;
  }
  public noteFinishUpdate(tmNow:number) {
    this._tmLastFinishUpdate = tmNow;
  }
  public setPosition(where:number) {
    this._position = where;
  }
}

let userIdCounter = 0;
const userIdToUserMap:Map<number, ServerUser> = new Map<number,ServerUser>();
export class ServerUserProvider implements UserProvider {
  constructor() {
    this.users = [];
  }
  getUsers(tmNow:number): User[] {
    return this.users.filter((user) => {
      return user.getMsSinceLastPacket(tmNow) < 5000 ||  // either this user is still obviously connected
             user.isFinished() ||
             user.getUserType() & UserTypeFlags.Ai; // or this user has finished
    });
  }
  getUser(id:number):ServerUser|null {
    return this.users.find((user) => user.getId() === id) || null;
  }
  addUser(ccr:ClientConnectionRequest, userTypeFlags?:UserTypeFlags):number {

    if(!userTypeFlags) {
      userTypeFlags = 0;
    }

    let newId = userIdCounter++;
    const user = new ServerUser(ccr.riderName, 80, ccr.riderHandicap, UserTypeFlags.Remote | userTypeFlags);
    user.setId(newId);
    this.users.push(user);
    userIdToUserMap.set(newId, user);
    return newId;    
  }

  users:ServerUser[];
}
export class ServerGame {
  constructor(map:RideMap, gameId:string, cAis:number) {
    this.userProvider = new ServerUserProvider();
    this.raceState = new RaceState(map, this.userProvider, gameId);

    for(var x = 0;x < cAis; x++) {
      const aiStrength = Math.random()*75 + 225;
      this.userProvider.addUser({
        riderName:`AI ${x} (${aiStrength.toFixed(0)}W)`,
        accountId:"-1",
        riderHandicap: aiStrength,
        gameId:gameId,
      }, UserTypeFlags.Ai)
    }

    this._timeout = null;
    this._tmScheduledRaceStart = -1;
    this._tmRaceStart = -1;
  }
  private start(tmNow:number) {
    this._tmRaceStart = tmNow;
    this._scheduleTick();
  }
  public addUser(tmNow:number, ccr:ClientConnectionRequest):number {
    // they've added a user.  So we want to perhaps manage the game start to tip it towards starting soon.
    let newId = this.userProvider.addUser(ccr);

    const user = this.userProvider.getUser(newId);
    if(user && this._lastRaceStateMode === CurrentRaceState.PostRace) {
      // we are already done this race.  Claim that this user finished now
      user.setFinishTime(tmNow);
      user.setPosition(this.raceState.getMap().getLength());
    }

    if(this._tmScheduledRaceStart < 0) {
      // we don't have a race start time yet.  Let's put it in the future about 30 seconds
      this._tmScheduledRaceStart = tmNow + 30000;
    }
    this._scheduleTick();
    return newId;
  }
  public scheduleRaceStartTime(tmWhen:number) {
    this._tmScheduledRaceStart = tmWhen;
  }
  public getLastRaceState():CurrentRaceState {
    return this._lastRaceStateMode;
  }
  public getRaceStartTime():number {
    return this._tmRaceStart;
  }
  public getRaceScheduledStartTime():number {
    return this._tmScheduledRaceStart;
  }
  public getUser(userId:number):ServerUser|undefined {
    return userIdToUserMap.get(userId);
  }
  private _tick() {
    const tmNow = new Date().getTime();

    let thisRaceState:CurrentRaceState|null = null;

    this.userProvider.getUsers(tmNow).forEach((user:User) => {
      if(user.getUserType() & UserTypeFlags.Ai) {
        const spread = 50;
        const pct = user.getHandicap() / 300;
        user.notifyPower(tmNow, pct*user.getHandicap() + Math.random()*spread - spread/2);
      }
    })

    if(tmNow < this._tmScheduledRaceStart) {
      // not ready for race start yet, so don't run the physics
      this._scheduleTick();
      thisRaceState = CurrentRaceState.PreRace;
      this._tmRaceStart = -1;
    } else {
      // we racin!
      if(this._tmRaceStart < 0) {
        this._tmRaceStart = tmNow; // record the very first timestamp that we applied physics
      }

      if(this.raceState.isAllHumansFinished()) {
        // all the humans are done, so we don't need a physics update or anything
        thisRaceState = CurrentRaceState.PostRace;
      } else {
        this.raceState.tick(tmNow);
        this._scheduleTick();
        thisRaceState = CurrentRaceState.Racing;
      }
    }

    assert2(thisRaceState !== null, "We must set this every time");
    this._lastRaceStateMode = thisRaceState;
  }
  
  private _scheduleTick() {
    this._timeout = setTimeout(() => this._tick(), 1000 / SERVER_PHYSICS_FRAME_RATE);
  }
  private _timeout:any;
  private _tmRaceStart:number; // first timestamp that we applied physics
  private _tmScheduledRaceStart:number; // timestamp that we plan on starting the race
  private _lastRaceStateMode:CurrentRaceState = CurrentRaceState.PreRace; // a summary of the race mode we're currently running
  raceState:RaceState;
  userProvider:ServerUserProvider;
}