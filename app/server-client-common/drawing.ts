import { Layer } from "./DecorationFactory";
import { DecorationState } from "./DecorationState";
import { RaceState } from "./RaceState";
import { RideMap } from "./RideMap";
import setupContextWithTheseCoords from "./setupContextWithTheseCoords";
import { DEFAULT_HANDICAP_POWER, User, UserTypeFlags } from "./User";
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


class DisplayUser {
  constructor(user:User) {
    this.distance = user.getDistance();
    this.image = null;
    this.loadingImage = false;
  }
  public distance:number = 0;
  public image:HTMLImageElement[]|null = null;
  public loadingImage:boolean = false;
  public crankPosition:number = 0;
  public heartPosition:number = 0;
}

export class PaintFrameState {
  public userPaint:Map<number,DisplayUser> = new Map();

  public defaultAiImage:HTMLImageElement[]|null = null;
  public loadingAi = false;
}

export function doPaintFrameStateUpdates(rootResourceUrl:string, tmNow:number, dtSeconds:number, raceState:RaceState, paintState:PaintFrameState) {
  const users = raceState.getUserProvider().getUsers(tmNow);

  if(!paintState.defaultAiImage && !paintState.loadingAi) {
    paintState.loadingAi = true;


    const aiSrc = ['assets/cyclist-spritesheet.webp'];
    const whichOne = aiSrc[Math.floor(Math.random()*aiSrc.length) % aiSrc.length];
    
    const imgAi = document.createElement('img');
    imgAi.onload = () => {

      // now we have to divvy this up into 8 actual images
      let subImages = [];
      for(var x = 0;x < 8; x++) {
        const myCanvas = document.createElement('canvas');
        const myImage = document.createElement('img');
        myCanvas.width = 111;
        myCanvas.height = 117;
        const ctx = myCanvas.getContext('2d');
        if(ctx) {
          ctx.drawImage(imgAi, 0, x*117, 111, 117, 0, 0, 111, 117);
          myImage.src = myCanvas.toDataURL('png');
          subImages.push(myImage);
        }
        

      }

      paintState.defaultAiImage = subImages;
      paintState.loadingAi = false;
    }
    imgAi.src = rootResourceUrl + whichOne;
  }

  let needToLoad = users.find((user) => user.getImage() && !paintState.userPaint.get(user.getId())?.image);
  let anyUsersNeedLoading = false;
  let anyUsersLoading = false;
  users.forEach((user) => {
    const paintUser = paintState.userPaint.get(user.getId()) || new DisplayUser(user);

    const rpm = Math.random()*20 + 80;
    const rps = rpm/60;
    paintUser.crankPosition += rps*dtSeconds;
    while(paintUser.crankPosition >= 1.0) {
      paintUser.crankPosition -= 1.0;
    }

    const bpm = user.getLastHrm(tmNow);
    const bps = bpm / 60;
    paintUser.heartPosition += bps*dtSeconds;
    while(paintUser.heartPosition >= 1.0) {
      paintUser.heartPosition -= 1.0;
    }
    

    if(!paintUser.image && user.getImage()) {
      anyUsersNeedLoading = true;
    }
    if(paintUser.loadingImage && user.getImage()) {
      anyUsersLoading = true;
    }

    paintState.userPaint.set(user.getId(), paintUser);
  })

  if(!anyUsersLoading && anyUsersNeedLoading) {
    // some users need to load!
    if(needToLoad) {
      const imageBase64 = needToLoad.getImage();
      const paintUser = paintState.userPaint.get(needToLoad.getId());
      
      if(paintUser && imageBase64) {
        paintUser.loadingImage = true;
        const img = document.createElement('img');
        img.onload = () => {
          paintUser.loadingImage = false;
          paintUser.image = [img];
        }
        img.src = imageBase64;
      }
    }
  }
}

