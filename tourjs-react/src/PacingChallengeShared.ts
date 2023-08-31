import { UserProvider } from "./tourjs-shared/RaceState";
import { MapBounds, RideMap, RideMapPartial } from "./tourjs-shared/RideMap";
import { DEFAULT_HANDICAP_POWER, DEFAULT_RIDER_MASS, User, UserInterface, UserTypeFlags } from "./tourjs-shared/User";
import { assert2 } from "./tourjs-shared/Utils";
import { PacingChallengeResultSubmission } from "./tourjs-shared/communication";

export enum PacingChallengeMapName {
  Hills1 = "hills1",
  Hills2 = "hills2",
  Flat = "flat",
  Long = "long",
}

export class PacingChallengeMapRecords {
  effort125: PacingChallengeResultSubmission[] = [];
  effort100: PacingChallengeResultSubmission[] = [];
  effort90: PacingChallengeResultSubmission[] = [];
  effort80: PacingChallengeResultSubmission[] = [];
  effort50: PacingChallengeResultSubmission[] = [];
}
export interface PacingChallengeDb {
  hills1: PacingChallengeMapRecords;
  hills2: PacingChallengeMapRecords;
  flat: PacingChallengeMapRecords;
  long: PacingChallengeMapRecords;
}

export class PacingChallengeShortMap extends RideMapPartial implements RideMap {
  getPowerTransform(who: User): (power: number) => number {
    return (power:number) => {
      return DEFAULT_HANDICAP_POWER*(power / who.getHandicap());
    }
  }
  getBounds(): MapBounds {
    return {
      minElev:-40,
      maxElev:50,
      minDist:0,
      maxDist:this.getLength(),
    }
    
  }
  getElevationAtDistance(meters: number): number {
    
    return 15*Math.cos(meters / 400) + 
           2.5*Math.cos(meters / 170) -
           7.5*Math.cos(meters /2200) +
           50*Math.cos(Math.cos(meters / 750)) - 25;
  }
  getLength(): number {
    return 5000;
  }
}
export class PacingChallengeHills1 extends PacingChallengeShortMap {
  getLength() {
    if(window.location.hostname === 'localhost') {
      return 100;
    } else {
      return super.getLength();
    }
  }
  getElevationAtDistance(meters: number): number {    
    return 15*Math.cos(meters / 400) + 
           2.5*Math.cos(meters / 170) -
           7.5*Math.cos(meters /2200) +
           50*Math.cos(Math.cos(meters / 750)) - 25;
  }
}
export class PacingChallengeHills2 extends PacingChallengeShortMap {
  getBounds(): MapBounds {
    return {
      minElev:0,
      maxElev:60,
      minDist:0,
      maxDist:this.getLength(),
    }
  }
  getElevationAtDistance(meters: number): number {    
    return 12*Math.cos(meters / 300) + 
           6.5*Math.cos(meters / 150) +
           50*Math.cos(Math.cos(meters / 750)) - 25 + meters/250;
  }
}
export class PacingChallengeFlat extends PacingChallengeShortMap {
  getBounds(): MapBounds {
    return {
      minElev:0,
      maxElev:20,
      minDist:0,
      maxDist:this.getLength(),
    }
  }
  getElevationAtDistance(meters: number): number {    
    return 2*Math.sin(meters/1000);
  }
}
export class PacingChallengeLong extends PacingChallengeShortMap {
  getBounds(): MapBounds {
    return {
      minElev:-10,
      maxElev:60,
      minDist:0,
      maxDist:this.getLength(),
    }
  }
  getLength(): number {
    return 15000;
  }
  getElevationAtDistance(meters: number): number {    
    if(meters <= 1500) {
      // climb gradually from 0 to 15 meters at a steady grade
      return 0.01*meters;
    } else if(meters <= 3000) {
      // descend back down to zero elevation
      meters -= 1500;
      return 15 - meters*0.01;
    } else if(meters <= 5500) {
      meters -= 3000;
      return 12*Math.sin(meters / 300) + 
           6.5*Math.sin(meters / 150) +
           50*Math.sin(Math.sin(meters / 750));
    } else if (meters <= 7500) {
      // 2km perfectly flat
      const lastElev = this.getElevationAtDistance(5500);
      return lastElev;
    } else {
      // something siney to finish things off
      const lastElev = this.getElevationAtDistance(7500);
      meters -= 7500;
      return lastElev + 8*Math.sin(Math.pow(meters, 0.6) / 1300) + 
                        5.5*Math.sin(meters / 250) +
                        30*Math.sin(Math.sin(meters / 350));
    }
  }
}
export function getPacingChallengeMap(name:PacingChallengeMapName):PacingChallengeShortMap {
  switch(name) {
    default:
    case PacingChallengeMapName.Hills1:
      return new PacingChallengeHills1();
    case PacingChallengeMapName.Hills2:
      return new PacingChallengeHills2();
    case PacingChallengeMapName.Flat:
      return new PacingChallengeFlat();
    case PacingChallengeMapName.Long:
      return new PacingChallengeLong();
  }

}

