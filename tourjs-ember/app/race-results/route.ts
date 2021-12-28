import Route from '@ember/routing/route';
import { apiGet } from 'bt-web2/set-up-ride/route';

function processQueryParam(search:string) {
  const vals = search.replace('?', '');
  let splitted = vals.split('&');
  let ret:{[key:string]:string} = {};
  const key = splitted.forEach((split) => {
    const keyvalue:string[] = split.split('=');
    ret[keyvalue[0]] = keyvalue.slice(1).join('=');
  });
  return ret;
}

export default class RaceResults extends Route.extend({
  // anything which *must* be merged to prototype here
}) {
  // normal class body definition here
  model(params:any) {
    console.log("race-results params: ", params);

    return apiGet('race-results', {key:params.key});
  }
}
