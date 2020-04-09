import { writeToCharacteristic, monitorCharacteristic } from "./DeviceUtils";

export enum BTDeviceState {
  Ok,
  BrieflyGone,
  ExtendedGone,
  Disconnected,
}

export interface PowerRecipient {
  notifyPower(tmNow:number, watts:number):void;
}
export interface CadenceRecipient {
  notifyCadence(tmNow:number, cadence:number):void;
}
export interface HrmRecipient {
  notifyHrm(tmNow:number, hrm:number):void;
}
export interface SlopeSource {
  getLastSlopeInWholePercent():number;
}

export interface ConnectedDeviceInterface {
  disconnect():Promise<void>;
  getState():BTDeviceState;
  name():string;

  setPowerRecipient(who:PowerRecipient):void;
  setCadenceRecipient(who:CadenceRecipient):void;
  setHrmRecipient(who:HrmRecipient):void;
  setSlopeSource(who:SlopeSource):void;
  updateSlope(tmNow:number):void; // tell your device to update its slope
}

export abstract class PowerDataDistributor implements ConnectedDeviceInterface {
  private _powerOutput:PowerRecipient[] = [];
  private _cadenceOutput:CadenceRecipient[] = [];
  private _hrmOutput:HrmRecipient[] = [];
  protected _slopeSource:SlopeSource|null = null;

  abstract disconnect():Promise<void>;
  abstract getState():BTDeviceState;
  abstract name():string;
  abstract updateSlope(tmNow:number):void;

  public setPowerRecipient(who: PowerRecipient): void {
    this._powerOutput.push(who);
  }
  public setCadenceRecipient(who: CadenceRecipient): void {
    this._cadenceOutput.push(who);
  }
  public setHrmRecipient(who: HrmRecipient): void {
    this._hrmOutput.push(who);
  }
  public setSlopeSource(who: SlopeSource):void {
    this._slopeSource = who;
  }

  protected _notifyNewPower(tmNow:number, watts:number) :void {
    this._powerOutput.forEach((pwr) => {
      pwr.notifyPower(tmNow, watts);
    });
  }
  protected _notifyNewCadence(tmNow:number, cadence:number) :void {
    this._cadenceOutput.forEach((pwr) => {
      pwr.notifyCadence(tmNow, cadence);
    });
  }

}


abstract class BluetoothDeviceShared extends PowerDataDistributor {
  protected _gattDevice:BluetoothRemoteGATTServer;
  protected _state:BTDeviceState;

  public _startupPromise:Promise<any> = Promise.resolve();


  constructor(gattDevice:BluetoothRemoteGATTServer) {
    super();
    this._gattDevice = gattDevice;
    this._state = BTDeviceState.Disconnected;
  }
  disconnect(): Promise<void> {
    this._gattDevice.disconnect();
    return Promise.resolve();
  }
  getState(): BTDeviceState {
    return this._state;
  }
  name(): string {
    return this._gattDevice.device.name || "Unknown";
  }
  abstract hasPower(): boolean;
  abstract hasCadence(): boolean;
  abstract hasHrm(): boolean;

}

export class BluetoothFtmsDevice extends BluetoothDeviceShared {
  _hasSeenCadence: boolean = false;

  constructor(gattDevice:BluetoothRemoteGATTServer) {
    super(gattDevice);

    this._startupPromise = this._startupPromise.then(() => {
      // need to start up property monitoring for ftms

      const fnIndoorBikeData = (evt:any) => { this._decodeIndoorBikeData(evt.target.value)};
      return monitorCharacteristic(gattDevice, 'fitness_machine', 'indoor_bike_data', fnIndoorBikeData).then(() => {

        const fnFtmsStatus = (evt:any) => { this._decodeFitnessMachineStatus(evt.target.value)};
        return monitorCharacteristic(gattDevice, 'fitness_machine', 'fitness_machine_status', fnFtmsStatus);
      }).then(() => {
        const fnFtmsControlPoint = (evt:any) => { this._decodeFtmsControlPoint(evt.target.value)};
        return monitorCharacteristic(gattDevice, 'fitness_machine', 'fitness_machine_control_point', fnFtmsControlPoint);
      }).then(() => {
        const charOut = new DataView(new ArrayBuffer(1));
        charOut.setUint8(0, 0); // request control
    
        return writeToCharacteristic(gattDevice, 'fitness_machine', 'fitness_machine_control_point', charOut);
      });
    })
  }

