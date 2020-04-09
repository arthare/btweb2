import Service from '@ember/service';
import { ClientToServerUpdate, C2SBasicMessage, S2CBasicMessage, BasicMessageType, ClientConnectionResponse, ClientConnectionRequest, S2CNameUpdate, S2CPositionUpdate, S2CRaceStateUpdate, CurrentRaceState, S2CFinishUpdate, S2CImageUpdate}  from 'bt-web2/server-client-common/communication';
import { RaceState } from 'bt-web2/server-client-common/RaceState';
import { User } from 'bt-web2/server-client-common/User';
import { RideMapHandicap } from 'bt-web2/server-client-common/RideMapHandicap';
import Ember from 'ember';
import Devices from './devices';
import { assert2 } from 'bt-web2/server-client-common/Utils';
import { computed } from '@ember/object';
import ENV from 'bt-web2/config/environment';

export default class Connection extends Service.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service(),
}) {
  // normal class body definition here
  _timeout:any = 0;
  _ws:WebSocket|null = null;
  _raceState:RaceState|null = null;
  _gameId:string = '';
  _lastServerRaceState:S2CRaceStateUpdate|null = null;
  raceResults:S2CFinishUpdate|null = null;
  _lastTimeStamp = 0;
  _imageSources:Map<number,string> = new Map();

  _performStartupNegotiate(ws:WebSocket, user:User, accountId:string, gameId:string):Promise<ClientConnectionResponse> {
    const oldOnMessage = ws.onmessage;
    return new Promise((resolve, reject) => {
      ws.onmessage = (msg:MessageEvent) => {
        try {
          const basicMessage:S2CBasicMessage = JSON.parse(msg.data);
          window.assert2(basicMessage.type === BasicMessageType.ClientConnectionResponse);
          this.set('_lastServerRaceState', basicMessage.raceState);
          const payload:ClientConnectionResponse = <ClientConnectionResponse>basicMessage.payload;
          resolve(payload);
        } catch(e) {
          debugger;
          reject(e);
        }
      };

      

      // ok, we've got our listener set up
      const connect:ClientConnectionRequest = {
        riderName: user.getName(),
        imageBase64: user.getImage(),
        accountId: accountId,
        riderHandicap: user.getHandicap(),
        gameId: gameId,
      }
      const bm:C2SBasicMessage = {
        payload: connect,
        type: BasicMessageType.ClientConnectionRequest,
      }
      ws.send(JSON.stringify(bm));
    }).then((ccr:ClientConnectionResponse) => {
      ws.onmessage = oldOnMessage;
      return ccr;
    })
  }

  connect(targetHost:string, gameId:string, accountId:string, user:User):Promise<RaceState> {
    let url = ENV.environment === 'production' ? `wss://${targetHost}:8080` : `ws://${targetHost}:8080`;
    return new Promise<WebSocket>((resolve, reject) => {
      const ws = new WebSocket(url);
      ws.onopen = () => {
        resolve(ws);
      }
      ws.onerror = (err) => {
        reject(err);
        ws.close();
        debugger;
      }
    }).then((ws:WebSocket) => {
      if(!user) {
        throw new Error("You don't have a user, how do you expect to connect?");
      }
      return this._performStartupNegotiate(ws, user, accountId, gameId).then((ccr:ClientConnectionResponse) => {
        user.setId(ccr.yourAssignedId);

        const map = new RideMapHandicap(ccr.map);
        const raceState = new RaceState(map, this.devices, gameId);
        this.set('_raceState', raceState);
        this._ws = ws;
        this._gameId = gameId;
        ws.onmessage = (event:MessageEvent) => this._onMsgReceived(event);
        return this._raceState;
      })
    }).then((raceState:RaceState) => {
      this.scheduleNetworkTick();
      return raceState;
    })
    
  }

  _onMsgReceived(event:MessageEvent) {
    const tmNow = new Date().getTime();

    let bm:S2CBasicMessage;
    try {
      bm = JSON.parse(event.data);
    } catch(e) {
      throw new Error("Invalid message received: " + event.data);
    }
    if(bm.timeStamp <= this._lastTimeStamp) {
      console.log("bouncing a message because it's earlier or same-time as the last one we got");
      return;
    } else if(!isFinite(bm.timeStamp)) {
      return;
    }
    this._lastTimeStamp = bm.timeStamp;

    this.set('_lastServerRaceState', bm.raceState);
    if(this._raceState) {
      switch(bm.type) {
        case BasicMessageType.S2CNameUpdate:
          this._raceState.absorbNameUpdate(bm.payload);
          break;
        case BasicMessageType.S2CPositionUpdate:
        {
          // let's make sure that the user provider knows about all these users
          const posUpdate:S2CPositionUpdate = bm.payload;
          posUpdate.clients.forEach((client) => {
            const hasIt = this.devices.getUser(client.id);
            if(!hasIt) {

              const image = this._imageSources.get(client.id) || null;

              this.devices.addRemoteUser(client, image);
            }
          })
          

          this._raceState.absorbPositionUpdate(bm.timeStamp, bm.payload);
          {
            const user = this._raceState.getLocalUser();
            if(user) {
              window.pending.lastPhysics = user.getDistance();
              window.tick(bm.timeStamp);
            }
          }
          break;
        }
        case BasicMessageType.S2CImageUpdate:
        {
          debugger;
          const imageUpdate:S2CImageUpdate = bm.payload;
          const user = this._raceState.getUserProvider().getUser(imageUpdate.id);
          this._imageSources.set(imageUpdate.id, imageUpdate.imageBase64);
          if(user) {
            console.log("received an image for ", user.getName());
            user.setImage(imageUpdate.imageBase64);
          }

          break;
        }
        case BasicMessageType.ServerError:
          assert2(false);
          break;
        case BasicMessageType.ClientConnectionResponse:
          assert2(false);
          break;
        case BasicMessageType.S2CFinishUpdate:
          this.set('raceResults', bm.payload);
          break;
      }
    } else {
      debugger;
      this._ws?.close();
      clearTimeout(this._timeout);
      this._timeout = null;
      this._raceState = null;
    }
    
  }

  disconnect() {
    this._timeout = null;
    if(this._ws) {
      this._ws.onmessage = () => {};
      this._ws.close();
    }
    this._raceState = null;
  }

  getUserName(userId:number):string {
    const user = this.devices.getUser(userId);
    return user && user.getName() || "Unknown";
  }

  @computed("_lastServerRaceState")
  get preRace():boolean {
    return (this._lastServerRaceState && this._lastServerRaceState.state === CurrentRaceState.PreRace) || false;
  }
  @computed("_lastServerRaceState")
  get racing():boolean {
    return (this._lastServerRaceState && this._lastServerRaceState.state === CurrentRaceState.Racing) || false;
  }
  @computed("_lastServerRaceState")
  get postRace():boolean {
    return (this._lastServerRaceState && this._lastServerRaceState.state === CurrentRaceState.PostRace) || false;
  }
  @computed("_lastServerRaceState")
  get msOfStart():number {
    return (this._lastServerRaceState && this._lastServerRaceState.tmOfNextState) || 0;
  }

  tick() {
    if(this._ws && this._raceState) {
      // ok, we gotta send our game state back to the main server
      
      const update = new ClientToServerUpdate(this._raceState);
      const wrapper:C2SBasicMessage = {
        type: BasicMessageType.ClientToServerUpdate,
        payload: update,
      };
      this._ws.send(JSON.stringify(wrapper));
      this.scheduleNetworkTick();
    }
  }

  getRaceState():RaceState {
    if(this._raceState) {
      return this._raceState;
    } else {
      throw new Error("We don't have a game state!");
    }
  }

  scheduleNetworkTick() {
    this._timeout = setTimeout(() => {
      this.tick();
    }, 250);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'connection': Connection;
  }
}
