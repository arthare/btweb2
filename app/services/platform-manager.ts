import Service from '@ember/service';
import { RideMapElevationOnly, RideMapPartial } from 'bt-web2/server-client-common/RideMap';
import { assert2 } from 'bt-web2/server-client-common/Utils';

export interface StravaMapSummary {
  id: number;
  resource_state: number;
  name: string; // "Año Nuevo to Davenport Rollers"
  activity_type: string; // "Ride"
  distance: number;
  average_grade: number;
  maximum_grade: number;
  elevation_high: number;
  elevation_low: number;
  start_latlng: [number, number];
  end_latlng: [number, number];
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
  climb_category: number;
  city: string;
  state: string;
  country: string;
  private: boolean; // false
  hazardous: boolean; // false
  starred: boolean; // true
  starred_date: string; // "2018-03-27T23:09:48Z"
}

function getCookie(cookieKey:string):Promise<string> {
  console.log("they're looking for ", cookieKey);
  return new Promise((resolve) => {
    const allCookies = document.cookie;
    const split = allCookies.split(';');
    console.log("split = ", split);
    split.forEach((keyValue) => {
      const split2 = keyValue.split('=');
      const key = split2[0].trim();
      const value = split2[1].trim();
      console.log("key, vlaue = ", key, value);
  
      if(key === cookieKey && value && value.length > 0) {
        resolve(value);
        return;
      }
    });

    resolve(); // no cookie
  })
}
function setCookie(key:string, value:string, maxAgeSeconds:number):void {

  let values=  [`${key}=${value}`];
  if(maxAgeSeconds > 0) {
    values.push(`Max-Age=${maxAgeSeconds}`);
  }

  const finalSet = values.join(';');
  console.log("applying ", finalSet, " to cookie");
  document.cookie = values.join(';');
}

class StravaMapInterpreter extends RideMapPartial {

  _distance:number[];
  _elevation:number[];

  constructor(input:{distance:any, altitude:any}) {
    super();
    this._distance = input.distance.data;
    this._elevation = input.altitude.data;
    assert2(this._distance && this._elevation);
  }

  getElevationAtDistance(meters: number): number {
    if(meters <= 0) {
      return this._elevation[0];
    } else if(meters >= this._distance[this._distance.length-1]) {
      return this._elevation[this._elevation.length - 1];
    } else {
      for(var x = 0;x < this._distance.length - 1; x++) {
        const distNow = this._distance[x];
        const distNext = this._distance[x+1];
        if(meters >= distNow && meters <= distNext) {
          const offset = meters - distNow;
          const span = distNext - distNow;
          const pct = offset / span;
          const elevThis = this._elevation[x];
          const elevNext = this._elevation[x+1];
          return pct*elevNext + (1-pct)*elevThis;
        }
      }
      assert2(false, "We shouln't get here - we should always find a distance");
      return 0;
    }
  }
  getLength(): number {
    return this._distance[this._distance.length - 1];
  }
  
}


export default class PlatformManager extends Service.extend({
  // anything which *must* be merged to prototype here
}) {
  // normal class body definition here
  
  _doSignIn(url:string) {
    return new Promise((resolve, reject) => {
      const windowRef = window.open(url, "_blank");
      if(!windowRef) {
        return;
      }      

      const interval = setInterval(() => {

        if(windowRef.closed) {
          // they closed the window, but we haven't gotten the new authcode yet
          return getCookie('strava-auth-code').then((authCode) => {
            console.log("getCookie got ", authCode);
            console.log("document cookie is ", document.cookie);
            setCookie('strava-auth-code', "", 3600);
            if(authCode) {
              resolve(authCode);
            } else {
              reject("Window closed, but no auth code gotten")
            }
            clearInterval(interval);
          });
        }
      }, 750);
      
    }).then((authCode) => {
      // now we have to exchange this for a access token
      console.log("gotta exchange ", authCode, " for access token");
      const params = {
        client_id: 3055,
        client_secret: 'a14312f43d3000a65391c6c718d5a8b8a3f13434',
        code: authCode,
        grant_type: 'authorization_code',
      };
      return fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      }).then((fetchResp) => {
        return fetchResp.json();
      }).then((fetchRespJson) => {
        
        setCookie('strava-access-token', fetchRespJson.access_token, fetchRespJson.expires_in);
        return fetchRespJson.access_token;
      })


    })
  }

  getStravaMapList():Promise<StravaMapSummary[]> {
    return this.getStravaAccessToken().then((accessToken) => {
      return fetch(`https://www.strava.com/api/v3/segments/starred?access_token=${accessToken}`)
    }).then((stravaResult) => {
      return stravaResult.json();
    }).then((stravaJson) => {
      return stravaJson;
    });
  }
  getStravaMapDetails(stravaMapSummary:StravaMapSummary):Promise<RideMapElevationOnly> {
    
    return this.getStravaAccessToken().then((accessToken) => {
      return fetch(`https://www.strava.com/api/v3/segments/${stravaMapSummary.id}/streams?keys=altitude,distance&key_by_type=true&access_token=${accessToken}`);
    }).then((mapDetails) => {
      return mapDetails.json();
    }).then((mapDetailsJson:any) => {
      return new StravaMapInterpreter(mapDetailsJson);
    });
  }


  getStravaAccessToken():Promise<string> {
    return new Promise((resolve, reject) => {
      getCookie('strava-access-token').then((currentAuthCode) => {
        console.log("current auth code ", currentAuthCode);
        if(currentAuthCode) {
          resolve(currentAuthCode);
        } else {
          // we'll need to trigger an iframe to sign in
          const clientId = '3055';
          const redirectUri = window.location.hostname.includes('localhost') ? 'https://www.tourjs.ca/strava-auth?stayOpen=1' : 'https://www.tourjs.ca/strava-auth'
          const targetUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=read`;
          //const targetUrl = `localhost:4200/bt-web/strava-auth?code=1234`;
          console.log("going to ", targetUrl);
          return this._doSignIn(targetUrl).then((authCode:string) => {
            console.log("auth complete: ", authCode);
  
            resolve(authCode);
          }).catch((failure:any) => {
            reject(failure);
          });
        }
      })
      
    });
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'platform-manager': PlatformManager;
  }
}
