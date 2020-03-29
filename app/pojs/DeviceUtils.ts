const uuids = {
  ftms: '00001826-0000-1000-8000-00805f9b34fb',
  cps: '00001818-0000-1000-8000-00805f9b34fb',
}

export function getFtms(services:BluetoothRemoteGATTService[]):BluetoothRemoteGATTService|null {
  return services.find((service) => service.uuid === uuids.ftms) || null;
}
export function getCps(services:BluetoothRemoteGATTService[]):BluetoothRemoteGATTService|null {
  return services.find((service) => service.uuid === uuids.cps) || null;
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

export function writeToCharacteristic(deviceServer:BluetoothRemoteGATTServer, serviceName:string, characteristicName:string, arrayBufferToWrite:DataView) {
  return deviceServer.getPrimaryService(serviceName).then((service) => {
    return service.getCharacteristic(characteristicName);
  }).then((characteristic) => {
    return characteristic.writeValue(arrayBufferToWrite);
  })
}