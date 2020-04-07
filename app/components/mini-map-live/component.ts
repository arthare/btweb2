import Component from '@ember/component';
import { assert2 } from 'bt-web2/server-client-common/Utils';
import { drawMinimap } from '../mini-map/component';
import { RaceState } from 'bt-web2/server-client-common/RaceState';
import { UserTypeFlags } from 'bt-web2/server-client-common/User';

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

    console.log("live minimap frame!");
    const canvas = document.createElement('canvas');
    canvas.width = this.element.clientWidth;
    canvas.height = this.element.clientHeight;

    const elevations:number[] = [];
    const raceState = this.get('raceState');
    if(raceState) {
      const map = raceState.getMap();
      for(var pct = 0; pct <= 1.0; pct += 0.005) {
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
      drawMinimap(canvas, elevations, w, h, localPosition, humanPositions, aiPositions);
  
      const dataUri = canvas.toDataURL();
      const img = this.element.querySelector('img');
      if(img) {
        img.src = dataUri;
      }
    }

    setTimeout(() => this._doFrame(), 1000);
  }
};
