import { BleError, Device, Subscription } from "react-native-ble-plx";
import { TrainerSensorReading } from "./ComponentPlayerSetup";
import { DeviceContext } from "./UtilsBle";

export const UUID_CPS_SERVICE = '00001818-0000-1000-8000-00805f9b34fb';
export const UUID_CPS_MEASURE_CHAR = '00002a63-0000-1000-8000-00805f9b34fb';

export const UUID_KICKR_SERVICE = 'a026ee01-0a7d-4ab3-97fa-f1500f9feb8b';

export const UUID_FTMS_SERVICE = '00001826-0000-1000-8000-00805f9b34fb';
export const UUID_FTMS_FMF = '00002acc-0000-1000-8000-00805f9b34fb';
export const UUID_FTMS_INDOORBIKEDATA = '00002ad2-0000-1000-8000-00805f9b34fb';
export const UUID_FTMS_CONTROLPOINT = '00002ad9-0000-1000-8000-00805f9b34fb'
export const UUID_FTMS_SUPPORTEDPOWERRANGE = '00002ad8-0000-1000-8000-00805f9b34fb'
export const UUID_FTMS_RESISTANCELEVELRANGE = '00002ad6-0000-1000-8000-00805f9b34fb'
export const UUID_FTMS_MACHINESTATUS = '00002ada-0000-1000-8000-00805f9b34fb'
export const UUID_HRM_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
export const UUID_HRM_MEASURE_CHAR = '00002a37-0000-1000-8000-00805f9b34fb';


export function isPowermeter(uuid:string) {
  return uuid.includes('1818');
}
export function isTrainer(uuid:string) {
  return uuid.includes('1826');
}
export function isHrm(uuid:string) {
  return uuid.toLowerCase().includes('180d');
}

export interface DataNotifyRecipient {
  notifyAnyMessage:(srcDevice:LoadedDevice)=>void;
  notifyPower:(watts:number)=>void;
  notifyTrainer:(trainer:TrainerSensorReading)=>void;
  notifyHrm:(bpm:number)=>void;
  notifyCadence:(cadence:number)=>void;
  notifyDeviceDisconnection:(device:LoadedDevice)=>void;
}

export abstract class LoadedDevice {
  deviceContext:DataNotifyRecipient;
  constructor(deviceContext:DataNotifyRecipient) {
    this.deviceContext = deviceContext;
  }
  abstract close():Promise<any>;
  abstract connect():Promise<any>;
  abstract name():string;
}

export abstract class LoadedFakeDevice extends LoadedDevice {

  private _timeout:any;

  constructor(deviceContext:DataNotifyRecipient) {
    super(deviceContext);
    this._timeout = null;
  }
  connect(): Promise<any> {
    this._timeout = setTimeout(() => this._reportTimer(), 750);
    return Promise.resolve();
  }
  close(): Promise<any> {
    clearTimeout(this._timeout);
    this._timeout = null;
    return Promise.resolve();
  }
  _reportTimer() {
    this._report();

    if(this._timeout) {
      this._timeout = setTimeout(() => this._reportTimer(), 750);
    }
  }
  abstract _report():void
}

export abstract class LoadedBleDevice extends LoadedDevice {
  bleDevice:Device;
  private subscribers:Subscription[] = [];

  constructor(deviceContext:DataNotifyRecipient, device:Device) {
    super(deviceContext);
    this.deviceContext = deviceContext;
    this.bleDevice = device;

    this.bleDevice.onDisconnected((bleError:BleError | null, device:Device) => {
      this.deviceContext.notifyDeviceDisconnection(this);
    })
  }

  close() {
    this.subscribers.forEach((sub) => {
      sub.remove();
    });
    this.subscribers = [];
    return this.bleDevice.cancelConnection();
  }

  protected addSub(sub:Subscription) {
    this.subscribers.push(sub);
  }

  name():string {
    return this.bleDevice && this.bleDevice.name || "Unknown device ";
  }
}
