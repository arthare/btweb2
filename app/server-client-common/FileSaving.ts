import { User } from "./User";

interface IWorkoutSample {
  power:number;
  tm:number;
  distance:number;
  speedMetersPerSec:number;
}

class WorkoutSample implements IWorkoutSample {
  constructor(tmNow:number, user:User) {
    this.tm = tmNow;
    this.power = user.getLastPower();
    this.distance = user.getDistance();
    this.speedMetersPerSec = user.getSpeed();
  }
  power:number;
  tm:number;
  distance:number;
  speedMetersPerSec:number;
}

export class WorkoutFileSaver {
  _user:User;
  _tmLastSample:number;

  _samples:IWorkoutSample[];

  constructor(myUser:User, tmNow:number) {
    console.log("built a new workout saver for ", myUser.getName());
    this._user = myUser;
    this._tmLastSample = 0;
    this._samples = [];
    this.tick(tmNow);
    this._tmLastSample = tmNow;
  }

  tick(tmNow:number) {
    const dtSince = tmNow - this._tmLastSample;
    if(dtSince >= 1000) {
      // ok, we should record their current status
      this._samples.push(new WorkoutSample(tmNow, this._user));
      this._tmLastSample = tmNow;
    }
  }

  getWorkout():IWorkoutSample[] {
    return this._samples;
  }
}

export function samplesToPWX(name:string, user:User, deviceName:string, samples:IWorkoutSample[]) {
  let lines = [];
  lines.push(`<?xml version="1.0"?>`);
  lines.push(`<pwx xmlns="http://www.peaksware.com/PWX/1/0" creator="Golden Cheetah" xsi:schemaLocation="http://www.peaksware.com/PWX/1/0 http://www.peaksware.com/PWX/1/0/pwx.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.0" xmlns:xsd="http://www.w3.org/2001/XMLSchema">`);
  lines.push(`<workout>`);
  lines.push(`<athlete><name>${user.getName()}</name></athlete>`);
  lines.push(`<sportType>Bike</sportType>`);
  lines.push(`<device id="TourJS">
                <make>Tour.JS</make>
                <model>${deviceName}</model>
              </device>`);

  const firstSample = samples[0];
  const durationSeconds = Math.floor((samples[samples.length-1].tm - samples[0].tm) / 1000);
  const lengthMeters = (samples[samples.length-1].distance - samples[0].distance);
  
  const dateStamp = new Date(firstSample.tm).toISOString().replace('Z', '');
  lines.push(`<time>${dateStamp}</time>
              <summarydata>
                  <beginning>0</beginning>
                  <duration>${durationSeconds}</duration>
                  <dist>${lengthMeters}</dist>
              </summarydata>`);
  
  let lastSample = firstSample;
  samples.forEach((sample) => {
    if(sample.distance >= lastSample.distance) {
      const timeSeconds = (sample.tm - firstSample.tm)/1000;
      lines.push(`<sample>
                      <timeoffset>${timeSeconds.toFixed(0)}</timeoffset>
                      <spd>${sample.speedMetersPerSec.toFixed(3)}</spd>
                      <pwr>${sample.power.toFixed(0)}</pwr>
                      <dist>${sample.distance.toFixed(0)}</dist>
                  </sample>`);
      lastSample = sample;
    }
  });

  lines.push(`</workout>`);
  lines.push(`</pwx>`);

  return lines.join('\n');
}