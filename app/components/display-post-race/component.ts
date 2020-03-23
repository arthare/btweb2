import Component from '@ember/component';
import Ember from 'ember';
import Connection from 'bt-web2/services/connection';
import {computed} from '@ember/object';
import { S2CFinishUpdate } from 'bt-web2/server-client-common/communication';
import { formatSecondsHms } from 'bt-web2/server-client-common/Utils';

export default class DisplayPostRace extends Component.extend({
  // anything which *must* be merged to prototype here
  connection: <Connection><unknown>Ember.inject.service(),
  
}) {
  // normal class body definition here
  results: S2CFinishUpdate|null = null;

  @computed("results", "frame")
  get processedRankings():any[] {
    const results:S2CFinishUpdate|null = this.get('results');
    if(results) {
      const ret:any[] = [];
  
      results.rankings.forEach((userId, index) => {
        // this will be a userid.  We need to get the name out of the name database
        const name = this.connection.getUserName(userId);
        const timeRaw = results.times[index];
        
        ret.push({
          name: name,
          rank: `#${index+1}`,
          time: formatSecondsHms(timeRaw),
        });
      })
      return ret;
    } else {
      return [];
    }
  }
};
