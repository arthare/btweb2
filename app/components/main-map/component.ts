import Component from '@ember/component';
import { RaceState } from 'bt-web2/server-client-common/RaceState';
import { RideMap } from 'bt-web2/server-client-common/RideMap';
import setupContextWithTheseCoords from 'bt-web2/pojs/setupContextWithTheseCoords';
import { UserTypeFlags } from 'bt-web2/server-client-common/User';

function paintCanvasFrame(canvas:HTMLCanvasElement, raceState:RaceState, time:number) {
  // ok, all we have to do is paint the map!  How hard can it be?

  const tmNow = new Date().getTime();
  const ctx = canvas.getContext('2d');
  if(!ctx) {
    return;
  }
  const w = canvas.width;
  const h = canvas.height;

  ctx.resetTransform();
  const skyGradient = ctx.createLinearGradient(0,0,w,h);
  skyGradient.addColorStop(0, "#35D6ed");
  skyGradient.addColorStop(1, "#c9f6ff");
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0,0,w,h);

  // grass gradient
  const grassGradient = ctx.createLinearGradient(0,0,w,h);
  grassGradient.addColorStop(0, "#709b40");
  grassGradient.addColorStop(1, "#285028");

  const map:RideMap = raceState.getMap();
  let {maxElev, minElev, minDist, maxDist} = map.getBounds();
  
  let localUser = raceState.getLocalUser();
  if(!localUser) {
    throw new Error("Trying to display a map without a local user?");
  }

  let elevs:number[] = [];
  let dists:number[] = [];
  // let's sample an appropriate # of elevations given our screen size
  const nElevsToSample = Math.floor(w / 3);
  minDist = localUser.getDistance() - 100;
  maxDist = localUser.getDistance() + 100;
  for(var x = 0; x <= nElevsToSample; x++) {
    const pct = x / nElevsToSample;

    const dist = minDist + pct*(maxDist-minDist);
    dists.push(dist);
    elevs.push(map.getElevationAtDistance(dist));
  }



  const aspectRatioOfScreen = w / h;

  const elevSpan = (maxDist - minDist) / aspectRatioOfScreen;
  const userElev = map.getElevationAtDistance(localUser.getDistance());

  setupContextWithTheseCoords(canvas, ctx, minDist, userElev + elevSpan / 2, maxDist, userElev - elevSpan/2);
  
  ctx.beginPath();
  ctx.fillStyle = grassGradient;
  elevs.forEach((elev, index) => {
    if(index === 0) {
      ctx.moveTo(dists[index], elev);
    } else {
      ctx.lineTo(dists[index], elev);
    }
  })
  ctx.lineTo(maxDist, userElev - elevSpan / 2);
  ctx.lineTo(minDist, userElev - elevSpan / 2);
  ctx.fill();

  // ok, gotta draw the cyclists
  const userProvider = raceState.getUserProvider();
  const users = userProvider.getUsers(tmNow);
  users.forEach((user) => {
    const dist = user.getDistance();
    const elev = map.getElevationAtDistance(dist);

    const typeFlags = user.getUserType();
    const isLocal = typeFlags & UserTypeFlags.Local;
    const isHuman = !(typeFlags & UserTypeFlags.Ai);
    if(isLocal && isHuman) {
      const sz = 3;
      ctx.fillStyle = "#FFF";
      ctx.fillRect(dist-sz / 2,elev,sz,sz);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 0.1;
      ctx.strokeRect(dist-sz/2,elev,sz,sz);
    } else {
      let sz = 2;
      let fillColor = 'lightpink';
      let borderColor = 'black';
      if(isHuman) {
        sz = 2.5;
        fillColor = 'lightpink';
        borderColor = 'black';
      } else {
        sz = 2;
        fillColor = 'black';
        borderColor = 'white';
      }
      ctx.fillStyle = fillColor;
      ctx.fillRect(dist-sz / 2,elev,sz,sz);
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 0.1;
      ctx.strokeRect(dist-sz/2,elev,sz,sz);
    }
  })

}

export default class MainMap extends Component.extend({
  // anything which *must* be merged to prototype here
  classNames: ['main-map__container'],
  tagName: 'canvas',

  raceState: <RaceState|null>null,
}) {
  // normal class body definition here
  didInsertElement() {
    const canvas:HTMLCanvasElement = <HTMLCanvasElement>this.element;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w;
    canvas.height = h;
    //canvas.height = canvas.clientHeight;
    console.log("canvas set up to be ", canvas.width, " x ", canvas.height);

    const handleAnimationFrame = (time:number) => {
      const raceState:RaceState|null = this.get('raceState');
      if(raceState) {
        
        raceState.tick(new Date().getTime());
        paintCanvasFrame(canvas, raceState, time);

        requestAnimationFrame(handleAnimationFrame);
      } else {
        throw new Error("No race state available?");
      }

    }

    requestAnimationFrame(handleAnimationFrame);
  }
};
