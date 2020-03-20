export function assert2(f:any, reason?:string) {
  if(!f) {
    console.error("Assert failure: ", reason, new Error().stack?.toString());
    debugger;
  }
}