import { ConnectedDeviceInterface, BTDeviceState, PowerDataDistributor, PowerRecipient, CadenceRecipient, HrmRecipient, BluetoothFtmsDevice, BluetoothCpsDevice, BluetoothKickrDevice } from "./WebBluetoothDevice";
import { getFtms, monitorCharacteristic, writeToCharacteristic, getCps, getKickrService, serviceUuids, deviceUtilsNotifyConnect } from "./DeviceUtils";
import { FakeDevice } from "bt-web2/application/controller";
import { PluginDescriptor, PluginToBrowserUpdate, BrowserToPluginUpdate, PluginMode } from "bt-web2/server-client-common/PluginCommunication";

export interface DeviceFactory {
    findPowermeter(byPlugin?:boolean):Promise<ConnectedDeviceInterface>;
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

    getDeviceTypeDescription():string {
      return "Fake Device";
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

class PluginDevice extends PowerDataDistributor {

  _descriptor:PluginDescriptor;
  _queryTimeout:any = null;
  _sendingSlope:boolean = false;

  constructor(descriptor:PluginDescriptor) {
    super();
    this._descriptor = descriptor;
    this._doQuery(true);
  }

  public getDeviceId():string {
    return "PluginDevice " + this._descriptor.pluginId;
  }
  private _doQuery(startup:boolean):Promise<any> {
    if(startup || this._queryTimeout !== null) {

      return fetch(`http://localhost:63939/power?id=${this._descriptor.pluginId}`).then(raw => raw.json()).then((pluginPower:PluginToBrowserUpdate) => {
        this._notifyNewPower(pluginPower.tmUpdate, pluginPower.lastPower);
      }).finally(() => {
        this._queryTimeout = setTimeout(() => {
          this._doQuery(false);
        }, 250);
      })
    } else {
      // they've shut us down, so don't do anything
      return Promise.resolve();
    }
  }

  getDeviceTypeDescription(): string {
    return this._descriptor.humanName;
  }
  disconnect(): Promise<void> {
    this._queryTimeout = null; // just stop querying
    return Promise.resolve();
  }
  getState(): BTDeviceState {
    return BTDeviceState.Ok;
  }
  name(): string {
    return this._descriptor.humanName;
  }
  updateSlope(tmNow: number): void {
    // we're not currently capable of this
    if(this._sendingSlope) {
      return; // let's not queue up a bunch of slope-sends
    }
    if(!this._descriptor.supportsSmartTrainer) {
      // we don't support a smart trainer!
      return;
    }
    if(!this._slopeSource) {
      // we don't have a slope source!
      return;
    }
    if(this._queryTimeout === null) {
      // we've been shut down/disconnected
      return;
    }

    this._sendingSlope = true;

    const slopeInWholePercent = this._slopeSource.getLastSlopeInWholePercent();
    const slopeUpdate:BrowserToPluginUpdate = {
      pluginId: this._descriptor.pluginId,
      mode: PluginMode.Slope,
      slopePercent: slopeInWholePercent,
      ergTarget: 0,
      resistancePercent: 0,
    }

    fetch("http://localhost:63939/slope", {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slopeUpdate),
    }).finally(() => {
      this._sendingSlope = false;
    })
  }

}

class TestDeviceFactory implements DeviceFactory {
    findPowermeter(byPlugin?:boolean):Promise<ConnectedDeviceInterface>{

      if(byPlugin) {
        // they want to do this searching by looking for the plugin host
        return fetch(`http://localhost:63939/device-list`).then(deviceListRaw => deviceListRaw.json()).then((deviceList:PluginDescriptor[]) => {

          if(deviceList.length > 0) {
            const deviceNames:string[] = deviceList.map((device, index) => `${index+1}) ${device.humanName}`);
  
            const pickedDevice:string|null = prompt("Select a device from the list below:\n" + deviceNames.join('\n'));
            if(pickedDevice) {
              const pickedIndex = parseInt(pickedDevice);
              if(isFinite(pickedIndex) && pickedIndex >= 1 && pickedIndex <= deviceList.length) {
                return new PluginDevice(deviceList[pickedIndex-1]);
              } else {
                alert("That's not a selectable device");
                throw new Error("They picked a device that was not selectable");
              }
            } else {
              // they canceled
              throw new Error("They canceled");
            }
          } else {
            alert("No plugin-capable devices were found or they haven't been initialized.");
            throw new Error("No plugins available");
          }
        }, (failure) => {
          alert("You don't appear to be running the TourJS plugin system.  Install it from tourjs.ca once I get around to putting it up.");
          throw failure;
        })
      } else {
        const filters = {
          filters: [
            {services: ['cycling_power']},
            {services: ['fitness_machine', 'cycling_power']},
            {services: [serviceUuids.kickrService, 'cycling_power']},
          ]
        }
        return navigator.bluetooth.requestDevice(filters).then((device) => {
          if(device.gatt) {
            return device.gatt.connect();
          } else {
            throw new Error("No device gatt?");
          }
        }).then((gattServer) => {
          deviceUtilsNotifyConnect();
          return gattServer.getPrimaryServices().then((services) => {
            const ftms = getFtms(services);
            const cps = getCps(services);
            const kickr = getKickrService(services);

            if(ftms) {
              return new BluetoothFtmsDevice(gattServer);
            } else if(kickr) {
              return new BluetoothKickrDevice(gattServer);
            } else if(cps) {
              return new BluetoothCpsDevice(gattServer);
            } else {
              throw new Error("We don't recognize what kind of device this is");
            }
          })
        });
      }

    }
}

const g_deviceFactory:DeviceFactory = new TestDeviceFactory();
export function getDeviceFactory():DeviceFactory {
    return g_deviceFactory;
}