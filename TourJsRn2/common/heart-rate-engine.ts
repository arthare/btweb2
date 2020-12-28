import { User } from "./User";
import { assert2 } from "./Utils";

export class ZeroToOne {
  _val: number;
  constructor(val:number) {
    assert2(val >= -0.01 && val <= 1.01);
    this._val = val;
  }
  get val() {return this._val;}
}
export class ZeroToOneIsh extends ZeroToOne {
  _val: number;
  constructor(val:number) {
    super(0); // avoids the assert
    this._val = val;
  }
  get val() {return this._val;}
}

export class HeartRateEngine {

  lastBpm:number;


  constructor(firstBpm:number) {
    this.lastBpm = firstBpm;
  }

  tick(user:User, tmNow:number, dt:number, targetBpm:number, targetHandicap:ZeroToOneIsh, gainFactor:ZeroToOneIsh):{newTargetHandicap:ZeroToOne} {
    if(dt > 1) {
      // dt too big, let's not do anything crazy here
      return {newTargetHandicap: targetHandicap};
    }
    if(user) {
      const lastBpm = user.getLastHrm(tmNow);
      const lastWatts = user.getLastPower();
      this.lastBpm = lastBpm;

      if(lastBpm > 0 && lastWatts > 0) {
        // ok, so we know their lastBpm (in lastBpm), and we know their targetBpm (in targetBpm).
        // we probably need to adjust targetErg up or down based on the delta

        let error = targetBpm - lastBpm;
        let handicapsPerSecToAdjust = 0;
        if(error > 0) {
          // we're too low, heartrate wise, so we need to gradually increase the difficulty

          // clamp it to a max of 10bpm error - this way when you initially get on the bike with a HR of 60 it doesn't shoot way the hell up
          error = Math.min(10, error);
          handicapsPerSecToAdjust = gainFactor.val*0.00025*(Math.min(10, error));
        } else {
          // we're too high.  bring things down fairly quickly.
          handicapsPerSecToAdjust = gainFactor.val*0.00065*(error);
        }
  
        console.log("handicaps/s to adjust: ", handicapsPerSecToAdjust, "dt = ", dt, " starting ", targetHandicap.val, "gain ", gainFactor.val);
        let newTargetHandicap = targetHandicap.val + handicapsPerSecToAdjust*dt;
        return {newTargetHandicap: new ZeroToOneIsh(newTargetHandicap)};
      } else {
        return {newTargetHandicap: targetHandicap};
      }
    } else {
      return {newTargetHandicap: new ZeroToOne(0)};
    }

  }

}