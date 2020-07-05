import { CadenceRecipient, FnPowerReceipient, HrmRecipient, SlopeSource } from "../pojs/WebBluetoothDevice";
import { RideMap } from "./RideMap";
import { assert2, formatDisplayDistance } from "./Utils";
import { RaceState } from "./RaceState";
import { S2CPositionUpdateUser, S2CPositionUpdate } from "./communication";

export enum UserTypeFlags {
  Local = 1,
  Remote = 2,
  Ai = 4,
}

export interface UserDisplay {
  rankString?: string;
  name: string;
  lastPower: string;
  distance: string;
  speed: string;
  slope: string;
  elevation: string;
  classString: string;
  lastWattsSaved: string;
  secondsDelta?:string;
  handicap:string;
  user:User;
  hrm: string;
}

class UserDataRecorder implements CadenceRecipient, HrmRecipient {
  private _lastPower:number = 0;
  private _tmLastPower:number = 0;
  private _id:number = -1; // assigned by the server.  Positive when set
  private _tmFinish:number = -1;
  private _tmLastPacket:number = -1;

  private _lastHrm = 0;
  private _tmLastHrm = 0;

  isPowerValid(tmNow:number):boolean {
    return tmNow - this._tmLastPower < 5000;
  }

  public notifyPower(tmNow:number, watts:number):void {
    this._lastPower = watts;
    this._tmLastPower = tmNow;
  }
  public notifyCadence(tmNow:number, cadence:number):void {

  }
  public notifyHrm(tmNow:number, hrm:number):void {
    this._tmLastHrm = tmNow;
    this._lastHrm = hrm;
  }

  public getLastHrm(tmNow:number):number {
    if(tmNow <= this._tmLastHrm + 5000) {
      return this._lastHrm;
    }
    return 0;
  }
  public getLastPower():number {
    return this._lastPower;
  }
  setFinishTime(tmNow:number) {
    this._tmFinish = tmNow;
  }
  getRaceTimeSeconds(tmRaceStart:number):number {
    return (this._tmFinish - tmRaceStart) / 1000.0;
  }
  isFinished():boolean {
    return this._tmFinish >= 0;
  }
  getMsSinceLastPacket(tmNow:number):number {
    return Math.max(0, tmNow - this._tmLastPacket);
  }
  public notePacket(tmNow:number) {
    this._tmLastPacket = tmNow;
  }

  setId(newId:number) {
    if(newId < 0) {
      assert2(this._id >= 0, "You're only allowed setting back to a negative id when you're disconnecting");
    } else if(newId >= 0) {
      assert2(this._id < 0, "You're only allowed setting positive IDs when you're connecting");
    }
    this._id = newId;
  }
  getId() {
    return this._id;
  }
}

export interface DraftSavings {
  watts:number;
  pctOfMax:number;
  fromDistance:number;
}
export interface DistanceHistoryElement {
  tm:number;
  distance:number;
}

export class User extends UserDataRecorder implements SlopeSource {

  private _massKg: number;
  private _handicap: number;
  private _typeFlags:number;
  private _name:string;
  private _lastSlopeWholePercent:number = 0;
  private _imageBase64:string|null = null;

  private _lastT:number = 0;
  private _speed:number = 0;
  protected _position:number = 0;
  private _lastDraftSaving:DraftSavings = {watts:0, pctOfMax:0, fromDistance:0};
  private _distanceHistory:DistanceHistoryElement[] = [];
  private _tmLastHandicapRevision:number = 0;

  private _pendingDraftees:any = {};
  private _lastDraftees:any = {};
  private _tmDrafteeCycle:number = 0;

  constructor(name:string, massKg:number, handicap:number, typeFlags:number) {
    super();
    this._massKg = massKg;
    this._handicap = handicap;
    this._typeFlags = typeFlags;
    this._name = name;
    this._lastT = new Date().getTime() / 1000.0;
  }

  protected setHandicap(watts:number) {
    assert2(watts >= this._handicap, "you should only increase handicaps, not tank them");
    this._handicap = watts;
  }

  getPositionUpdate(tmNow:number):S2CPositionUpdateUser {
    return {
      id:this.getId(),
      distance:this.getDistance(),
      speed:this.getSpeed(),
      power:this.getLastPower(),
      hrm:this.getLastHrm(tmNow),
    }
  }
  setDistance(dist:number) {
    this._position = dist;
  }
  setSpeed(speed:number) {
    this._speed = speed;
  }
  setDistanceHistory(newHistory:DistanceHistoryElement[]) {
    assert2(this._distanceHistory.length === 0); // this is intended to only be used if you're creating a "summary" user for the leaderboard
    this._distanceHistory = newHistory;
  }
  getDistanceHistory():DistanceHistoryElement[] {
    return this._distanceHistory;
  }

