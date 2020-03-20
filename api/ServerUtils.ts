import { RideMapPartial, RideMap } from "../app/server-client-common/RideMap";
import { ServerMapDescription } from "../app/server-client-common/communication";
import { RideMapHandicap } from "../app/server-client-common/RideMapHandicap";

export class PureCosineMap extends RideMapPartial {
  _length:number;
  constructor(length:number) {
    super();
    this._length = length;
  }
  getElevationAtDistance(meters: number): number {
    return Math.cos(meters / 1000)*5;
  }
  getLength(): number {
    return this._length;
  }
}
export function makeSimpleMap() {
  const pureCosineMap = new PureCosineMap(5000);

  const map:RideMap = new RideMapHandicap(new ServerMapDescription(pureCosineMap));
  return map;
}