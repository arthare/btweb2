export function assert2(f:any, reason?:string) {
  if(!f) {
    const err = new Error();
    
    console.error("Assert failure: ", reason, err && err.stack && err.stack.toString && err.stack.toString());
    debugger;
  }
}

export function formatSecondsHms(seconds:number) {
  if(seconds < 60) {
    return seconds.toFixed(1) + 's';
  } else if(seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ${(seconds % 60).toFixed(1)}s`;
  } else {
    const h = Math.floor(seconds / 3600);
    seconds -= h*3600;
    const m = Math.floor(seconds / 60);
    seconds -= m*60;

    return `${h}h ${m}m ${seconds.toFixed(1)}s`;
  }
}

export function formatDisplayDistance(meters:number):string {
  if(meters < 500) {
    return meters.toFixed(0) + 'm';
  } else {
    return (meters/1000).toFixed(2) + 'km';
  }
}