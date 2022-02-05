import Component from '@ember/component';
import { assert2 } from 'bt-web2/tourjs-shared/Utils';
import { drawMinimap, DrawMinimapParameters } from 'bt-web2/tourjs-shared/drawing';
import { RaceState } from 'bt-web2/tourjs-shared/RaceState';
import { UserTypeFlags } from 'bt-web2/tourjs-shared/User';

export default class MiniMapLive extends Component.extend({
  // anything which *must* be merged to prototype here
  classNames: ['mini-map-live__container'],
  raceState:<RaceState|null>null,
}) {
  // normal class body definition here
  didInsertElement() {
    assert2(this.get('raceState'));

    this._doFrame();
  }

  _doFrame() {
    if(this.isDestroying) {
      return;
    }
    const tmNow = new Date().getTime();

    const canvas = this.element.querySelector('canvas');
    if(!canvas) {
      throw new Error("canvas not found");
    }

    const w = this.element.clientWidth;
    const h = this.element.clientHeight;
    canvas.width = w;
    canvas.height = h;

    const elevations:number[] = [];
    const raceState = this.get('raceState');
    if(raceState) {
      const map = raceState.getMap();
      for(var pct = 0; pct <= 1.0; pct += 0.01) {
        elevations.push(map.getElevationAtDistance(pct * map.getLength()));
      }
  
      const aiPositions:number[] = [];
      const humanPositions:number[] = [];
      let localPosition:number = 0;

      const users = raceState.getUserProvider().getUsers(tmNow);
      users.forEach((user) => {
        const type = user.getUserType();
        if(type & UserTypeFlags.Ai) {
          aiPositions.push(user.getDistance() / map.getLength());
        } else {
          if(type & UserTypeFlags.Local) {
            localPosition = user.getDistance() / map.getLength();
          } else {
            humanPositions.push(user.getDistance() / map.getLength());
          }
        }
      })

      const w = this.element.clientWidth;
      const h = this.element.clientHeight;
      if(!this.isDestroyed) {
        requestAnimationFrame(() => {
          const ctx = canvas.getContext('2d');
          const drawMiniParams:DrawMinimapParameters = {
            ctx,
            elevations,
            w,
            h,
            minElevSpan:map.getLength()*0.01,
            localPositionPct:localPosition,
            humanPositions,
            aiPositions,
          }
          drawMinimap(drawMiniParams);
        })
      }

      
    }

    if(!this.isDestroyed) {
      setTimeout(() => this._doFrame(), 250);
    }
  }
};
