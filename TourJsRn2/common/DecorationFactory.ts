import { DecorationPosition, Decoration, DecorationBase, MovingDecoration } from "./DecorationItems";
import { RideMapElevationOnly } from "./RideMap";

export enum Layer {
  FarScenery = "FarScenery", // mountains, distant forests
  NearSky = "NearSky", // clouds, airplanes, birds
  NearRoadside = "NearRoadside", // shops, cheering crowds, mile markers
  Underground = "Underground", // grass tufts, dinosaur bones, hidden treasure
}

export class ConfiggedDecoration {
  minDimensions: DecorationPosition;
  maxDimensions: DecorationPosition;
  minAltitude: number;
  maxAltitude: number;
  imageUrl: string[];
  layer: Layer;
  frequencyPerKm:number;
  name:string;
  minSpeed?:DecorationPosition;
  maxSpeed?:DecorationPosition;

  constructor(raw:ConfiggedDecoration) {
    this.minDimensions = raw.minDimensions;
    this.maxDimensions = raw.maxDimensions;
    this.minSpeed = raw.minSpeed;
    this.maxSpeed = raw.maxSpeed;
    this.minAltitude = raw.minAltitude;
    this.maxAltitude = raw.maxAltitude;
    this.imageUrl = raw.imageUrl;
    this.layer = raw.layer;
    this.frequencyPerKm = raw.frequencyPerKm;
    this.name = raw.name;
  }
}

function randRange(min:number, max:number) {
  return Math.random()*(max-min) + min;
}

export class LoadedDecoration<TImageType, TContextType> extends ConfiggedDecoration {
  private _img:TImageType[]|null = null;
  constructor(raw:ConfiggedDecoration, img:TImageType[]) {
    super(raw);
    this._img = img;
  }

  public generateDecoration(rightSideOfScreen:number, rideMap:RideMapElevationOnly):Decoration<TContextType>|null {
    if(!this._img) {
      return null;
    }
    const dims = {
      x: randRange(this.minDimensions.x, this.maxDimensions.x),
      y: randRange(this.minDimensions.y, this.maxDimensions.y),
    };

    const elevationAboveRoadway = randRange(this.minAltitude, this.maxAltitude);

    const dist = rightSideOfScreen + dims.x/2;

    const elevLeft = rideMap.getElevationAtDistance(dist - dims.x/2);
    const elevRight = rideMap.getElevationAtDistance(dist + dims.x/2);
    const height = Math.min(elevLeft, elevRight);
    const pos = {
      x: dist,
      y: elevationAboveRoadway + height,
    };

    const ixToPick = Math.floor((Math.random() * this._img.length * 10) % this._img.length);
    const imgToUse = this._img[ixToPick];

    if(this.minSpeed && this.maxSpeed) {
      // we have speed specifications, so we're a moving decoration
      const speed = {
        x: randRange(this.minSpeed.x, this.maxSpeed.x),
        y: randRange(this.minSpeed.y, this.maxSpeed.y),
      };
      return new MovingDecoration<TImageType,TContextType>(pos, speed, dims, imgToUse);
    } else {
      // we don't have speed specification, so we're a stopped decoration
      return new DecorationBase<TImageType, TContextType>(pos, dims, imgToUse);
    }
  }
}

export interface ThemeConfig {
  name: string;
  decorationSpecs: ConfiggedDecoration[];
}

export class DecorationFactory<TImageType, TContextType> {
  _availableDecorations:LoadedDecoration<TImageType, TContextType>[];

  constructor() {
    this._availableDecorations = [];
  }

  generateNewDecorations(layer:Layer, dt:number, metersPerSec:number, rightSideOfScreen:number, rideMap:RideMapElevationOnly):Decoration<TContextType>[] {

    const metersTravelled = dt * metersPerSec;
    let generatedDecorations:Decoration<TContextType>[] = [];
    this._availableDecorations.forEach((decSpec) => {

      if(decSpec.layer === layer) {
        // meters per thing: 500km -> 2m/thing -> 50% chance per 1m
        const metersPerThing = 1000 / decSpec.frequencyPerKm;
        const fiftyPercentDistance = metersPerThing / 2;
        const probDuringMotion = 1 - Math.pow(0.5, metersTravelled / fiftyPercentDistance);
        const r = Math.random();
        if(r < probDuringMotion) {
          // this thing gets to be generated!
  
          const generatedDecoration = decSpec.generateDecoration(rightSideOfScreen, rideMap);
          if(generatedDecoration) {
            generatedDecorations.push(generatedDecoration);
          }
        }
      }
    })

    return generatedDecorations;
  }
}
