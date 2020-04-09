export const serviceUuids = {
  ftms: '00001826-0000-1000-8000-00805f9b34fb',
  cps: '00001818-0000-1000-8000-00805f9b34fb',
  kickrService: 'a026ee01-0a7d-4ab3-97fa-f1500f9feb8b',
  kickrWriteCharacteristic:   'a026e005-0a7d-4ab3-97fa-f1500f9feb8b',
};


export function getFtms(services:BluetoothRemoteGATTService[]):BluetoothRemoteGATTService|null {
  return services.find((service) => service.uuid === serviceUuids.ftms) || null;
}
export function getCps(services:BluetoothRemoteGATTService[]):BluetoothRemoteGATTService|null {
  return services.find((service) => service.uuid === serviceUuids.cps) || null;
}
export function getKickrService(services:BluetoothRemoteGATTService[]):BluetoothRemoteGATTService|null {
  return services.find((service) => service.uuid === serviceUuids.kickrService) || null;
}


export function monitorCharacteristic(
  deviceServer:BluetoothRemoteGATTServer, 
  serviceName:string, 
  characteristicName:string, 
  fnCallback:any  
) {
  return deviceServer.getPrimaryService(serviceName).then((service) => {
    return service.getCharacteristic(characteristicName);
  }).then((characteristic) => {
    return characteristic.startNotifications();
  }).then((characteristic) => {
    characteristic.addEventListener('characteristicvaluechanged', fnCallback);
    return deviceServer;
  })
}

let g_writeQueue = Promise.resolve();
export function writeToCharacteristic(deviceServer:BluetoothRemoteGATTServer, serviceName:string, characteristicName:string, arrayBufferToWrite:DataView) {
  g_writeQueue = g_writeQueue.then(() => {
    return deviceServer.getPrimaryService(serviceName).then((service) => {
      return service.getCharacteristic(characteristicName);
    }).then((characteristic) => {
      return characteristic.writeValue(arrayBufferToWrite);
    })
  })
}