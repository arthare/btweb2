import { ConnectedDeviceInterface, BTDeviceState, PowerDataDistributor, PowerRecipient, CadenceRecipient, HrmRecipient, BluetoothFtmsDevice, BluetoothCpsDevice } from "./WebBluetoothDevice";
import { getFtms, monitorCharacteristic, writeToCharacteristic, getCps } from "./DeviceUtils";

export interface DeviceFactory {
    findPowermeter():Promise<ConnectedDeviceInterface>;
    findHrm():Promise<ConnectedDeviceInterface>;
    findCadence():Promise<ConnectedDeviceInterface>;
    findTrainer():Promise<ConnectedDeviceInterface>;
}

export class TestPowermeter extends PowerDataDistributor {
    _interval:any = null;

    constructor() {
        super();
        this._interval = setInterval(() => {
            const tmNow = new Date().getTime();
            this._notifyNewPower(tmNow, Math.random() * 50 + 200);
        }, 500);
    }

    disconnect(): Promise<void> {
        clearInterval(this._interval);
        this._interval = null;
        return Promise.resolve();
    }
    getState(): BTDeviceState {
        return BTDeviceState.Ok;
    }
    name(): string {
        return "Test Powermeter";
    }
    hasPower(): boolean {
        return true;
    }
    hasCadence(): boolean {
        return false;
    }
    hasHrm(): boolean {
        return false;
    }
    updateSlope(tmNow:number): void {
      return;
    }
}

class TestDeviceFactory implements DeviceFactory {
    findPowermeter():Promise<ConnectedDeviceInterface>{

      const filters = {
        filters: [
          {services: ['cycling_power']},
          {services: ['fitness_machine']},
        ]
      }
      return navigator.bluetooth.requestDevice(filters).then((device) => {
        if(device.gatt) {
          return device.gatt.connect();
        } else {
          throw new Error("No device gatt?");
        }
      }).then((gattServer) => {
        return gattServer.getPrimaryServices().then((services) => {
          const ftms = getFtms(services);
          const cps = getCps(services);

          if(ftms) {
            return new BluetoothFtmsDevice(gattServer);
          } else if(cps) {
            return new BluetoothCpsDevice(gattServer);
          } else {
            throw new Error("We don't recognize what kind of device this is");
          }
        })
      });
    }
    findHrm():Promise<ConnectedDeviceInterface> {
        throw new Error("Test HRM not implemented");
    }
    findCadence():Promise<ConnectedDeviceInterface>{
        throw new Error("Test Cadence not implemented");
    }
    findTrainer():Promise<ConnectedDeviceInterface>{
        throw new Error("Test Trainer not implemented");
    }
}

const g_deviceFactory:DeviceFactory = new TestDeviceFactory();
export function getDeviceFactory():DeviceFactory {
    return g_deviceFactory;
}