import Component from '@ember/component';
import { ServerHttpGameListElement } from 'bt-web2/server-client-common/communication';
import { human_color, local_color, ai_color } from '../main-map/component';
import { assert2 } from 'bt-web2/server-client-common/Utils';
import { RideMapElevationOnly } from 'bt-web2/server-client-common/RideMap';
import Ember from 'ember';

export function drawMinimap(canvas:HTMLCanvasElement, elevations:number[], w:number, h:number, minElevSpan:number, localPositionPct?:number, humanPositions?:number[], aiPositions?:number[]) {
  
  const ctx = canvas.getContext('2d');
  if(!ctx) {
    return;
  }
  // do the sky
  const skyGradient = ctx.createLinearGradient(0,0,w,h);
  skyGradient.addColorStop(0, "#35D6ed");
  skyGradient.addColorStop(1, "#c9f6ff");
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0,0,w,h);

  // grass gradient
  const grassGradient = ctx.createLinearGradient(0,0,w,h);
  grassGradient.addColorStop(0, "#709b40");
  grassGradient.addColorStop(1, "#285028");

  
  let maxElev:number = elevations[0];
  let minElev:number = elevations[0];
  elevations.forEach((elev) => {
    if(!maxElev || elev > maxElev) {
      maxElev = elev;
    }
    if(!minElev || elev < minElev) {
      minElev = elev;
    }
  })

  let elevSpan = maxElev - minElev;
  if(elevSpan < minElevSpan) {
    const missedBy = minElevSpan - elevSpan;
    maxElev += missedBy / 2;
    minElev -= missedBy / 2;
    elevSpan = minElevSpan;
  }
  
  ctx.scale(1,-1);
  ctx.translate(0,-h);
  ctx.beginPath();
  ctx.fillStyle = grassGradient;
  const elevs = [...elevations];
  elevs.forEach((elev, index) => {
    const pctX = index / (elevations.length - 1);
    const pctY = (elev - minElev) / elevSpan;
    const px = pctX * w;
    const py = pctY * h;

    if(index === 0) {
      ctx.lineTo(0, py);
    } else {
      ctx.lineTo(px, py);
    }
  })
  ctx.lineTo(w, 0);
  ctx.lineTo(0, 0);
  ctx.lineTo(0, (elevations[0] - minElev) / elevSpan);
  ctx.closePath();
  ctx.fill();

  if(aiPositions) {
    ctx.strokeStyle = ai_color;
    ctx.beginPath();
    aiPositions.forEach((positionPct) => {
      assert2(positionPct >= -0.001 && positionPct <= 1.01);
      ctx.moveTo(positionPct*w, 0);
      ctx.lineTo(positionPct*w, h);
    })
    ctx.stroke();
  }
  if(humanPositions) {
    ctx.strokeStyle = human_color;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    humanPositions.forEach((positionPct) => {
      assert2(positionPct >= 0 && positionPct <= 1.01);
      ctx.moveTo(positionPct*w, 0);
      ctx.lineTo(positionPct*w, h);
    })
    ctx.stroke();
  }
  if(localPositionPct) {
    assert2(localPositionPct >= 0 && localPositionPct <= 1.01);
    ctx.strokeStyle = local_color;
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.moveTo(localPositionPct*w, 0);
    ctx.lineTo(localPositionPct*w, h);
    ctx.stroke();
  }
}

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
    drawMinimap(canvas, elevations, w, h, race.getLength()*0.01);

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
