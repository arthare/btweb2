export default config;

/**
 * Type declarations for
 *    import config from './config/environment'
 *
 * For now these need to be managed by the developer
 * since different ember addons can materialize new entries.
 */
declare const config: {
  environment: any;
  modulePrefix: string;
  podModulePrefix: string;
  locationType: string;
  rootURL: string;
  apiRoot: string;
  gameServerHost: string;
};

interface DebugLocation {
  tmNow:number;
  tmOfPend:number;
  lastPhysics:number;
  lastNetwork:number;
  lastDraw:number;
}

declare global {
  interface Window {
    _: any,
    assert2: Function;
    localLocations: DebugLocation[];
    pending:DebugLocation;
    tick: (tmOfPend:number)=>void;
  }

}
declare function assert2():void;