import { User } from "./User";

export interface RideMapElevationOnly {
  getSlopeAtDistance(meters:number):number;
  getElevationAtDistance(meters:number):number;
  getLength():number;
}
export abstract class RideMapPartial implements RideMapElevationOnly {

  getSlopeAtDistance(meters: number): number {
    const delta = 1;
    return (this.getElevationAtDistance(meters + delta) - this.getElevationAtDistance(meters - delta)) / (delta*2);
  }  
  abstract getElevationAtDistance(meters:number):number;
  abstract getLength():number;
}

export interface RideMap extends RideMapPartial {
  getPowerTransform(who:User):(power:number)=>number;
}