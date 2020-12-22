import { EventEmitter } from "events";
import { BleError, BleManager, Characteristic, Device, Subscription } from "react-native-ble-plx";
import { DataNotifyRecipient, LoadedDevice } from "./UtilsBleBase";
import { LoadedHrm } from "./UtilsBleHrm";
import { LoadedPm } from "./UtilsBlePm";



export class DeviceContext implements DataNotifyRecipient {

  pmDevice:LoadedDevice|null = null;
  trainerDevice:LoadedDevice|null = null;
  hrmDevice:LoadedDevice|null = null;

  private _emitter:EventEmitter = new EventEmitter();

  powerTimeout:any = null;
  hrmTimeout:any = null;

  constructor() {
  }

  get emitter():EventEmitter {return this._emitter;}

  setPowermeter(device:Device) {

    let shutdownPromise:Promise<any> = Promise.resolve();
    if(this.pmDevice) {
      shutdownPromise = this.pmDevice.close();
    }

    return shutdownPromise.then(() => {
      this.pmDevice = new LoadedPm(this, device);
      return this.pmDevice.connect();
    })
  }
  setTrainer(device:Device) {
    console.log("not done yet!");
  }
  setHrm(device:Device) {

    let shutdownPromise:Promise<any> = Promise.resolve();
    if(this.hrmDevice) {
      shutdownPromise = this.hrmDevice.close();
    }

    return shutdownPromise.then(() => {
      this.hrmDevice = new LoadedHrm(this, device);
      return this.hrmDevice.connect();
    })
  }

  notifyPower(watts:number) {
    this.emitter.emit('power', watts);

    // if we haven't gotten a new power reading since 
    clearTimeout(this.powerTimeout);
    this.powerTimeout = setTimeout(() => {
      this.emitter.emit('power', -1);
    }, 5000);
  }
  notifyHrm(bpm:number) {
    this.emitter.emit('hrm', bpm);
    
    clearTimeout(this.hrmTimeout);
    this.hrmTimeout = setTimeout(() => {
      this.emitter.emit('hrm', -1);
    }, 10000);
  }
  notifyAnyMessage(srcDevice:Device) {
    // this is intended _mostly_ as a debug helper.
    // when doing react development, I find that after a hot reload we'll still be notifying and shit from the devices connected
    // on the last app run.  So if I say "hey now, you're not supposed to be connected" and kill those devices, that'll let development
    // proceed without having to kill/restart the app each time... hopefully.
    const possibleHosts = [this.pmDevice, this.trainerDevice, this.hrmDevice];
    const isHosted = possibleHosts.find((host) => host && host.bleDevice.id === srcDevice.id);
    if(isHosted) {
      // this message is allowed and expected
    } else {
      console.log("we received a message from ", srcDevice.name, ", but didn't want it");
      srcDevice.cancelConnection();
    }
  }
}