  _tmLastSlopeUpdate:number = 0;
  updateSlope(tmNow:number):void {
    // this is not a trainer, but we don't want to force all the powermeters and hrms to implement this method.
    if(!this._slopeSource) {
      return;
    }

    const dtMs = tmNow - this._tmLastSlopeUpdate;
    if(dtMs < 500) {
      return; // don't update the ftms device too often
    }
    this._tmLastSlopeUpdate = tmNow;

    const slopeInWholePercent = this._slopeSource.getLastSlopeInWholePercent();
    const charOut = new DataView(new ArrayBuffer(20));
    charOut.setUint8(0, 0x11); // setIndoorBikesimParams

    // the actual object looks like:
    // typedef struct
    // {
    //   int16_t windMmPerSec;
    //   int16_t gradeHundredths;
    //   uint8_t crrTenThousandths;
    //   uint8_t windResistanceCoefficientHundredths; // in "kilograms per meter"
    // } INDOORBIKESIMPARAMS;
    charOut.setInt16(1, 0, true);
    charOut.setInt16(3, slopeInWholePercent*100, true);
    charOut.setUint8(5, 33);
    charOut.setUint8(6, 0);

    writeToCharacteristic(this._gattDevice, 'fitness_machine', 'fitness_machine_control_point', charOut);
  }
  
  hasPower(): boolean {
    return true;
  }
  hasCadence(): boolean {
    return this._hasSeenCadence;
  }
  hasHrm():boolean {
    return false;
  }
  _decodeFtmsControlPoint(dataView:DataView):any {
    // we're mainly just looking for the "control not permitted" response so we can re-request control
    if(dataView.getUint8(0) === 0x80) {
      // this is a response
      if(dataView.getUint8(2) === 0x5) {
        // this says "control not permitted"
        const dvTakeControl:DataView = new DataView(new ArrayBuffer(1));
        dvTakeControl.setUint8(0, 0);
        console.log("taking control");
        return writeToCharacteristic(this._gattDevice, 'fitness_machine', 'fitness_machine_control_point', dvTakeControl);
      }
    }
  }
  _decodeIndoorBikeData(dataView:DataView) {

    const tmNow = new Date().getTime();
    const update:any = {};

    const flags = dataView.getUint16(0, true);
    
    const MORE_DATA = 1<<0;
    const AVERAGE_SPEED = 1<<1;
    const INSTANT_CADENCE = 1<<2;
    const AVERAGE_CADENCE = 1<<3;
    const TOTALDISTANCE = 1<<4;
    const RESISTANCELEVEL = 1<<5;
    const INSTANT_POWER = 1<<6;
    const AVERAGE_POWER = 1<<7;
    const EXPENDED_ENERGY = 1<<8;
    const HEART_RATE = 1<<9;
    
    let pos = 2;
    if(!(flags & MORE_DATA)) {
      const kph100 = dataView.getUint16(pos, true);
      pos += 2;

      update.lastSpeedKph = kph100 / 100;
    }
    if(flags & AVERAGE_SPEED) {
      pos += 2; // we don't care about this, so we'll just skip the bytes
    }

    if(flags & INSTANT_CADENCE) {
      const cadence2 = dataView.getUint16(pos, true);
      pos += 2;
      this._notifyNewCadence(tmNow, cadence2 / 2);
      this._hasSeenCadence = true;
    }
    

    if(flags & AVERAGE_CADENCE) {
      pos += 2;
    }

    if(flags & TOTALDISTANCE) {
      pos += 3;
    }

    if(flags & RESISTANCELEVEL) {
      pos += 2;
    }

    if(flags & INSTANT_POWER) {
      const power = dataView.getInt16(pos, true);
      pos += 2;
      this._notifyNewPower(tmNow, power);
    }

    if(flags & AVERAGE_POWER) {
      pos += 2;
    }


  }
  _decodeFitnessMachineStatus(value:DataView) {
  }
}


export class BluetoothCpsDevice extends BluetoothDeviceShared {
  updateSlope(tmNow: number): void {
    // powermeters don't have slope adjustment, dummy!
  }
  _hasSeenCadence: boolean = false;

  constructor(gattDevice:BluetoothRemoteGATTServer) {
    super(gattDevice);

    this._startupPromise = this._startupPromise.then(() => {
      // need to start up property monitoring for ftms

      return monitorCharacteristic(gattDevice, 'cycling_power', 'cycling_power_measurement', (evt:any) => this.onPowerMeasurementChanged(evt.target.value));
    })
  }

  onPowerMeasurementChanged(buf:DataView) {
    const tmNow = new Date().getTime();
    const flags = buf.getUint16(0);
    const power = buf.getInt16(2, true);

    console.log('power device sez ', power);
    this._notifyNewPower(tmNow, power);

  }

  hasPower(): boolean {
    return true;
  }
  hasCadence(): boolean {
    return this._hasSeenCadence;
  }
  hasHrm():boolean {
    return false;
  }
}
