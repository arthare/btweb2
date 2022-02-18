import { RideMapPartial, RideMap, PureCosineMap } from "../tourjs-ember/app/tourjs-shared/RideMap";
import { ServerMapDescription } from "../tourjs-ember/app/tourjs-shared/communication";
import { RideMapHandicap } from "../tourjs-ember/app/tourjs-shared/RideMapHandicap";

export function makeSimpleMap(lengthMeters:number):RideMap {
  const pureCosineMap = new PureCosineMap(lengthMeters);

  const map:RideMap = new RideMapHandicap(new ServerMapDescription(pureCosineMap));
  return map;
}