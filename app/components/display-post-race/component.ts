import Component from '@ember/component';
import Ember from 'ember';
import Connection from 'bt-web2/services/connection';
import {computed} from '@ember/object';
import { S2CFinishUpdate, S2CPositionUpdateUser } from 'bt-web2/server-client-common/communication';
import { formatSecondsHms } from 'bt-web2/server-client-common/Utils';
import { DistanceHistoryElement, DraftSavings, User, UserDisplay, UserInterface, UserTypeFlags } from 'bt-web2/server-client-common/User';
import { RaceState, UserProvider } from 'bt-web2/server-client-common/RaceState';
import { RideMap } from 'bt-web2/server-client-common/RideMap';
import RaceResults from 'bt-web2/race-results/route';

class FinishUser implements UserInterface {
  private _data:S2CFinishUpdate;
  private _id:number;
  private _ix:number;
  constructor(id:number, finish:S2CFinishUpdate) {
    this._id = id;
    this._data = finish;
    const ix = finish.rankings.findIndex((rankId) => rankId === id);
    if(ix < 0 || ix >= finish.rankings.length) {
      throw new Error("Couldn't find user");
    }
    this._ix = ix;
  }
  getName(): string  {
    return this._data.names[this._ix];  
  }
  getUserType(): number {
    return this._data.types[this._ix];
  }
  getHandicap(): number {
    return this._data.handicaps[this._ix];
  }
  public getHandicapSecondsSaved(): number {
    return this._data.hsSaved[this._ix];
  }
  public getHandicapSecondsUsed(): { [key: string]: number; } {
    return this._data.userSpending[this._ix];
  }
  getId(): number {
    return this._id;
  }

  setId(newId: number): void  {debugger; throw new Error('Method not implemented.');}
  public setHandicap(watts: number): void  {debugger; throw new Error('Method not implemented.');}
  setChat(tmNow: number, chat: string): void  {debugger; throw new Error('Method not implemented.');}
  getLastChat(tmNow: number): { tmWhen: number; chat: string; } | null  {debugger; throw new Error('Method not implemented.');}
  getLastElevation(): number  {return 0;}
  getPositionUpdate(tmNow: number): S2CPositionUpdateUser  {debugger; throw new Error('Method not implemented.');}
  setDistance(dist: number): void  {debugger; throw new Error('Method not implemented.');}
  setSpeed(speed: number): void  {debugger; throw new Error('Method not implemented.');}
  setDistanceHistory(newHistory: DistanceHistoryElement[]): void  {debugger; throw new Error('Method not implemented.');}
  getDistanceHistory(): DistanceHistoryElement[]  {debugger; throw new Error('Method not implemented.');}
  getLastSlopeInWholePercent(): number  {debugger; throw new Error('Method not implemented.');}
  getDistance(): number  {debugger; throw new Error('Method not implemented.');}
  getSpeed(): number  {debugger; throw new Error('Method not implemented.');}
  getImage(): string | null  {debugger; throw new Error('Method not implemented.');}
  getBigImageMd5(): string | null  {debugger; throw new Error('Method not implemented.');}
  getLastHandicapChangeTime(): number  {debugger; throw new Error('Method not implemented.');}
  physicsTick(tmNow: number, map: RideMap, otherUsers: UserInterface[]): void  {debugger; throw new Error('Method not implemented.');}
  public notifyDrafteeThisCycle(tmNow: number, id: number): void  {debugger; throw new Error('Method not implemented.');}
  public getDrafteeCount(tmNow: number): number  {debugger; throw new Error('Method not implemented.');}
  public getSecondsAgoToCross(tmNow: number, distance: number): number | null  {debugger; throw new Error('Method not implemented.');}
  public isDraftingLocalUser(): boolean {debugger; throw new Error('Method not implemented.');}
  public getLastWattsSaved(): DraftSavings  {debugger; throw new Error('Method not implemented.');}
  public hasDraftersThisCycle(tmNow: number): boolean  {debugger; throw new Error('Method not implemented.');}
  getDisplay(raceState: RaceState | null): UserDisplay  {debugger; throw new Error('Method not implemented.');}
  setImage(imageBase64: string, bigImageMd5: string | null): void  {debugger; throw new Error('Method not implemented.');}
  absorbNameUpdate(tmNow: number, name: string, type: number, handicap: number): void  {debugger; throw new Error('Method not implemented.');}
  absorbPositionUpdate(tmNow: number, update: S2CPositionUpdateUser): void  {debugger; throw new Error('Method not implemented.');}
  isPowerValid(tmNow: number): boolean  {debugger; throw new Error('Method not implemented.');}
  public notifyPower(tmNow: number, watts: number): void  {debugger; throw new Error('Method not implemented.');}
  public notifyCadence(tmNow: number, cadence: number): void  {debugger; throw new Error('Method not implemented.');}
  public notifyHrm(tmNow: number, hrm: number): void {debugger; throw new Error('Method not implemented.');}
  public getLastHrm(tmNow: number): number  {debugger; throw new Error('Method not implemented.');}
  public getLastPower(): number  {debugger; throw new Error('Method not implemented.');}
  setFinishTime(tmNow: number): void  {debugger; throw new Error('Method not implemented.');}
  getRaceTimeSeconds(tmRaceStart: number): number  {debugger; throw new Error('Method not implemented.');}
  isFinished(): boolean  {debugger; throw new Error('Method not implemented.');}
  getMsSinceLastPacket(tmNow: number): number  {debugger; throw new Error('Method not implemented.');}
  public notePacket(tmNow: number): void  {debugger; throw new Error('Method not implemented.');}

}

