import Route from '@ember/routing/route';

export default class StravaAuth extends Route.extend({
  // anything which *must* be merged to prototype here
}) {
  // normal class body definition here
  beforeModel() {
    // http://localhost:4200/bt-web/strava-auth?code8e0475516ae3c5196cd8c7d2ca3b91e67b9f7511
    const q = window.location.search.replace('?', '');
    const split = q.split('&');
    const debuggin = window.location.search.includes('stayOpen');
    split.forEach((val) => {
      const split2 = val.split('=');
      const key = decodeURIComponent(split2[0]);
      const value = decodeURIComponent(split2[1]);
      console.log(key, " = " , value);

      if(key === "code") {
        document.cookie = `strava-auth-code=${value}`;

        debugger;
        if(window.opener) {
          const msg = JSON.stringify({
            stravaAuthCode:value,
          });

          const targetOrigin = debuggin ? "http://localhost:4200" : "https://www.tourjs.ca";
          console.log("posting auth code " + value + " to opener", targetOrigin);
          window.opener.postMessage(msg, targetOrigin);
        }
      }
    });

    if(debuggin) {

    } else {
      //window.close();
    }
  }
}
