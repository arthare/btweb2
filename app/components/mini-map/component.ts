import Component from '@ember/component';
import { ServerHttpGameListElement } from 'bt-web2/server-client-common/communication';
import { human_color, local_color, ai_color } from '../main-map/component';
import { assert2 } from 'bt-web2/server-client-common/Utils';

export function drawMinimap(canvas:HTMLCanvasElement, elevations:number[], w:number, h:number, localPositionPct?:number, humanPositions?:number[], aiPositions?:number[]) {
  
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

  const elevSpan = maxElev - minElev;
  
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
      assert2(positionPct >= 0 && positionPct <= 1.0);
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
      assert2(positionPct >= 0 && positionPct <= 1.0);
      ctx.moveTo(positionPct*w, 0);
      ctx.lineTo(positionPct*w, h);
    })
    ctx.stroke();
  }
  if(localPositionPct) {
    assert2(localPositionPct >= 0 && localPositionPct <= 1.0);
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
  race: <ServerHttpGameListElement|null>null,
}) {
  // normal class body definition here
  didInsertElement() {
    // we need to draw a minimap for this guy

    const race:ServerHttpGameListElement|null = this.get('race');
    if(!race) {
      throw new Error("you gotta provide your minimap a race!");
    }
    const canvas = document.createElement('canvas');
    canvas.width = this.element.clientWidth;
    canvas.height = this.element.clientHeight;

    const w = this.element.clientWidth;
    const h = this.element.clientHeight;
    drawMinimap(canvas, race.elevations, w, h);

    const png = canvas.toDataURL();
    const img = this.element.querySelector('img');
    if(img) {
      img.src = png;
    }
    
  }
};