class FinishUserProvider implements UserProvider {
  users:UserInterface[];
  constructor(data:S2CFinishUpdate) {
    this.users = [];
    data.rankings.forEach((id:number) => {
      this.users.push(new FinishUser(id, data));
    })
  }

  getUsers(tmNow: number): UserInterface[] {
    return this.users;
  }
  getUser(id: number): UserInterface | null {
    return this.users.find((user) => user.getId() === id) || null;
  }
  getLocalUser(): UserInterface | null {
    return null;
  }
}

export default class DisplayPostRace extends Component.extend({
  // anything which *must* be merged to prototype here
  
}) {
  // normal class body definition here
  results: S2CFinishUpdate|null = null;

  users: FinishUserProvider = null as any;

  didInsertElement() {
    const results:S2CFinishUpdate|null = this.get('results');
    if(results) {
      this.set('users', new FinishUserProvider(results));
    }
  }

  @computed("results", "frame", "users")
  get processedRankings():{byRank:any[], byHs:any[], byEfficiency:any[]} {
    const results:S2CFinishUpdate|null = this.get('results');
    const users = this.get('users');
    console.log("post-race display! ", results);
    if(results && users) {
      let ret:any[] = [];
  
      let leadAiUserId:number|undefined = results.rankings.find((userId) => {
        const user = users.getUser(userId);
        return(user && user.getUserType() & UserTypeFlags.Ai);
      });

      results.rankings.forEach((userId, index) => {
        // this will be a userid.  We need to get the name out of the name database
        const user = users.getUser(userId);
        const name = user?.getName() || "Unknown";
        const timeRaw = results.times[index];
        
        ret.push({
          userId: userId,
          name: userId===leadAiUserId ? "Lead AI" : name,
          rank: `#${index+1}`,
          time: formatSecondsHms(timeRaw),
          hsSaved: results.hsSaved[index],
          efficiency: results.efficiency[index],
          spending:results.userSpending[index],
        });
      });

      ret = ret.filter((resultRow) => {
        const user = users.getUser(resultRow.userId);
        if(!user) {
          return false;
        }
        if(user.getUserType() & UserTypeFlags.Ai) {
          return user.getId() === leadAiUserId;
        } else {
          // non-AI users all get included
          return true;
        }
      })

      const byRank = ret.slice();
      const byHs = ret.slice().sort((a, b) => a.hsSaved > b.hsSaved ? -1 : 1).map((num) => ({name: num.name, hsSaved: num.hsSaved.toFixed(1)}));
      const byEfficiency = ret.slice().sort((a, b) => a.efficiency > b.efficiency ? -1 : 1).map((num) => ({name: num.name, efficiency: `${num.efficiency.toFixed(1)}/km`}));
      const finalObject:any = {
        byRank,
        byHs,
        byEfficiency,
      };

      for(var key in results.userSpending[0]) {
        console.log("need to compute for ", key);
        finalObject[key] = ret.slice().sort((a, b) => a.spending[key] > b.spending[key] ? -1 : 1).map((num) => ({name: num.name, spending: `${num.spending[key].toFixed(1)}`}));
      }
      console.log("final = ", finalObject);


      return finalObject;
    } else {
      return {byRank: [], byHs: [], byEfficiency: []};
    }
  }
};