export class PacingChallengeUserProvider implements UserProvider {
  users: UserInterface[];
  localUser:UserInterface;

  constructor(localUserOverride:UserInterface, pctZeroToOne:number, mapLen:number) {
    assert2(pctZeroToOne > 0.1); // this would be an unreasonable effort level
    if(!localUserOverride) {
      throw new Error("You need to have your devices set up before starting");
    }
    localUserOverride.setDistance(0);
    localUserOverride.setSpeed(10);
    this.users = [
      localUserOverride,
    ];
    this.localUser = localUserOverride;
    

    // generate a bunch of slow AIs so that the user has to overtake them and decide whether to stick around and draft or push harder
    // all the AIs will ride at 90% of the handicapped effort level, so they'll be easy to catch up to and not fast enough to be useful
    const n = 30;
    const aiLead = Math.min(mapLen / 2, 2000);
    const PACING_AI_HANDICAP = 100;
    for(var x = 1;x < n; x++) {
      
      const aiUser = new User(`AI ${n - x + 1}`, DEFAULT_RIDER_MASS, PACING_AI_HANDICAP, UserTypeFlags.Ai | UserTypeFlags.Remote);
      aiUser.setDistance((x / n) * aiLead);
      aiUser.notifyPower(new Date().getTime(), PACING_AI_HANDICAP * pctZeroToOne * 0.9);
      console.log("aiuser got notified ", PACING_AI_HANDICAP * pctZeroToOne * 0.9, pctZeroToOne);
      this.users.push(aiUser);
    }
    this.users.forEach((user, index) => {
      if(user.getId() < 0) {
        user.setId(index);
      }
    });
  }

  getUsers(tmNow: number): UserInterface[] {
    return this.users.slice();
  }  
  
  getUser(id: number): UserInterface | null {
    return this.users.find((user) => user.getId() === id) || null;
  }
  getLocalUser():UserInterface|null {
    return this.localUser;
  }


}


export interface PowerTimerAverage {
  powerAvg:number,
  totalTimeSeconds:number,
  joules:number,
}

export class PowerTimer {
  tmStart:number;
  tmLast:number;
  sumPower:number;
  countPower:number;

  constructor(tmStart:number) {
    this.tmStart = tmStart;
    this.tmLast = tmStart;
    this.sumPower = 0;
    this.countPower = 0;
  }

  notifyPower(tmNow:number, power:number) {
    const dt = Math.min(2, (tmNow - this.tmLast) / 1000);
    if(dt <= 0) {
      return;
    }
    this.sumPower += power * dt;
    this.countPower += dt;
    this.tmLast = tmNow;
  }

  getAverage(tmNow:number):PowerTimerAverage {

    const elapsedSeconds = this.countPower > 0 ? this.countPower : (tmNow - this.tmStart) / 1000;
    return {
      powerAvg: this.countPower > 0 ? this.sumPower / elapsedSeconds : 0,
      joules: this.sumPower,
      totalTimeSeconds: elapsedSeconds,
    }
  }
}