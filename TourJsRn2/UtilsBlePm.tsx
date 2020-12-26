import { Device, BleError, Characteristic } from "react-native-ble-plx";
import { DeviceContext } from "./UtilsBle";
import { DataNotifyRecipient, LoadedBleDevice, LoadedDevice, LoadedFakeDevice, UUID_CPS_MEASURE_CHAR, UUID_CPS_SERVICE } from "./UtilsBleBase";
import { Buffer } from 'buffer';


export class LoadedFakePowermeter extends LoadedFakeDevice {
  constructor(deviceContext:DeviceContext) {
    super(deviceContext);
  }
  _report() {
    this.deviceContext.notifyPower(Math.random() * 30 + 120);
  }
  name(): string {
    return "HRM:Fake";
  }
}

export class LoadedPm extends LoadedBleDevice {
  constructor(deviceContext:DataNotifyRecipient, device:Device) {
    super(deviceContext, device);
  }
  connect():Promise<any> {
    let connectPromise = this.bleDevice.isConnected().then((isConnected) => {
      if(!isConnected) {
        return this.bleDevice.connect();
      }
    })
    
    const name = this.bleDevice.name;

    return connectPromise.then(() => {
      console.log("connected to " + name);
      return this.bleDevice.discoverAllServicesAndCharacteristics().then(() => {
        this.addSub(this.bleDevice.monitorCharacteristicForService(UUID_CPS_SERVICE, UUID_CPS_MEASURE_CHAR, (err, char) => this.onMeasureChange(err, char)));
      })
    })
  }

  onMeasureChange(err:BleError|null, char:Characteristic|null) {
    this.deviceContext.notifyAnyMessage(this);
    if(err || !char) {
      return;
    }
    const base64Value = char.value;
    if(base64Value) {
      const buf = Buffer.from(base64Value, 'base64');
      const power = buf.readInt16LE(2);
      console.log("power device sez ", power);
      this.deviceContext.notifyPower(power);
    }
  }
}