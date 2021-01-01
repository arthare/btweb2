import { assert2 } from "./Utils";

export const local_color = 'white';
export const human_color = 'lightpink';
export const ai_color = 'black';

export interface DrawMinimapParameters {
  ctx:any;
  elevations:number[];
  w:number;
  h:number;
  minElevSpan:number;
  localPositionPct?:number;
  humanPositions?:number[];
  aiPositions?:number[];
}

export function drawMinimap(params:DrawMinimapParameters) {
  
  const {
    ctx,
    elevations,
    w,
    h,
    minElevSpan,
    localPositionPct,
    humanPositions,
    aiPositions,
  } = params;

  if(!ctx) {
    return;
  }
  // do the sky
  const skyBasic = '#c9f6ff';
  ctx.fillStyle = skyBasic;
  ctx.fillRect(0,0,w,h);
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
