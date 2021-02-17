import { Decoration } from "./DecorationItems";
import { DecorationFactory, Layer } from "./DecorationFactory";
import {GCanvasView, GImage} from '@flyskywhy/react-native-gcanvas';
import { RideMapElevationOnly } from "./RideMap";

export class DecorationState<TImageType, TContextType> {
  private _decorations:Map<Layer,Decoration<TContextType>[]>;
  private _factory:DecorationFactory<TImageType, TContextType>;
  private _map:RideMapElevationOnly;
  private _lastRight:number = 0;

  private _images:{[key:string]:TImageType} = {};

  constructor(map:RideMapElevationOnly, factory:DecorationFactory<TImageType, TContextType>, fnCreateImage:()=>any) {
    this._decorations = new Map<Layer, Decoration<TContextType>[]>();
    
    Object.keys(Layer).forEach((layer) => {
      this._decorations.set(<Layer><unknown>layer, []);
    })
    this._factory = factory;
    this._map = map;

    const imageNames:{[key:string]:string} = {
      "heart": "https://www.tourjs.ca/assets/heart-bfcc4ae7b0c81630445aaa622b23bc49.png",
    }
    for(var key in imageNames) {
      const el = fnCreateImage();
      el.onload = () => {
        this._images[key] = el;
      }
      el.onerror = () => {
        debugger;
      }
      el.src = imageNames[key];
    }
  }

  public getImage(key:string):TImageType|null {
    if(this._images[key]) {
      return this._images[key];
    }
    return null;
  }

  public tick(dt:number, windowLeft:number, windowRight:number) {
    this._decorations.forEach((decorations) => {
      decorations.forEach((dec) => {
        dec.tick(dt);
      })
    });

    this._decorations.forEach((decorations, key) => {
      this._decorations.set(key, decorations.filter((dec) => {
        return dec.isOnScreen(windowLeft);
      }))
    });

    if(this._lastRight && windowRight > this._lastRight) {
      const metersPerSec = (windowRight - this._lastRight) / dt;

      for(let layer in Layer) {
        const rg = this._decorations.get(<Layer><unknown>layer);
        if(rg) {
          rg.push(...this._factory.generateNewDecorations(<Layer><unknown>layer, dt, metersPerSec, windowRight, this._map));
        }
        

      }
    }
    this._lastRight = windowRight;    
  }
  public draw(ctx:TContextType, layer:Layer) {
    const rg = this._decorations.get(layer);
    if(rg) {
      rg.forEach((dec) => {
        dec.draw(ctx)
      });
    }
  }

}
