import { User, UserTypeFlags } from "./User";
import { UserProvider, RaceState } from "./RaceState";
import { ClientConnectionRequest, CurrentRaceState } from "./communication";
import { RideMap } from "./RideMap";
import { assert2 } from "./Utils";
import { SERVER_PHYSICS_FRAME_RATE } from "../../api/ServerConstants";
import fs from 'fs';

export class ServerUser extends User {
  _tmLastNameSent:number;
  _tmLastFinishUpdate:number;
  _tmLastImageUpdate:number;
  _usersIveBeenSentImagesFor:Set<number> = new Set();

  constructor(name:string, massKg:number, handicap:number, typeFlags:number) {
    super(name, massKg, handicap, typeFlags);

    this._tmLastFinishUpdate = -1;
    this._tmLastNameSent = -1;
    this._tmLastImageUpdate = -1;
  }

  hasBeenSentImageFor(userId:number) {
    return this._usersIveBeenSentImagesFor.has(userId);
  }
  noteImageSent(tmNow:number, userId:number) {
    this._usersIveBeenSentImagesFor.add(userId);
    this._tmLastImageUpdate = tmNow;
  }
  getLastImageUpdate() {
    return this._tmLastImageUpdate;
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
      return user.getMsSinceLastPacket(tmNow) < 300000 ||  // either this user is still obviously connected
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
    if(ccr.imageBase64) {
      console.log("user ", ccr.riderName, " has an image!");
      user.setImage(ccr.imageBase64);
    }
    user.setId(newId);
    this.users.push(user);
    userIdToUserMap.set(newId, user);
    return newId;    
  }

  users:ServerUser[];
}
export class ServerGame {
  constructor(map:RideMap, gameId:string, name:string, cAis:number) {
    this.userProvider = new ServerUserProvider();
    this.raceState = new RaceState(map, this.userProvider, gameId);

    for(var x = 0;x < cAis; x++) {
      const aiStrength = Math.random()*75 + 225;
      this.userProvider.addUser({
        riderName:`AI ${x} (${aiStrength.toFixed(0)}W)`,
        accountId:"-1",
        riderHandicap: aiStrength,
        gameId:gameId,
        imageBase64: null,
      }, UserTypeFlags.Ai)
    }

    this._timeout = null;
    this._tmScheduledRaceStart = -1;
    this._tmRaceStart = -1;
    this._name = name;
    this._gameId = gameId;
  }

  public getDisplayName() {
    return this._name;
  }
  public getGameId() {
    return this._gameId;
  }

  public findUserByImage(tmNow:number, imageBase64:string, riderName:string, handicap:number):ServerUser|null {

    const users = this.userProvider.getUsers(tmNow);
    const found:User|null = users.find((user) => {
      return !(user.getUserType() & UserTypeFlags.Ai) &&
              user.getHandicap() === handicap &&
              user.getName() === riderName &&
             user.getImage() && user.getImage() === imageBase64;
    }) || null;

    if(found) {
      return <ServerUser>found;
    }
    return null;
  }

  private start(tmNow:number) {
    this._tmRaceStart = tmNow;
    this._scheduleTick();
  }
  public stop() {
    this._stopped = true;
    this.raceState.stop();
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
    if(this._stopped) {
      return;
    }
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

      switch(this._lastRaceStateMode) {
        case CurrentRaceState.PreRace:
          // our last race state was prerace, but our tmNow is greater than the scheduled race start time.  So we're definitely racing now!
          thisRaceState = CurrentRaceState.Racing;
          console.log(`we're past the scheduled start time of ${this.raceState.getGameId()}, so we're starting`);
          this.raceState.tick(tmNow);
          break;
        case CurrentRaceState.Racing:
        {
          if(this.raceState.isAllHumansFinished(tmNow)) {
            if(this.raceState.isAllRacersFinished(tmNow)) {
              // ok, absolutely everyone is finished, so we _really_ don't need a physics update, and we're definitely post-race
              thisRaceState = CurrentRaceState.PostRace;
              console.log(`all racers (human and AI) are done ${this.raceState.getGameId()}, so we're post-race now`);
            } else {
              // some AIs are still going, and some humans may return at some point.
              this.raceState.tick(tmNow);
              const sSinceFinish = this.raceState.getSecondsSinceLastNonFinishedHuman(tmNow);
              if(sSinceFinish >= 300) {
                thisRaceState = CurrentRaceState.PostRace;
                console.log("Been 5 minutes since we last saw an unfinished human on " + this.raceState.getGameId() + ", so we're going to post-race");
              } else {
                thisRaceState = CurrentRaceState.Racing;
              }
            }
          } else {
            // some humams are still racing
            this.raceState.tick(tmNow);
            thisRaceState = CurrentRaceState.Racing;
          }
          break;
        }
        case CurrentRaceState.PostRace:
        {
          thisRaceState = CurrentRaceState.PostRace;
          break;
        }
      }
      this._scheduleTick();
    }

    assert2(thisRaceState !== null, "We must set this every time");
    this._lastRaceStateMode = thisRaceState;
  }
  
  private _scheduleTick() {
    if(this._stopped) {
      // don't do anything!
    } else {
      this._timeout = setTimeout(() => this._tick(), 1000 / SERVER_PHYSICS_FRAME_RATE);
    }
  }
  private _stopped:boolean = false;
  private _timeout:any;
  private _name:string;
  private _gameId:string;
  private _tmRaceStart:number; // first timestamp that we applied physics
  private _tmScheduledRaceStart:number; // timestamp that we plan on starting the race
  private _lastRaceStateMode:CurrentRaceState = CurrentRaceState.PreRace; // a summary of the race mode we're currently running
  raceState:RaceState;
  userProvider:ServerUserProvider;
}