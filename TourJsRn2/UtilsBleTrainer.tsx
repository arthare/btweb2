import { BleError, Characteristic, Device } from "react-native-ble-plx";
import { TrainerMode, TrainerSensorReading } from "./ComponentPlayerSetup";
import { DeviceContext } from "./UtilsBle";
import { LoadedBleDevice, LoadedDevice, LoadedFakeDevice, UUID_FTMS_CONTROLPOINT, UUID_FTMS_INDOORBIKEDATA, UUID_FTMS_MACHINESTATUS, UUID_FTMS_SERVICE } from "./UtilsBleBase";
import { Buffer } from 'buffer';

export interface TrainerControls {
  setTargetWatts(watts:number):void;
}

export class LoadedFakeTrainer extends LoadedFakeDevice implements TrainerControls {
  trainerSensorData:TrainerSensorReading;

  constructor(deviceContext:DeviceContext) {
    super(deviceContext);
    this.trainerSensorData = new TrainerSensorReading(0);
  }

  setTargetWatts(watts: number): void {
    this.trainerSensorData.lastErg = watts;
    this.trainerSensorData.lastMode = TrainerMode.Erg;
  }
  name(): string {
    return "Fake:Trainer";
  }
  _report(): void {
    switch(this.trainerSensorData.lastMode) {
      case TrainerMode.Erg:
        this.deviceContext.notifyPower(Math.max(0, Math.random()*30 + this.trainerSensorData.lastErg - 15));
        break;
      default:
        this.deviceContext.notifyPower(Math.random()*30 + 100);
        break;
    }
    this.deviceContext.notifyTrainer(this.trainerSensorData);
  }

}


export abstract class LoadedBleTrainer extends LoadedBleDevice implements TrainerControls {
  constructor(ctx:DeviceContext, device:Device) {
    super(ctx, device);
  }
  abstract setTargetWatts(watts: number): void;
  connect(): Promise<Device> {
    return this.bleDevice.isConnected().then((isConnected) => {
      let promConnect = isConnected ? Promise.resolve(this.bleDevice) : this.bleDevice.connect();
      return promConnect;
    });
  }
}

export class LoadedTrainerFtms extends LoadedBleTrainer {

  indoorBikeData:Characteristic|null = null;
  ftmsStatus:Characteristic|null = null;
  ftmsControlPoint:Characteristic|null = null;

  trainerSensorData:TrainerSensorReading;

  tmLast:number = 0;
  writeInProgress:Promise<any>|null = null;

  constructor(ctx:DeviceContext, device:Device) {
    super(ctx, device);
    this.trainerSensorData = new TrainerSensorReading(0);
  }

