import Component from '@ember/component';
import { ServerHttpGameListElement } from 'bt-web2/shared/communication';
import { human_color, local_color, ai_color } from '../main-map/component';
import { assert2 } from 'bt-web2/shared/Utils';
import { RideMapElevationOnly } from 'bt-web2/shared/RideMap';
import Ember from 'ember';
import { drawMinimap } from 'bt-web2/shared/drawing';

export default class MiniMap extends Component.extend({
  // anything which *must* be merged to prototype here
  classNames: ['mini-map__container'],
  race: <RideMapElevationOnly|null>null,

  _onChangeRace: Ember.observer('race', function(this:MiniMap) {
    this._redraw();
  }),
}) {
  // normal class body definition here

  _redraw() {

    const race:RideMapElevationOnly|null = this.get('race');
    if(!race) {
      throw new Error("you gotta provide your minimap a race!");
    }
    const canvas = document.createElement('canvas');

    const w = this.element.clientWidth;
    const h = this.element.clientHeight;

    canvas.width = w;
    canvas.height = h;


    const elevations = [];
    const len = race.getLength();
    for(var pct = 0; pct <= 1.0; pct += 0.005) {
      elevations.push(race.getElevationAtDistance(pct*len));
    }

    const ctx = canvas.getContext('2d');

    drawMinimap({ ctx, 
                   elevations, 
                   w, 
                   h, 
                   minElevSpan: race.getLength()*0.01,});

    const png = canvas.toDataURL();
    const img = this.element.querySelector('img');
    if(img) {
      img.src = png;
    }

  }

  didInsertElement() {
    // we need to draw a minimap for this guy
    this._redraw();
  }
};
