import { WebBluetoothDevice, ConnectedDeviceInterface, BTDeviceState, PowerDataDistributor, PowerRecipient, CadenceRecipient, HrmRecipient } from "./WebBluetoothDevice";

export interface DeviceFactory {
    findPowermeter():Promise<ConnectedDeviceInterface>;
    findHrm():Promise<ConnectedDeviceInterface>;
    findCadence():Promise<ConnectedDeviceInterface>;
    findTrainer():Promise<ConnectedDeviceInterface>;
}

class TestPowermeter extends PowerDataDistributor {
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
}

class TestDeviceFactory implements DeviceFactory {
    findPowermeter():Promise<ConnectedDeviceInterface>{
        return Promise.resolve(new TestPowermeter());
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