import Component from '@ember/component';
import { RaceState } from 'bt-web2/tourjs-shared/RaceState';
import Ember from 'ember';
import Connection from 'bt-web2/services/connection';
import { doPaintFrameStateUpdates, paintCanvasFrame, PaintFrameState } from 'bt-web2/tourjs-shared/drawing';
import { DecorationFactory, Layer, ThemeConfig } from 'bt-web2/tourjs-shared/DecorationFactory';
import { DecorationState } from 'bt-web2/tourjs-shared/DecorationState';
import ENV from 'bt-web2/config/environment';
import { defaultThemeConfig } from 'bt-web2/tourjs-shared/drawing-constants';


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
