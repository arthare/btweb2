import { RideMapPartial, RideMap, PureCosineMap } from "./shared/RideMap";
import { ServerMapDescription } from "./shared/communication";
import { RideMapHandicap } from "./shared/RideMapHandicap";

export function makeSimpleMap(lengthMeters:number):RideMap {
  const pureCosineMap = new PureCosineMap(lengthMeters);

  const map:RideMap = new RideMapHandicap(new ServerMapDescription(pureCosineMap));
  return map;
}