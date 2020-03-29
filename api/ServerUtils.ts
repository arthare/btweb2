import { RideMapPartial, RideMap, PureCosineMap } from "../app/server-client-common/RideMap";
import { ServerMapDescription } from "../app/server-client-common/communication";
import { RideMapHandicap } from "../app/server-client-common/RideMapHandicap";

export function makeSimpleMap(lengthMeters:number):RideMap {
  const pureCosineMap = new PureCosineMap(lengthMeters);

  const map:RideMap = new RideMapHandicap(new ServerMapDescription(pureCosineMap));
  return map;
}