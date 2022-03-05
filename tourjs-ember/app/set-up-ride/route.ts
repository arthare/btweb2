import Route from '@ember/routing/route';
import ENV from 'bt-web2/config/environment';
import { apiGetInternal, apiPostInternal, ServerHttpGameList, ServerHttpGameListElement } from 'bt-web2/tourjs-shared/communication';

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
