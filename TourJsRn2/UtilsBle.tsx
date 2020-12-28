import { EventEmitter } from "events";
import { BleError, BleManager, Characteristic, Device, Subscription } from "react-native-ble-plx";
import { assert2 } from "./common/Utils";
import { PlayerSetup, SensorReading, TrainerSensorReading } from "./ComponentPlayerSetup";
import { DataNotifyRecipient, LoadedDevice, LoadedFakeDevice, UUID_FTMS_SERVICE, UUID_KICKR_SERVICE } from "./UtilsBleBase";
import { LoadedHrm } from "./UtilsBleHrm";
import { LoadedPm } from "./UtilsBlePm";
import { LoadedBleTrainer, LoadedTrainerFtms, TrainerControls } from "./UtilsBleTrainer";

export type WhichStatus = "pmStatus"|"hrmStatus"|"trainerStatus";

export const STATUS_UNUSED = 0x01; // unused means this device has never been set up
export const STATUS_CONNECTING = 0x02; // connecting means we're attempting to connect over BLE
export const STATUS_CONNECTED = 0x04; // connected means we think we're connected over BLE
export const STATUS_HEALTHY = 0x08; // healthy means a device that has had new valid information recently
export const STATUS_DISCONNECTED = 0x10; // disconnected means a BLE device that explicitly told us it is disconnected
export const STATUS_UNHEALTHY = 0x20; // unhealthy means overdue, late, suspiciously slow.  probably means device has disconnected

interface DeviceContextHandlersEventMap {
  // this is how we get nicely typed addEventListener and removeEventListener
  // see: https://stackoverflow.com/questions/55092588/typescript-addeventlistener-set-event-type
  "power": SensorReading;
  "trainer": TrainerSensorReading|null;
  "hrm": SensorReading;
  "cadence": SensorReading;
  "change": WhichStatus; // lets you know something about our general state changed, like a device disconnecting or something
}

//class DeviceContextEvent

function buildTrainerDevice(ctx:DeviceContext, device:Device, retriesRemaining=3):Promise<LoadedBleTrainer> {

  return device.connect().then((connectedDevice) => {
    return device.discoverAllServicesAndCharacteristics().then(() => {
      return device.services().then((services) => {
        if(services.length <= 0) {
          throw new Error("No services found");
        }
        console.log("trying to figure out what kind of service");
        const ftms = services.find((serv) => serv.uuid === UUID_FTMS_SERVICE);
        const kickr = services.find((serv) => serv.uuid === UUID_KICKR_SERVICE);

        
        if(kickr) {
          // we found a wahoo kickr.  yay?
          throw new Error("Kickr not supported yet");
        } else if(ftms) {
          return new LoadedTrainerFtms(ctx, device);
        } else {
          debugger;
          throw new Error("Unrecognized Trainer");
        }
      })
    })
  }).catch(() => {
    if(retriesRemaining > 0) {
      return device.cancelConnection().catch(() => {

      }).then(() => {
        return buildTrainerDevice(ctx, device, retriesRemaining - 1);
      })
    } else {
      throw new Error("Could not connect to device - retries exhausted");
    }
  })
}


let contextsMade = 0;
export class DeviceContext implements DataNotifyRecipient {

  static g_deviceContext:DeviceContext|null = null;
  static create():DeviceContext {
    return this.g_deviceContext || (this.g_deviceContext = new DeviceContext());
  }
  pmDevice:LoadedDevice|null = null;
  trainerDevice:LoadedDevice|null = null;
  trainerControls:TrainerControls|null = null;
  hrmDevice:LoadedDevice|null = null;

  // status flags
  trainerStatus:number = STATUS_UNUSED;
  hrmStatus:number = STATUS_UNUSED;
  pmStatus:number = STATUS_UNUSED;

  private _emitter:EventEmitter = new EventEmitter();

  powerTimeout:any = null;
  hrmTimeout:any = null;
  trainerTimeout:any = null;
  cadenceTimeout:any = null;

  playerSetup:PlayerSetup|null = null;

