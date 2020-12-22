import { Device, BleError, Characteristic } from "react-native-ble-plx";
import { UUID_CPS_SERVICE, UUID_HRM_SERVICE, UUID_HRM_MEASURE_CHAR, LoadedDevice, DataNotifyRecipient } from "./UtilsBleBase";
import { Buffer } from 'buffer';

export class LoadedHrm extends LoadedDevice {
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
        this.addSub(this.bleDevice.monitorCharacteristicForService(UUID_HRM_SERVICE, UUID_HRM_MEASURE_CHAR, (err, char) => this.onMeasureChange(err, char)));
      })
      
    })

  }

  onMeasureChange(err:BleError|null, char:Characteristic|null) {
    this.deviceContext.notifyAnyMessage(this.bleDevice);
    if(err || !char) {
      return;
    }
    const base64Value = char.value;
    if(base64Value) {
      const buf = Buffer.from(base64Value, 'base64');
      const tmNow = new Date().getTime();
      const flags = buf.readUInt8(0);
      let hr = 0;
      if((flags & 1) === 0) {
        // this is a uint8 hrm
        hr = buf.readUInt8(1);
      } else {
        // this is a uint16 hrm
        hr = buf.readUInt16LE(1);
      }

      this.deviceContext.notifyHrm(hr);
    }

  }
}