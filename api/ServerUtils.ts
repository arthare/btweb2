import { RideMapPartial, RideMap, PureCosineMap } from "../tourjs-react/src/tourjs-shared/RideMap";
import { ServerMapDescription } from "../tourjs-react/src/tourjs-shared/communication";
import { RideMapHandicap } from "../tourjs-react/src/tourjs-shared/RideMapHandicap";

export function makeSimpleMap(lengthMeters:number):RideMap {
  const pureCosineMap = new PureCosineMap(lengthMeters);

  const map:RideMap = new RideMapHandicap(new ServerMapDescription(pureCosineMap));
  return map;
}