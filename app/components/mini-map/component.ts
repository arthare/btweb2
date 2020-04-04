import Component from '@ember/component';
import { ServerHttpGameListElement } from 'bt-web2/server-client-common/communication';

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
    const w = this.element.clientWidth;
    const h = this.element.clientHeight;
    canvas.width = this.element.clientWidth;
    canvas.height = this.element.clientHeight;

    const ctx = canvas.getContext('2d');
    if(ctx) {

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

      
      let maxElev:number = race.elevations[0];
      let minElev:number = race.elevations[0];
      race.elevations.forEach((elev) => {
        if(!maxElev || elev > maxElev) {
          maxElev = elev;
        }
        if(!minElev || elev < minElev) {
          minElev = elev;
        }
      })

      const elevSpan = maxElev - minElev;
      
      ctx.beginPath();
      ctx.fillStyle = grassGradient;
      const elevs = [minElev, ...race.elevations, maxElev];
      elevs.forEach((elev, index) => {
        const pctX = index / (race.elevations.length - 1);
        const pctY = (elev - minElev) / elevSpan;
        const px = pctX * w;
        const py = pctY * h;

        if(index === 0) {
          ctx.moveTo(0, py);
        } else {
          ctx.lineTo(px, py);
        }
      })
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
      

      const png = canvas.toDataURL();
      const img = this.element.querySelector('img');
      if(img) {
        img.src = png;
      }
    }
    
  }
};
