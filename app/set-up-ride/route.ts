import Route from '@ember/routing/route';
import ENV from 'bt-web2/config/environment';
import { ServerHttpGameList, ServerHttpGameListElement } from 'bt-web2/server-client-common/communication';

export function apiGet(endPoint:string, data?:any):Promise<any> {
  const apiRoot:string = ENV.apiRoot;
  const slash = endPoint[0] === '/' || apiRoot[apiRoot.length - 1] === '/' ? '' : '/';

  let queries = '?';
  for(var key in data) {
    queries += key + '=' + encodeURIComponent(data[key]) + '&';
  }

  return fetch(apiRoot + slash + endPoint + queries, {
    method: 'GET',
  }).then((response) => {
    return response.json();
  })
}
export function apiPost(endPoint:string, data?:any):Promise<any> {
  const apiRoot:string = ENV.apiRoot;
  const slash = endPoint[0] === '/' || apiRoot[apiRoot.length - 1] === '/' ? '' : '/';

  return fetch(apiRoot + slash + endPoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data && JSON.stringify(data),
  }).then((response) => {
    return response.json();
  })
}

export function refreshRaceList() {
  return apiGet('race-list').then((result:ServerHttpGameList) => {
    result.races = result.races.sort((a, b) => {
      return a.tmScheduledStart < b.tmScheduledStart ? -1 : 1;
    })
    return result;
  })
}

export default class SetUpRide extends Route.extend({
  // anything which *must* be merged to prototype here
}) {
  // normal class body definition here
  model() {
    return refreshRaceList();
  }

  setupController(controller:any, model:any) {
    controller.set('model', model);
    controller.beginFrames();
  }
}