  id:number = -1;
  //addEventListener<K extends keyof DeviceContextHandlersEventMap>(type: K, listener: (this: Document, ev: DeviceContextHandlersEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  
  constructor() {
    this.id = contextsMade;
    contextsMade++;
    assert2(contextsMade === 1, "we should only ever make one device context, or else we got bugs");
  }

  setPlayerSetup(playerSetup:PlayerSetup) {
    this.playerSetup = playerSetup;
  }

  // see: https://stackoverflow.com/questions/55092588/typescript-addeventlistener-set-event-type
  addEventListener<K extends keyof DeviceContextHandlersEventMap>(type: K, listener: (this: DeviceContext, ev: DeviceContextHandlersEventMap[K]) => any): void {
    this._emitter.addListener(type, listener);
  }
  removeEventListener<K extends keyof DeviceContextHandlersEventMap>(type: K, listener: (this: DeviceContext, ev: DeviceContextHandlersEventMap[K]) => any): void {
    this._emitter.removeListener(type, listener);
  }
  emit<K extends keyof DeviceContextHandlersEventMap>(type: K, val: DeviceContextHandlersEventMap[K]): void {
    this._emitter.emit(type, val);
  }


  setFakePowermeter(dev:LoadedFakeDevice) {
    this.pmDevice = dev;
    return this._connectWithFlags(dev, 'pmStatus', this.pmDevice.connect)
  }
  setFakeHrm(dev:LoadedFakeDevice) {
    this.hrmDevice = dev;
    return this._connectWithFlags(dev, 'hrmStatus', this.hrmDevice.connect);
  }
  setFakeTrainer(dev:LoadedFakeDevice) {
    this.trainerDevice = dev;
    this.trainerControls = dev as unknown as TrainerControls;
    return this._connectWithFlags(dev, 'trainerStatus', this.trainerDevice.connect);
  }

  setPowermeter(device:Device) {

    return this._connectWithFlags(this, 'pmStatus', () => {
      let shutdownPromise:Promise<any> = Promise.resolve();
      if(this.pmDevice) {
        shutdownPromise = this.pmDevice.close();
      }
      return shutdownPromise.then(() => {
        this.pmDevice = new LoadedPm(this, device);
        return this.pmDevice.connect();
      })
    })
  }
  setTrainer(device:Device) {

    return this._connectWithFlags(this, 'trainerStatus', () => {
      let shutdownPromise:Promise<any> = Promise.resolve();
      if(this.trainerDevice) {
        console.log("we have set up trainerDevice.close()");
        shutdownPromise = this.trainerDevice.close().catch(() => {
          // this is fine I guess?
        });
      }

      return shutdownPromise.then(() => {
        console.log("done shutdown promise");
        return buildTrainerDevice(this, device).then((connectedDevice:LoadedBleTrainer) => {
          this.trainerDevice = connectedDevice;
          this.trainerControls = connectedDevice;
          if(this.trainerDevice) {
            return this.trainerDevice.connect().then(() => {
              // trainer is connected!  let's tell it to do erg mode
              return this.trainerControls?.setTargetWatts(50);
            })
          } else {
            throw new Error("Failed to build the trainer device");
          }
        })
      }).catch((fail) => {
        console.log("shutdown promise failed");
      })
    })
  }
  setHrm(device:Device) {

    return this._connectWithFlags(this, 'hrmStatus', () => {
      let shutdownPromise:Promise<any> = Promise.resolve();
      if(this.hrmDevice) {
        shutdownPromise = this.hrmDevice.close();
      }

      return shutdownPromise.then(() => {
        this.hrmDevice = new LoadedHrm(this, device);
        return this.hrmDevice.connect();
      })
    })
  }


  setTargetWatts(watts:number) {
    if(this.trainerControls) {
      this.trainerControls.setTargetWatts(watts);
    }
  }