  onIndoorBike(err:BleError|null, char:Characteristic|null) {
    this.deviceContext.notifyAnyMessage(this);
    
    const base64Value = char?.value;
    if(base64Value) {
      const buf = Buffer.from(base64Value, 'base64');
      console.log("onIndoorBike ", buf);

      const update:any = {};

      const flags = buf.readUInt16LE(0);
      
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
        const kph100 = buf.readUInt16LE(pos);
        pos += 2;

        update.lastSpeedKph = kph100 / 100;
      }
      if(flags & AVERAGE_SPEED) {
        pos += 2; // we don't care about this, so we'll just skip the bytes
      }

      if(flags & INSTANT_CADENCE) {
        const cadence2 = buf.readUInt16LE(pos);
        pos += 2;
        this.deviceContext.notifyCadence(cadence2 / 2);
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
        const power = buf.readUInt16LE(pos);
        pos += 2;
        this.deviceContext.notifyPower(power);
        this.trainerSensorData.value = power;
        this.deviceContext.notifyTrainer(this.trainerSensorData);
      }

      if(flags & AVERAGE_POWER) {
        pos += 2;
      }

      this._emitSensorData();
    }
  }
  onFtmsStatus(err:BleError|null, char:Characteristic|null) {
    this.deviceContext.notifyAnyMessage(this);
    const base64Value = char?.value;
    console.log("onFtmsStatus ", base64Value);
    if(base64Value) {
      const buf = Buffer.from(base64Value, 'base64');
      console.log("onFtmsStatus ", buf);
    }
  }


  onFtmsControlPoint(err:BleError|null, char:Characteristic|null) {
    this.deviceContext.notifyAnyMessage(this);
    const base64Value = char?.value;
    if(base64Value) {
      const buf = Buffer.from(base64Value, 'base64');
      console.log("onFtmsControlPoint ", buf);
      if(buf.readUInt8(0) === 0x80) {
        // this is a response
        const responseToWhat = buf.readUInt8(1);
        switch(responseToWhat) {
          case 0:
            // take control
            if(buf.readUInt8(2) === 0x5) {
              // this says "control not permitted"
              console.log("trying again to take control of ftms control point");
              return this._takeControl();
            }
            break;
          case 5: // set erg mode
            if(buf.readUInt8(2) === 0x1) {
              console.log("set erg mode successful");
            } else {
              console.log("set erg mode not successful because " + buf.readUInt8(2));
            }
            break;
          default:
            if(buf.readUInt8(2) === 0x2) {
              debugger; // this is ble for "invalid op code"
            }
            break;
        }
      }
    }
  }

  connect(): Promise<any> {
    return super.connect().then((dev:Device) => {
      return dev.discoverAllServicesAndCharacteristics().then(() => {
        return dev.services().then((servs) => {
          const ftms = servs.find((s) => s.uuid === UUID_FTMS_SERVICE);
          if(ftms) {
            // woohoo, ftms!
            return ftms.characteristics().then((chars) => {
              console.log(chars);
              this.indoorBikeData = chars.find((char) => char.uuid === UUID_FTMS_INDOORBIKEDATA) || null;
              this.ftmsStatus = chars.find((char) => char.uuid === UUID_FTMS_MACHINESTATUS) || null;
              this.ftmsControlPoint = chars.find((char) => char.uuid === UUID_FTMS_CONTROLPOINT) || null;

              if(this.indoorBikeData &&
                 this.ftmsStatus &&
                 this.ftmsControlPoint) {

                // whoa!  all found and connected
                console.log("all trainer components connected");
                this.addSub(this.indoorBikeData.monitor((err, indoorBikeData) => this.onIndoorBike(err, indoorBikeData)));
                this.addSub(this.ftmsStatus.monitor((err, ftmsStatus) => this.onFtmsStatus(err, ftmsStatus)));
                this.addSub(this.ftmsControlPoint.monitor((err, ftmsControlPoint) => this.onFtmsControlPoint(err, ftmsControlPoint)));


                return this._takeControl().then(() => {
                  return this.bleDevice;
                })

              } else {
                throw new Error(`Failed to find one of indoorbikedata ${!!this.indoorBikeData}, ftmsStatus ${!!this.ftmsStatus}, or ftmsControlPoint ${!!this.ftmsControlPoint}`);
              }
            })
          } else {
            throw new Error("Failed to find FTMS");
          }
        })
      })
    })
  }

  setTargetWatts(watts:number) {
    if(!this.ftmsControlPoint) {
      throw new Error(`ftms control point not connected.  Erg target of ${watts} not written`)
    }

    const tmNow = new Date().getTime();
    if(tmNow - this.tmLast < 250 || this.writeInProgress) {
      // too soon
      return;
    }
    this.tmLast = tmNow;

    const bufOut = Buffer.alloc(3);
    bufOut.writeUInt8(5, 0); // setTargetPower
    bufOut.writeUInt16LE(watts, 1); // setTargetPower

    return this.writeInProgress = this.ftmsControlPoint?.writeWithResponse(bufOut.toString('base64')).then(() => {
      this.trainerSensorData.lastMode = TrainerMode.Erg;
      this.trainerSensorData.lastErg = watts;
      this._emitSensorData();
      console.log(`wrote erg target of ${watts.toFixed(0)}W`);
    }).finally(() => {
      this.writeInProgress = null;
    })
  }

  
  //////////////////////////////////////////////
  //////////////////////////////////////////////
  //////////////////////////////////////////////
  //////////////////////////////////////////////
  // private bits
  private _emitSensorData() {
    this.trainerSensorData.tm = new Date().getTime();
    this.deviceContext.notifyTrainer(this.trainerSensorData);
  }
  private _takeControl() {
    // we need to request control of the trainer
    if(!this.ftmsControlPoint) {
      throw new Error("Tried to take control, but aren't connected");
    }
    const takeControl = Buffer.alloc(1);
    takeControl.writeUInt8(0, 0);
    return this.ftmsControlPoint?.writeWithResponse(takeControl.toString('base64')).then(() => {
      console.log("took control of trainer");
      return this.bleDevice;
    })
  }
}