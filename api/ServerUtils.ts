import { RideMapPartial, RideMap, PureCosineMap } from "./tourjs-shared/RideMap";
import { ServerMapDescription } from "./tourjs-shared/communication";
import { RideMapHandicap } from "./tourjs-shared/RideMapHandicap";

export function makeSimpleMap(lengthMeters:number):RideMap {
  const pureCosineMap = new PureCosineMap(lengthMeters);

  const map:RideMap = new RideMapHandicap(new ServerMapDescription(pureCosineMap));
  return map;
}