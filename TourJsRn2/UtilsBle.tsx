import { EventEmitter } from "events";
import { BleError, BleManager, Characteristic, Device, Subscription } from "react-native-ble-plx";
import { assert2 } from "./common/Utils";
import { PlayerSetup, SensorReading, TrainerSensorReading } from "./ComponentPlayerSetup";
import { DataNotifyRecipient, LoadedDevice, LoadedFakeDevice, UUID_FTMS_SERVICE, UUID_KICKR_SERVICE } from "./UtilsBleBase";
import { LoadedHrm } from "./UtilsBleHrm";
import { LoadedPm } from "./UtilsBlePm";
import { LoadedBleTrainer, LoadedTrainerFtms, TrainerControls } from "./UtilsBleTrainer";

interface DeviceContextHandlersEventMap {
  // this is how we get nicely typed addEventListener and removeEventListener
  // see: https://stackoverflow.com/questions/55092588/typescript-addeventlistener-set-event-type
  "power": SensorReading;
  "trainer": TrainerSensorReading|null;
  "hrm": SensorReading;
  "cadence": SensorReading;
}

//class DeviceContextEvent

function buildTrainerDevice(ctx:DeviceContext, device:Device):Promise<LoadedBleTrainer> {
  return device.connect().then((connectedDevice) => {
    return device.discoverAllServicesAndCharacteristics().then(() => {
      return device.services().then((services) => {
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

  setFakePowermeter(dev:LoadedFakeDevice) {
    this.pmDevice = dev;
    return this.pmDevice.connect();
  }
  setFakeHrm(dev:LoadedFakeDevice) {
    this.hrmDevice = dev;
    return this.hrmDevice.connect();
  }
  setFakeTrainer(dev:LoadedFakeDevice) {
    this.trainerDevice = dev;
    this.trainerControls = dev as unknown as TrainerControls;
    return this.trainerDevice.connect();
  }

  setTrainer(device:Device) {
    let shutdownPromise:Promise<any> = Promise.resolve();
    if(this.trainerDevice) {
      shutdownPromise = this.trainerDevice.close();
    }

    return shutdownPromise.then(() => {
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
    })
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


  setTargetWatts(watts:number) {
    if(this.trainerControls) {
      this.trainerControls.setTargetWatts(watts);
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
    }
    // if we haven't gotten a new power reading since 
    clearTimeout(this.powerTimeout);
    this.powerTimeout = setTimeout(() => {
      this.emit('power', new SensorReading(-1));
    }, 5000);
  }
  notifyTrainer(trainer:TrainerSensorReading) {
    trainer.tm = new Date().getTime();
    this.emit('trainer', trainer);
    clearTimeout(this.trainerTimeout);
    this.trainerTimeout = setTimeout(() => {
      this.emit('trainer', null);
    }, 5000);

  }
  notifyHrm(bpm:number) {
    this.emit('hrm', new SensorReading(bpm));
    
    if(this.playerSetup) {
      const tmNow = new Date().getTime();
      this.playerSetup.getLocalUser().notifyHrm(tmNow, bpm);
      this.playerSetup.updateLocalUserHistory(tmNow);
    }

    clearTimeout(this.hrmTimeout);
    this.hrmTimeout = setTimeout(() => {
      this.emit('hrm', new SensorReading(-1));
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
}