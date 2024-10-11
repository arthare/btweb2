import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { createDrawer } from "../tourjs-client-lib/drawing-factory";
import { ServerHttpGameListElement, SimpleElevationMap } from "../tourjs-api-lib/communication";
import { RideMapElevationOnly } from "../tourjs-api-lib/RideMap";

import './RaceMini.scss';

export function RaceMapStatic(props:{map:RideMapElevationOnly, className:string}) {
  
  let imgRef = useRef<HTMLImageElement>();
  let [dataUri, setDataUri] = useState<string>('');

  useEffect(() => {
    
    if(!props.map) {
      throw new Error("you gotta provide your minimap a race!");
    }
    if(!imgRef || !imgRef.current) {
      return;
    }
    const canvas = document.createElement('canvas');

    const w = imgRef.current.clientWidth;
    const h = imgRef.current.clientHeight;

    canvas.width = w;
    canvas.height = h;


    const elevations = [];
    const len = props.map.getLength();
    for(var pct = 0; pct <= 1.0; pct += 0.005) {
      elevations.push(props.map.getElevationAtDistance(pct*len));
    }

    const ctx = canvas.getContext('2d');

    const drawer = createDrawer('2d');
    drawer.drawMinimap({ ctx, 
                   elevations, 
                   w, 
                   h, 
                   minElevSpan: props.map.getLength()*0.01,});

    const png = canvas.toDataURL();
    setDataUri(png);

  }, [props.map, imgRef.current?.clientWidth]);


  return (<img className={`RaceMapStatic__Img ${props.className}`} ref={imgRef} src={dataUri} />)

}