  notifyDeviceDisconnection(dev:LoadedDevice):void {
    // hmmm, a device has disconnected!  what should we do about this?
    // first, let's figure out which one disconnected
    assert2(dev, "this should be non-null");
    if(this.trainerDevice === dev) {
      this._updateFlags('trainerStatus', STATUS_DISCONNECTED);
    }
    if(this.hrmDevice === dev) {
      this._updateFlags('hrmStatus', STATUS_DISCONNECTED);
    }
    if(this.pmDevice === dev) {
      this._updateFlags('pmStatus', STATUS_DISCONNECTED);
    }
  }
  notifyCadence(cadence: number):void {
    this.emit('cadence', new SensorReading(cadence));

    if(this.playerSetup) {
      this.playerSetup.getLocalUser().notifyCadence(new Date().getTime(), cadence);
    }
    // if we haven't gotten a new power reading since 
    clearTimeout(this.cadenceTimeout);
    this.cadenceTimeout = setTimeout(() => {
      this.emit('cadence', new SensorReading(-1));
    }, 5000);
  }
  notifyPower(watts:number) {
    this.emit('power', new SensorReading(watts));

    if(this.playerSetup) {
      const tmNow = new Date().getTime();
      this.playerSetup.getLocalUser().notifyPower(tmNow, watts);
      this.playerSetup.updateLocalUserHistory(tmNow);
      this._updateFlags('pmStatus', (this.pmStatus | STATUS_HEALTHY) & ~STATUS_UNHEALTHY);
    }
    // if we haven't gotten a new power reading since 
    clearTimeout(this.powerTimeout);
    this.powerTimeout = setTimeout(() => {
      this.emit('power', new SensorReading(-1));
      this._updateFlags('pmStatus', (this.pmStatus & (~STATUS_HEALTHY)) | STATUS_UNHEALTHY);
    }, 5000);
  }
  notifyTrainer(trainer:TrainerSensorReading) {
    trainer.tm = new Date().getTime();
    this.emit('trainer', trainer);
    this._updateFlags('trainerStatus', (this.trainerStatus | STATUS_HEALTHY) & ~STATUS_UNHEALTHY);
    clearTimeout(this.trainerTimeout);
    this.trainerTimeout = setTimeout(() => {
      this.emit('trainer', null);
      this._updateFlags('trainerStatus', (this.trainerStatus & (~STATUS_HEALTHY)) | STATUS_UNHEALTHY);
    }, 5000);

  }
  notifyHrm(bpm:number) {
    this.emit('hrm', new SensorReading(bpm));
    
    if(this.playerSetup) {
      const tmNow = new Date().getTime();
      this.playerSetup.getLocalUser().notifyHrm(tmNow, bpm);
      this.playerSetup.updateLocalUserHistory(tmNow);
      this._updateFlags('hrmStatus', (this.hrmStatus | STATUS_HEALTHY) & STATUS_UNHEALTHY);
    }

    clearTimeout(this.hrmTimeout);
    this.hrmTimeout = setTimeout(() => {
      this.emit('hrm', new SensorReading(-1));
      this._updateFlags('hrmStatus', (this.hrmStatus & (~STATUS_HEALTHY)) | STATUS_UNHEALTHY);
    }, 10000);
  }
  notifyAnyMessage(srcDevice:LoadedDevice) {
    // this is intended _mostly_ as a debug helper.
    // when doing react development, I find that after a hot reload we'll still be notifying and shit from the devices connected
    // on the last app run.  So if I say "hey now, you're not supposed to be connected" and kill those devices, that'll let development
    // proceed without having to kill/restart the app each time... hopefully.

    const possibleHosts = [this.pmDevice, this.trainerDevice, this.hrmDevice];
    const isHosted = possibleHosts.find((host) => host && host === srcDevice);
    if(isHosted) {
      // this message is allowed and expected
    } else {
      console.log("we received a message from ", srcDevice.name, ", but didn't want it");
      srcDevice.close();
    }
  }

  getDeviceFlags(which:WhichStatus) {
    const ret = this[which];
    return ret;
  }
  
  private _updateFlags(key:WhichStatus, newValue:number) {
    this[key] = newValue;
    this.emit('change', key);
  }
  private _connectWithFlags(thisArg:any, key:WhichStatus, fnConnect:()=>Promise<any>) {
    this._updateFlags(key, STATUS_CONNECTING);
    return fnConnect.apply(thisArg).finally(() => {
      this._updateFlags(key, STATUS_CONNECTED);
    })
  }
}