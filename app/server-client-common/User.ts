import { CadenceRecipient, PowerRecipient, HrmRecipient, SlopeSource } from "../pojs/WebBluetoothDevice";
import { RideMap } from "./RideMap";
import { assert2 } from "./Utils";
import { RaceState } from "./RaceState";
import { S2CPositionUpdateUser } from "./communication";

export enum UserTypeFlags {
  Local = 1,
  Remote = 2,
  Ai = 4,
}

export interface UserDisplay {
  name: string;
  lastPower: string;
  distance: string;
  speed: string;
  slope: string;
  elevation: string;
  classString: string;
}

class UserDataRecorder implements CadenceRecipient, PowerRecipient, HrmRecipient {
  private _lastPower:number = 0;
  private _id:number = -1; // assigned by the server.  Positive when set
  private _tmFinish:number = -1;
  private _tmLastPacket:number = -1;

  public notifyPower(tmNow:number, watts:number):void {
    this._lastPower = watts;
  }
  public notifyCadence(tmNow:number, cadence:number):void {

  }
  public notifyHrm(tmNow:number, hrm:number):void {

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
    assert2(this._id < 0 || newId === this._id, "we should only be assigning IDs once...");
    this._id = newId;
  }
  getId() {
    return this._id;
  }
}

export class User extends UserDataRecorder implements SlopeSource {

  private _massKg: number;
  private _handicap: number;
  private _typeFlags:number;
  private _name:string;
  private _lastSlopeWholePercent:number = 0;

  private _lastT:number = 0;
  private _speed:number = 0;
  protected _position:number = 0;
  
  
  constructor(name:string, massKg:number, handicap:number, typeFlags:number) {
    super();
    this._massKg = massKg;
    this._handicap = handicap;
    this._typeFlags = typeFlags;
    this._name = name;
    this._lastT = new Date().getTime() / 1000.0;
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

  getUserType():number {
    return this._typeFlags;
  }

  getHandicap() {
    return this._handicap;
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
    const aeroForce = -Math.pow(this._speed, 2) * 0.5 * rho * cda;

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

    if(lastPosition < mapLength && this._position >= mapLength) {
      this.setFinishTime(tmNow);
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

    return {
      name: this._name,
      lastPower: this.getLastPower().toFixed(0) + 'W',
      distance: this._position.toFixed(0) + 'm',
      speed: (this._speed*3.6).toFixed(1) + 'km/h',
      slope: (map && (map.getSlopeAtDistance(this._position)*100).toFixed(1) + '%') || '',
      elevation: (map && map.getElevationAtDistance(this._position).toFixed(0) + 'm') || '',
      classString: classes.join(' '),
    }
  }

  absorbNameUpdate(name:string) {
    this._name = name;
  }
  absorbPositionUpdate(tmNow:number, update:S2CPositionUpdateUser) {
    this._speed = update.speed;
    this._position = update.distance;
    if(this._typeFlags & UserTypeFlags.Local) {
      // we're local, so we won't re-absorb the power from the server
    } else {
      // we're a remote or AI user, so we should try to be as similar to the server as possible
      console.log("We received an update about remote user ", this.getId(), this._name);
      this.notifyPower(new Date().getTime(), update.power);
    }
    this.notePacket(tmNow);
  }
}