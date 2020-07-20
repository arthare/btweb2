import Route from '@ember/routing/route';
import { apiGet } from 'bt-web2/set-up-ride/route';

export default class PacingChallenge extends Route.extend({
  // anything which *must* be merged to prototype here
}) {
  // normal class body definition here
  model() {
    return apiGet('pacing-challenge-records', {}).then((currentRecords) => {
      return currentRecords;
    })
  }
}