export function paintCanvasFrame(canvas:HTMLCanvasElement, raceState:RaceState, time:number, decorationState:DecorationState, dt:number, paintState:PaintFrameState) {
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
  
  const userProvider = raceState.getUserProvider();
  const users = userProvider.getUsers(tmNow);



  const smoothMix = 0.33;

  let cHumans = 0;
  users.forEach((user) => {

    if(!(user.getUserType() & UserTypeFlags.Ai)) {
      cHumans++;
    }

    if(paintState.userPaint.has(user.getId())) {
      const actualPos = user.getDistance();
      const displayUser = paintState.userPaint.get(user.getId()) || new DisplayUser(user);
      const paintPos = displayUser.distance;
      displayUser.distance = smoothMix*paintPos + (1-smoothMix)*actualPos;
      paintState.userPaint.set(user.getId(), displayUser);
    } else {
      const displayUser = new DisplayUser(user);
      paintState.userPaint.set(user.getId(), displayUser);
    }
  })

  const map:RideMap = raceState.getMap();
  let elevs:number[] = [];
  let dists:number[] = [];
  let {maxElev, minElev, minDist, maxDist} = map.getBounds();
  // let's sample an appropriate # of elevations given our screen size
  const nElevsToSample = Math.floor(w / 3);
  

  const localUserPaint = paintState.userPaint.get(localUser.getId()) || new DisplayUser(localUser);
  let localUserDistance = localUserPaint.distance || localUser.getDistance();
  let localUserSlope = map.getSlopeAtDistance(localUserDistance);
  let localUserAngleRadians = -Math.atan(localUserSlope);

  // aim to show more distance when we're going up or down big hills so phone people still have situational awareness
  const distToShow = (1+Math.abs(localUserSlope)*2)*(w/1920)*150;

  minDist = localUserDistance - distToShow/2;
  maxDist = localUserDistance + distToShow/2;
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
  setupContextWithTheseCoords(canvas, ctx, minDist, userElev + elevSpan / 2, maxDist, userElev - elevSpan/2, localUserAngleRadians);
  

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


  const drawAUser = (user:User) => {
    const displayUser:DisplayUser|undefined = paintState.userPaint.get(user.getId());
    const dist = displayUser?.distance || user.getDistance();
    const elev = map.getElevationAtDistance(dist);

    const typeFlags = user.getUserType();
    const isLocal = typeFlags & UserTypeFlags.Local;
    const isHuman = !(typeFlags & UserTypeFlags.Ai);
    let userImage = displayUser?.image;
    let fillColor = 'lightpink';
    let borderColor = 'black';
    let sz = 2;
    let nameToDraw;
    let chatToDraw:null|{chat:string,tmWhen:number} = null;
    if(isLocal && isHuman) {
      sz = 3;
      fillColor = 'white';
      borderColor = 'black';
      nameToDraw = user.getName();
    } else if(isHuman) {
      sz = 2.5;
      fillColor = human_color;
      borderColor = 'black';
      nameToDraw = user.getName();
      chatToDraw = user.getLastChat(tmNow);
    } else {
      // ai
      sz = 2;
      fillColor = ai_color;
      borderColor = 'transparent';
      userImage = paintState.defaultAiImage;

      if(cHumans === 1) {
        // if there's nobody around, then let's draw this AIs name
        nameToDraw = user.getName();
        fillColor = 'blue';
      }
    }
    
    const heartImage = decorationState.getImage("heart");
    { // actually doing the user draw
      const before = ctx.getTransform();
      const slope = map.getSlopeAtDistance(user.getDistance());
      const angleDegrees = -Math.atan(slope);


      ctx.translate(dist-sz / 2,elev + sz/2);
      ctx.rotate(-angleDegrees);
      ctx.scale(1,-1);

      if(displayUser && userImage) {

        if(userImage.length === 1) {
          ctx.drawImage(userImage[0], -sz / 2, -sz / 2, sz,sz);
        } else {
          assert2(displayUser.crankPosition >= 0 && displayUser.crankPosition < 1);
          const ix = Math.floor(displayUser.crankPosition * userImage.length);
          ctx.drawImage(userImage[ix], -sz / 2, -sz / 2, sz,sz);
        }
        
      } else {
        // no image yet - let's draw a filler
        ctx.fillStyle = fillColor;
        ctx.fillRect(-sz / 2,-sz / 2,sz,sz);
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 0.1;
        ctx.strokeRect(-sz/2,-sz / 2,sz,sz);
      }

      // ok let's draw a name
      if(displayUser && nameToDraw) {
        const before2 = ctx.getTransform();
        ctx.font = `${sz}px Arial`;

        let xShift = 0;
        let yShift = 0;
        
        let outlineColor = 'black';
        const handicapRatio = user.getLastPower() / user.getHandicap();
        if(handicapRatio > 1.3) {
          outlineColor = 'red';
        } else if(handicapRatio < 0.5) {
          outlineColor = 'green';
        }


        if(handicapRatio > 1.6) {
          xShift = Math.random() * 0.6;
          yShift = Math.random() * 0.6;
        }

        ctx.strokeStyle = outlineColor;
        ctx.fillStyle = fillColor;
        ctx.lineWidth = 0.3;
        ctx.translate(0 + xShift, -sz/2 + yShift);
        ctx.rotate(-Math.PI/3);
        
        if(heartImage && user.getLastHrm(tmNow) > 0 && localUser && localUser?.getLastHrm(tmNow) > 0) {
          // the local user has a HRM, so they get to see other user's BPM data
          //ctx.fillRect(0, -sz, sz,sz);
          assert2(displayUser?.heartPosition >= 0 && displayUser?.heartPosition <= 1);

          const heartBeatPosition = Math.sqrt(1 - Math.pow(2*displayUser.heartPosition - 1,2));
          const heartSpan = 1.5;
          const heartMod = (1-heartSpan/2) + heartBeatPosition*heartSpan;
          const finalHeartSz = heartMod * sz; 
          ctx.drawImage(heartImage, -finalHeartSz/2 + sz/2, -sz/2 - finalHeartSz/2, finalHeartSz, finalHeartSz)
          ctx.translate(sz*1.25,0);
        }

        if(chatToDraw) {
          const secondsSinceChat = (tmNow - chatToDraw.tmWhen) / 1000;
          const chatSize = 3*((Math.log(secondsSinceChat) - secondsSinceChat + 7.7) / 6.7);
          let oldFont = ctx.font;
          let oldStrokeStyle = ctx.strokeStyle;

          ctx.strokeStyle = 'black';
          ctx.font = `${chatSize}px Arial`;
          ctx.strokeText(chatToDraw.chat, 0, -chatSize);
          ctx.fillText(chatToDraw.chat, 0, -chatSize);

          ctx.strokeStyle = oldStrokeStyle;
          ctx.font = oldFont;

        }
        ctx.strokeText(nameToDraw, 0, 0);
        ctx.fillText(nameToDraw, 0, 0);

        

        ctx.setTransform(before2);
      }

      

      ctx.setTransform(before);
      
      if(user.getUserType() & UserTypeFlags.Local) {
        // a local guy!
        const draftStats = user.getLastWattsSaved();

        if(draftStats.pctOfMax > 0) {
          // a local guy!  let's draw their drafting status
          const myDist = user.getDistance();
          const deltaAhead = draftStats.fromDistance - myDist;
          const pct = draftStats.pctOfMax;
          const wattsSaved = draftStats.watts * (user.getHandicap() / DEFAULT_HANDICAP_POWER);
  
          ctx.lineWidth = 0.8 * pct;
          ctx.strokeStyle = `rgba(255,255,255,${pct})`;
          ctx.beginPath();
  
          ctx.moveTo(dist,map.getElevationAtDistance(dist) - 0.4);
          ctx.lineTo(dist+deltaAhead,map.getElevationAtDistance(dist+deltaAhead) - 0.4);
          ctx.stroke();

          const before = ctx.getTransform();
          ctx.scale(1,-1);
          ctx.fillText(wattsSaved.toFixed(0)+'W', (dist+deltaAhead),-(map.getElevationAtDistance(dist+deltaAhead) - 2));
          ctx.setTransform(before);

        }
      }
    }
    
  }

  // ok, gotta draw the cyclists
  
  const ais = users.filter((user) => {
    return user.getUserType() & UserTypeFlags.Ai;
  });
  const humansNotLocal = users.filter((user) => {
    return !(user.getUserType() & UserTypeFlags.Ai) && !(user.getUserType() & UserTypeFlags.Local);
  })
  const localUsers = users.filter((user) => {
    return user.getUserType() & UserTypeFlags.Local;
  })
  ais.forEach(drawAUser);
  humansNotLocal.forEach(drawAUser);
  localUsers.forEach(drawAUser);



}