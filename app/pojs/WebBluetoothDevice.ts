
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

export interface ConnectedDeviceInterface {
  disconnect():Promise<void>;
  getState():BTDeviceState;
  name():string;

  hasPower():boolean;
  hasCadence():boolean;
  hasHrm():boolean;

  setPowerRecipient(who:PowerRecipient):void;
  setCadenceRecipient(who:CadenceRecipient):void;
  setHrmRecipient(who:HrmRecipient):void;
}

export abstract class PowerDataDistributor implements ConnectedDeviceInterface {
  private _powerOutput:PowerRecipient[] = [];
  private _cadenceOutput:CadenceRecipient[] = [];
  private _hrmOutput:HrmRecipient[] = [];

  abstract disconnect():Promise<void>;
  abstract getState():BTDeviceState;
  abstract name():string;

  abstract hasPower():boolean;
  abstract hasCadence():boolean;
  abstract hasHrm():boolean;

  public setPowerRecipient(who: PowerRecipient): void {
    this._powerOutput.push(who);
  }
  public setCadenceRecipient(who: CadenceRecipient): void {
    this._cadenceOutput.push(who);
  }
  public setHrmRecipient(who: HrmRecipient): void {
    this._hrmOutput.push(who);
  }

  protected _notifyNewPower(tmNow:number, watts:number) :void {
    this._powerOutput.forEach((pwr) => {
      pwr.notifyPower(tmNow, watts);
    });
  }
}

export abstract class WebBluetoothDevice extends PowerDataDistributor {
  gattDevice:BluetoothDevice;


  constructor(gattDevice:BluetoothDevice) {
    super();
    this.gattDevice = gattDevice;
  }
  connect() : Promise<BluetoothRemoteGATTServer> {
    if(this.gattDevice.gatt) {
      return this.gattDevice.gatt.connect();
    } else {
      throw new Error("No Gatt Device");
    }
  }
  disconnect(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getState(): BTDeviceState {
    throw new Error("Method not implemented.");
  }
  name(): string {
    throw new Error("Method not implemented.");
  }
  abstract hasPower():boolean;
  abstract hasCadence():boolean;
  abstract hasHrm():boolean;
}

export class PowermeterDevice extends WebBluetoothDevice {
  constructor(gattDevice:BluetoothDevice) {
    super(gattDevice);
  }
  connect():Promise<BluetoothRemoteGATTServer> {
    return super.connect().then((server:BluetoothRemoteGATTServer) => {
      // alright, so they claim this is a powermeter.  Let's grab cycling power service and get it hooked up

      return server.getPrimaryService('cycling_power').then((cps) => {
        // hooray, cps!
        return cps.getCharacteristic('cycling_power_measurement').then((cpm) => {
          cpm.addEventListener('characteristicvaluechanged', (evt:any) => {
            if(evt && evt.target) {
              return this._parseCpmEvent(evt.target.value);
            }
          })
        })
      }).then(() => {
        return server;
      })
    })
  }
  hasPower():boolean {
      return true;
  }
  hasCadence():boolean {
      return true;
  }
  hasHrm():boolean {
      return false;
  }

  _parseCpmEvent(buf:DataView) {
    debugger; // todo: finish me
  }
}