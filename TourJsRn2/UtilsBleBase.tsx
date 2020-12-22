import { Device, Subscription } from "react-native-ble-plx";
import { DeviceContext } from "./UtilsBle";

export const UUID_CPS_SERVICE = '00001818-0000-1000-8000-00805f9b34fb';
export const UUID_CPS_MEASURE_CHAR = '00002a63-0000-1000-8000-00805f9b34fb';

export const UUID_FTMS_SERVICE = '';
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
  notifyAnyMessage:(srcDevice:Device)=>void;
  notifyPower:(watts:number)=>void;
  notifyHrm:(bpm:number)=>void;
}

export abstract class LoadedDevice {
  deviceContext:DataNotifyRecipient;
  bleDevice:Device;
  private subscribers:Subscription[] = [];

  constructor(deviceContext:DataNotifyRecipient, device:Device) {
    this.deviceContext = deviceContext;
    this.bleDevice = device;
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

  abstract connect():Promise<any>;
}
