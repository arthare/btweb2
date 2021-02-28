import Component from '@ember/component';
import Ember from 'ember';
import Connection from 'bt-web2/services/connection';
import {computed} from '@ember/object';
import { S2CFinishUpdate } from 'bt-web2/server-client-common/communication';
import { formatSecondsHms } from 'bt-web2/server-client-common/Utils';
import { User, UserTypeFlags } from 'bt-web2/server-client-common/User';

export default class DisplayPostRace extends Component.extend({
  // anything which *must* be merged to prototype here
  connection: <Connection><unknown>Ember.inject.service(),
  
}) {
  // normal class body definition here
  results: S2CFinishUpdate|null = null;

  @computed("results", "frame")
  get processedRankings():{byRank:any[], byHs:any[], byEfficiency:any[]} {
    const results:S2CFinishUpdate|null = this.get('results');
    console.log("post-race display! ", results);
    if(results) {
      let ret:any[] = [];
  
      let leadAiUserId:number|undefined = results.rankings.find((userId) => {
        const user = this.connection.getUser(userId);
        return(user && user.getUserType() & UserTypeFlags.Ai);
      }) || -1;

      results.rankings.forEach((userId, index) => {
        // this will be a userid.  We need to get the name out of the name database
        const name = this.connection.getUserName(userId);
        const timeRaw = results.times[index];
        
        ret.push({
          userId: userId,
          name: userId===leadAiUserId ? "Lead AI" : name,
          rank: `#${index+1}`,
          time: formatSecondsHms(timeRaw),
          hsSaved: results.hsSaved[index],
          efficiency: results.efficiency[index],
        });
      });

      ret = ret.filter((resultRow) => {
        const user = this.connection.getUser(resultRow.userId);
        if(user?.getUserType() & UserTypeFlags.Ai) {
          return user.getId() === leadAiUserId;
        } else {
          // non-AI users all get included
          return true;
        }
      })

      const byRank = ret.slice();
      const byHs = ret.slice().sort((a, b) => a.hsSaved > b.hsSaved ? -1 : 1).map((num) => ({name: num.name, hsSaved: num.hsSaved.toFixed(1)}));
      const byEfficiency = ret.slice().sort((a, b) => a.efficiency > b.efficiency ? -1 : 1).map((num) => ({name: num.name, efficiency: `${num.efficiency.toFixed(1)}/km`}));
      return {
        byRank,
        byHs,
        byEfficiency,
      };
    } else {
      return {byRank: [], byHs: [], byEfficiency: []};
    }
  }
};