  getLastSlopeInWholePercent(): number {
    return this._lastSlopeWholePercent;
  }

  getDistance():number {
    return this._position;
  }
  getSpeed():number {
    return this._speed;
  }

  getName():string {
    return this._name;
  }
  getImage():string|null {
    return this._imageBase64;
  }

  getUserType():number {
    return this._typeFlags;
  }

  getHandicap() {
    return this._handicap;
  }
  getLastHandicapChangeTime():number {
    return this._tmLastHandicapRevision;
  }


  physicsTick(tmNow:number, map:RideMap, otherUsers:User[]) {
    const t = tmNow / 1000.0;
    const dtSeconds = t - this._lastT;
    this._lastT = t;
    if(dtSeconds < 0 || dtSeconds >= 1.0) {
      return;
    }

    // apply handicapping or other wackiness that the map might be applying
    const fnTransformPower = map.getPowerTransform(this);
    const transformedPower:number = fnTransformPower(this.getLastPower());


    const powerForce = transformedPower / Math.max(this._speed, 0.5);

    const rho = 1.225;
    const cda = 0.25;
    let aeroForce = -Math.pow(this._speed, 2) * 0.5 * rho * cda;


    const draftingClose = 2;
    const draftingFar = 10;
    let closestRider:User|null = null;
    let closestRiderDist:number = 1e30;

    otherUsers.forEach((user:User) => {
      const userAhead = user.getDistance() - this.getDistance();
      if(userAhead >= draftingClose && userAhead <= draftingFar) {
        if(!closestRider || userAhead < closestRiderDist) {
          closestRiderDist = userAhead;
          closestRider = user;
        }
      }
    });
    if(closestRider) {
      closestRider = <User>closestRider; // make typescript shut up
      // there was a draftable rider
      assert2(closestRiderDist >= draftingClose && closestRiderDist <= draftingFar);
      // if there's 10 guys clustered behind a single rider, they're not going to get
      // as much benefit as a well-managed paceline
      closestRider.notifyDrafteeThisCycle(tmNow, this.getId());
      const cRidersDraftingLastCycle = Math.max(1, closestRider.getDrafteeCount(tmNow));

      let bestPossibleReduction = 0.33 / cRidersDraftingLastCycle;
      const pctClose = 1 - bestPossibleReduction;
      const pctFar = 1.0;
      const myPct = (closestRiderDist - draftingClose) / (draftingFar - draftingClose);
      // myPct will be 1.0 when we're really far, 0.0 when we're really close
      let myPctReduction = myPct*pctFar + (1-myPct)*pctClose;



      const newtonsSaved = (1-myPctReduction)*aeroForce;
      aeroForce *= myPctReduction;

      const wattsSaved = Math.abs(newtonsSaved * this._speed);
      this.setLastWattsSaved(wattsSaved, 1-myPct, this.getDistance() + closestRiderDist);
    } else {
      this.setLastWattsSaved(0, 0, this.getDistance());
    }

    const slope = map.getSlopeAtDistance(this._position);
    this._lastSlopeWholePercent = slope*100;
    const theta = Math.atan(slope);

    const sinSquared = Math.sin(theta)*Math.sin(theta);
    const cosSquared = Math.pow(Math.cos(theta)-1,2);
    let slopeForce = -Math.sqrt(sinSquared+cosSquared)*this._massKg*9.81;
    if(slope < 0) {
      assert2(slopeForce <= 0);
      slopeForce = -slopeForce;
    }
    
    const rollingForce = -0.0033 * this._massKg * 9.81;

    assert2(rollingForce <= 0);
    assert2(aeroForce <= 0);
    
    const totalForce = powerForce + aeroForce + slopeForce + rollingForce;
    const accel = totalForce / this._massKg;

    this._speed = Math.max(0.5, this._speed  + accel * dtSeconds);
    assert2(this._speed >= 0);

    const lastPosition = this._position;
    const mapLength = map.getLength();
    this._position += Math.min(map.getLength(), this._speed * dtSeconds);
    this._position = Math.min(map.getLength(), this._position);

    const lastDistanceHistory = this._distanceHistory && this._distanceHistory[this._distanceHistory.length-1];
    if(!lastDistanceHistory || 
        this._position > lastDistanceHistory.distance && tmNow > lastDistanceHistory.tm + 1000) {
      this._distanceHistory.push({
        tm: tmNow,
        distance: this._position,
      });
    }

    if(lastPosition < mapLength && this._position >= mapLength) {
      this.setFinishTime(tmNow);
    }
  }

