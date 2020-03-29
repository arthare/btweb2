export function assert2(f:any, reason?:string) {
  if(!f) {
    console.error("Assert failure: ", reason, new Error().stack?.toString());
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