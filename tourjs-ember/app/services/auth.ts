import Service from '@ember/service';
import { TourJsSignin } from 'bt-web2/tourjs-client-shared/signin-client';
import auth0 from 'npm:auth0-js';

export default class Auth extends Service.extend({
  // anything which *must* be merged to prototype here
}) {
  // normal class body definition here
  auth:TourJsSignin = new TourJsSignin();

  constructor() {
    super(...arguments);
    console.log(auth0);
    console.log("building auth service");
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'auth': Auth;
  }
}
