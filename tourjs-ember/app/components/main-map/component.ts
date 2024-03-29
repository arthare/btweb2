import Component from '@ember/component';
import { RaceState } from 'bt-web2/tourjs-shared/RaceState';
import Ember from 'ember';
import Connection from 'bt-web2/services/connection';
import { DecorationFactory, Layer, ThemeConfig } from 'bt-web2/tourjs-client-shared/DecorationFactory';
import { DecorationState } from 'bt-web2/tourjs-shared/DecorationState';
import ENV from 'bt-web2/config/environment';
import { defaultThemeConfig } from 'bt-web2/tourjs-client-shared/drawing-constants';
import { createDrawer } from 'bt-web2/tourjs-shared/drawing-factory';
import { PaintFrameState } from 'bt-web2/tourjs-shared/drawing-interface';


export default class MainMap extends Component.extend({
  // anything which *must* be merged to prototype here
  connection: <Connection><unknown>Ember.inject.service('connection'),
  classNames: ['main-map__container'],
  tagName: 'canvas',
  mode: <string>"2d",

  raceState: <RaceState|null>null,
}) {
  // normal class body definition here
  didInsertElement() {
    console.log("main-map didInsertElement");
    const canvas:HTMLCanvasElement = <HTMLCanvasElement>this.element;
    if(!canvas.parentElement) {
      console.log("no canvas for main-map");
      return;
    }
    canvas.width = canvas.parentElement?.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.parentElement?.clientHeight * window.devicePixelRatio;
    //canvas.height = canvas.clientHeight;

    const raceState:RaceState|null = this.get('raceState');
    if(!raceState) {
      console.log("no race-state for main-map");
      return;
    }
    const decorationFactory = new DecorationFactory(defaultThemeConfig);
    const decorationState = new DecorationState(raceState?.getMap(), decorationFactory);
    let lastTime = 0;
    const drawer = createDrawer(this.get('mode'));
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
          drawer.doPaintFrameStateUpdates(ENV.rootURL, tmNow, dt*frameMod, raceState, paintState);
        }
        drawer.paintCanvasFrame(canvas, raceState, time, decorationState, dt, paintState);

        if(!this.isDestroyed) {
          requestAnimationFrame(handleAnimationFrame);
        }
      } else {
        throw new Error("No race state available?");
      }

    }

    requestAnimationFrame(handleAnimationFrame);
  }
};
