import { RideMapPartial } from "./RideMap";
import { User } from "./User";
import { ServerMapDescription } from "./communication";
import { assert2 } from "./Utils";

export class RideMapHandicap extends RideMapPartial {
  _length:number;
  _mapDesc:ServerMapDescription;
  constructor(mapDesc:ServerMapDescription) {
    super();
    this._length = mapDesc.distances[mapDesc.distances.length-1];
    this._mapDesc = mapDesc;
  }
  
  _indexBelowMeters(targetMeters:number):number {
    if(targetMeters <= this._mapDesc.distances[0]) {
      return this._mapDesc.elevations[0];
    }
    if(targetMeters >= this._mapDesc.distances[this._mapDesc.distances.length-1]) {
      return this._mapDesc.elevations[this._mapDesc.elevations.length-1];
    }

    let ixLow = 0;
    let ixHigh = this._mapDesc.distances.length - 1;
    while(true) {
      const ixTest = Math.floor((ixLow + ixHigh) / 2);
      const meters = this._mapDesc.distances[ixTest];
      if(meters >= targetMeters) {
        ixHigh = ixTest;
      } else if(meters < targetMeters) {
        if(ixTest >= ixHigh-1) {
          return ixTest;
        }
        ixLow = ixTest;
      }
    }
  }

  getElevationAtDistance(meters: number): number {
    let ixLeft = this._indexBelowMeters(meters);
    let ixRight = ixLeft+1;

    let metersLeft = this._mapDesc.distances[ixLeft];
    let metersRight = this._mapDesc.distances[ixRight];
    assert2(metersRight > metersLeft);
    let offset = meters - metersLeft;
    let span = metersRight - metersLeft;
    let pct = offset / span;
    assert2(pct >= 0 && pct <= 1);

    let elevLeft = this._mapDesc.elevations[ixLeft];
    let elevRight = this._mapDesc.elevations[ixRight];
    return pct*elevRight + (1-pct)*elevLeft;
  }
  getPowerTransform(who: User): (power: number) => number {
    return (power:number) => {
      return 300*(power / who.getHandicap());
    }
  }

  getLength():number {
    return this._length;
  }
  
}