  public notifyDrafteeThisCycle(tmNow:number, id:number) {
    if(tmNow > this._tmDrafteeCycle) {
      // time for a new draftee cycle!
      this._lastDraftees = this._pendingDraftees;
      this._pendingDraftees = {};
      this._tmDrafteeCycle = tmNow;
    }
    this._pendingDraftees[id] = true;
  }
  public getDrafteeCount(tmNow:number):number {
    return Object.keys(this._lastDraftees).length;
  }

  public getSecondsAgoToCross(tmNow:number, distance:number):number|null {
    for(var x = 0;x < this._distanceHistory.length - 1; x++) {
      const hist = this._distanceHistory[x];
      const nextHist = this._distanceHistory[x+1];
      if(hist.distance < distance && nextHist.distance > distance) {
        // we found when we were near the queried spot
        const offset = distance - hist.distance;
        const span = nextHist.distance - hist.distance;
        const pct = offset / span;
        assert2(pct >= -0.001 && pct <= 1.001);
        const tmAtThatDist = pct*nextHist.tm + (1-pct)*hist.tm;
        if(tmAtThatDist < tmNow) {
          return (tmNow - tmAtThatDist) / 1000.0;
        }
      }
    }
    return null;
  }

  public getLastWattsSaved():DraftSavings {
    return this._lastDraftSaving || {
      watts: 0,
      pctOfMax: 0,
      fromDistance: 0,
    };
  }
  private setLastWattsSaved(watts:number, pctOfMax:number, fromDistance:number) {
    this._lastDraftSaving = {
      watts,
      pctOfMax,
      fromDistance,
    }
  }

  getDisplay(raceState:RaceState|null):UserDisplay {
    const map = raceState && raceState.getMap() || null;

    let classes = [];
    if(this._typeFlags & UserTypeFlags.Local) {
      classes.push("local");
    }
    if(!(this._typeFlags & UserTypeFlags.Ai)) {
      classes.push("human");
    } else {
      classes.push("ai");
    }
    if(this._typeFlags & UserTypeFlags.Remote) {
      classes.push("remote");
    }

    const tmNow = new Date().getTime();
    return {
      name: this._name,
      lastPower: this.getLastPower().toFixed(0) + 'W',
      distance: formatDisplayDistance(this._position),
      speed: (this._speed*3.6).toFixed(1) + 'km/h',
      slope: (map && (map.getSlopeAtDistance(this._position)*100).toFixed(1) + '%') || '',
      elevation: (map && map.getElevationAtDistance(this._position).toFixed(0) + 'm') || '',
      classString: classes.join(' '),
      lastWattsSaved: this.getLastWattsSaved().watts.toFixed(1) + 'W',
      handicap: this.getHandicap().toFixed(0) + 'W',
      user: this,
      hrm: this.getLastHrm(tmNow).toFixed(0) + "bpm",
    }
  }

  setImage(imageBase64:string) {
    assert2(imageBase64.startsWith('data:'));
    if(this.getUserType() & UserTypeFlags.Ai) {
      // I don't want to store images for hundreds of AI characters
      this._imageBase64 = null;
    } else {
      this._imageBase64 = imageBase64;
    }
  }

  absorbNameUpdate(tmNow:number, name:string, type:number, handicap:number) {
    this._name = name;
    if(isFinite(handicap)) {
      if(handicap > this._handicap) {
        // remember the last time they bumped up our handicap - we'll put a notification in the UI
        // so someone can see if they got re-handicapped
        this._tmLastHandicapRevision = tmNow;
      }
      this._handicap = handicap;
    }
    if(!(this._typeFlags & UserTypeFlags.Local)) {
      this._typeFlags = type;
    }
  }
  absorbPositionUpdate(tmNow:number, update:S2CPositionUpdateUser) {
    this._speed = update.speed;
    this._position = update.distance;
    if(this._typeFlags & UserTypeFlags.Local) {
      // we're local, so we won't re-absorb the power from the server
    } else {
      // we're a remote or AI user, so we should try to be as similar to the server as possible
      this.notifyPower(tmNow, update.power);
      this.notifyHrm(tmNow, update.hrm);
    }
    this.notePacket(tmNow);
  }
}