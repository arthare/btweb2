import Component from '@ember/component';
import { RaceState } from 'bt-web2/server-client-common/RaceState';
import Ember from 'ember';
import Connection from 'bt-web2/services/connection';
import { doPaintFrameStateUpdates, paintCanvasFrame, PaintFrameState } from 'bt-web2/server-client-common/drawing';
import { DecorationFactory, Layer, ThemeConfig } from 'bt-web2/server-client-common/DecorationFactory';
import { DecorationState } from 'bt-web2/server-client-common/DecorationState';
import ENV from 'bt-web2/config/environment';


const defaultThemeConfig:ThemeConfig = {
  name: "Default Theme",
  decorationSpecs: [
    {
      name: "Clouds",
      minDimensions: {x:12,y:8},
      maxDimensions: {x:16,y:10},
      minAltitude: 12,
      maxAltitude: 22,
      imageUrl: ['assets/cloud1.png', 'assets/cloud2.png'],
      layer: Layer.NearSky,
      frequencyPerKm:50,
    }, {
      name: "Grasses",
      minDimensions: {x:1,y:1},
      maxDimensions: {x:1.2,y:1.2},
      minAltitude: -16,
      maxAltitude: -2,
      imageUrl: ['assets/grass2.png', 
                'assets/grass3.png', 
                'assets/grass4.png',
                'assets/grass5.png',
                'assets/grass6.png',
                'assets/grass7.png',
              ],
      layer: Layer.Underground,
      frequencyPerKm:1000,
    }, {
      name: "Stores",
      minDimensions: {x:4,y:4},
      maxDimensions: {x:4,y:4},
      minAltitude: 2.0,
      maxAltitude: 2.0,
      imageUrl: ['assets/store1.webp', 
                'assets/store2.webp', 
              ],
      layer: Layer.NearRoadside,
      frequencyPerKm:20,
    }, {
      name: "Trees",
      minDimensions: {x:4,y:4},
      maxDimensions: {x:8,y:8},
      minAltitude: 2.0,
      maxAltitude: 2.0,
      imageUrl: [
        'assets/tree1-by-art.webp', 
        'assets/tree2-by-art.webp', 
      ],
      layer: Layer.NearRoadside,
      frequencyPerKm:60,
    }
  ]
}

export default class MainMap extends Component.extend({
  // anything which *must* be merged to prototype here
  connection: <Connection><unknown>Ember.inject.service('connection'),
  classNames: ['main-map__container'],
  tagName: 'canvas',

  raceState: <RaceState|null>null,
}) {
  // normal class body definition here
  didInsertElement() {
    const canvas:HTMLCanvasElement = <HTMLCanvasElement>this.element;
    if(!canvas.parentElement) {
      return;
    }
    canvas.width = canvas.parentElement?.clientWidth;
    canvas.height = canvas.parentElement?.clientHeight;
    //canvas.height = canvas.clientHeight;

    const raceState:RaceState|null = this.get('raceState');
    if(!raceState) {
      return;
    }
    const decorationFactory = new DecorationFactory(defaultThemeConfig);
    const decorationState = new DecorationState(raceState?.getMap(), decorationFactory);
    let lastTime = 0;
    const paintState = new PaintFrameState();
    let frame = 0;
    const handleAnimationFrame = (time:number) => {
      frame++;
      if(raceState) {
        
        let dt = 0;
        if(lastTime) {
          dt = (time - lastTime) / 1000.0;
        }
        lastTime = time;

        const tmNow = new Date().getTime();
        raceState.tick(tmNow);

        const frameMod = 1;
        if(frame % frameMod == 0) {
          doPaintFrameStateUpdates(ENV.rootURL, tmNow, dt*frameMod, raceState, paintState);
        }
        paintCanvasFrame(canvas, raceState, time, decorationState, dt, paintState);

        requestAnimationFrame(handleAnimationFrame);
      } else {
        throw new Error("No race state available?");
      }

    }

    requestAnimationFrame(handleAnimationFrame);
  }
};
