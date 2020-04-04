import Component from '@ember/component';
import { RaceState } from 'bt-web2/server-client-common/RaceState';
import { RideMap, RideMapElevationOnly } from 'bt-web2/server-client-common/RideMap';
import setupContextWithTheseCoords from 'bt-web2/pojs/setupContextWithTheseCoords';
import { UserTypeFlags } from 'bt-web2/server-client-common/User';
import { DecorationState } from './DecorationState';
import { DecorationFactory, ThemeConfig, Layer } from './DecorationFactory';

function paintCanvasFrame(canvas:HTMLCanvasElement, raceState:RaceState, time:number, decorationState:DecorationState, dt:number) {
  // ok, all we have to do is paint the map!  How hard can it be?

  const tmNow = new Date().getTime();
  const ctx = canvas.getContext('2d');
  if(!ctx) {
    return;
  }
  const w = canvas.width;
  const h = canvas.height;

  let localUser = raceState.getLocalUser();
  if(!localUser) {
    throw new Error("Trying to display a map without a local user?");
  }

  const map:RideMap = raceState.getMap();
  let elevs:number[] = [];
  let dists:number[] = [];
  let {maxElev, minElev, minDist, maxDist} = map.getBounds();
  // let's sample an appropriate # of elevations given our screen size
  const nElevsToSample = Math.floor(w / 3);
  minDist = localUser.getDistance() - 50;
  maxDist = localUser.getDistance() + 50;
  for(var x = 0; x <= nElevsToSample; x++) {
    const pct = x / nElevsToSample;

    const dist = minDist + pct*(maxDist-minDist);
    dists.push(dist);
    elevs.push(map.getElevationAtDistance(dist));
  }
  decorationState.tick(dt, minDist, maxDist);

  const aspectRatioOfScreen = w / h;

  const elevSpan = (maxDist - minDist) / aspectRatioOfScreen;
  const userElev = map.getElevationAtDistance(localUser.getDistance());

  ctx.resetTransform();
  setupContextWithTheseCoords(canvas, ctx, minDist, userElev + elevSpan / 2, maxDist, userElev - elevSpan/2);



  // time to start drawing!
  const skyGradient = ctx.createLinearGradient(0,0,w,h);
  skyGradient.addColorStop(0, "#35D6ed");
  skyGradient.addColorStop(1, "#c9f6ff");
  ctx.fillStyle = skyGradient;
  ctx.fillRect(minDist,userElev - elevSpan / 2,maxDist-minDist,elevSpan);

  // draw things that go on top of the sky, but behind the grass
  decorationState.draw(ctx, Layer.FarScenery);
  decorationState.draw(ctx, Layer.NearSky);
  decorationState.draw(ctx, Layer.NearRoadside);

  // grass gradient
  const grassGradient = ctx.createLinearGradient(0,0,w,h);
  grassGradient.addColorStop(0, "#709b40");
  grassGradient.addColorStop(1, "#285028");
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

  decorationState.draw(ctx, Layer.Underground);

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

const defaultThemeConfig:ThemeConfig = {
  name: "Default Theme",
  decorationSpecs: [
    {
      name: "Clouds",
      minDimensions: {x:8,y:8},
      maxDimensions: {x:10,y:10},
      minAltitude: 12,
      maxAltitude: 22,
      imageUrl: ['assets/cloud1.png', 'assets/cloud2.png'],
      layer: Layer.NearSky,
      frequencyPerKm:50,
    }, {
      name: "Grasses",
      minDimensions: {x:1,y:1},
      maxDimensions: {x:1.2,y:1.2},
      minAltitude: -16,
      maxAltitude: -2,
      imageUrl: ['assets/grass2.png', 
                'assets/grass3.png', 
                'assets/grass4.png',
                'assets/grass5.png',
                'assets/grass6.png',
                'assets/grass7.png',
              ],
      layer: Layer.Underground,
      frequencyPerKm:1000,
    }, {
      name: "Stores",
      minDimensions: {x:4,y:4},
      maxDimensions: {x:4,y:4},
      minAltitude: 2.0,
      maxAltitude: 2.0,
      imageUrl: ['assets/store1.webp', 
                'assets/store2.webp', 
              ],
      layer: Layer.NearRoadside,
      frequencyPerKm:20,
    }
  ]
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
    if(!canvas.parentElement) {
      return;
    }
    canvas.width = canvas.parentElement?.clientWidth;
    canvas.height = canvas.parentElement?.clientHeight;
    //canvas.height = canvas.clientHeight;
    console.log("canvas set up to be ", canvas.width, " x ", canvas.height);

    const raceState:RaceState|null = this.get('raceState');
    if(!raceState) {
      return;
    }
    const decorationFactory = new DecorationFactory(defaultThemeConfig);
    const decorationState = new DecorationState(raceState?.getMap(), decorationFactory);

    let lastTime = 0;
    const handleAnimationFrame = (time:number) => {
      if(raceState) {
        
        let dt = 0;
        if(lastTime) {
          dt = (time - lastTime) / 1000.0;
        }
        lastTime = time;

        raceState.tick(new Date().getTime());
        paintCanvasFrame(canvas, raceState, time, decorationState, dt);

        requestAnimationFrame(handleAnimationFrame);
      } else {
        throw new Error("No race state available?");
      }

    }

    requestAnimationFrame(handleAnimationFrame);
  }
};
