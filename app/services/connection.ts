import Service from '@ember/service';
import { ClientToServerUpdate, BasicMessage, BasicMessageType, ClientConnectionResponse, ClientConnectionRequest, S2CNameUpdate, S2CPositionUpdate}  from 'bt-web2/server-client-common/communication';
import { RaceState } from 'bt-web2/server-client-common/RaceState';
import { User } from 'bt-web2/server-client-common/User';
import { RideMapHandicap } from 'bt-web2/server-client-common/RideMapHandicap';
import Ember from 'ember';
import Devices from './devices';
import { assert2 } from 'bt-web2/server-client-common/Utils';

export default class Connection extends Service.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service(),
}) {
  // normal class body definition here
  _timeout:any = 0;
  _ws:WebSocket|null = null;
  _raceState:RaceState|null = null;
  _gameId:string = '';

  _performStartupNegotiate(ws:WebSocket, user:User, accountId:string):Promise<ClientConnectionResponse> {
    const oldOnMessage = ws.onmessage;
    return new Promise((resolve, reject) => {
      ws.onmessage = (msg:MessageEvent) => {
        debugger;
        try {
          const basicMessage:BasicMessage = JSON.parse(msg.data);
          window.assert2(basicMessage.type === BasicMessageType.ClientConnectionResponse);
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
        accountId: accountId,
        riderHandicap: user.getHandicap(),
        gameId: 'asdf',
      }
      const bm:BasicMessage = {
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
    const url = `ws://${targetHost}:8080`;

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
      return this._performStartupNegotiate(ws, user, accountId).then((ccr:ClientConnectionResponse) => {
        user.setId(ccr.yourAssignedId);

        const map = new RideMapHandicap(ccr.map);
        this._raceState = new RaceState(map, this.devices, gameId);
        this._ws = ws;
        this._gameId = gameId;
        ws.onmessage = (event:MessageEvent) => this._onMsgReceived(event);
        return this._raceState;
      })
    }).then((raceState:RaceState) => {
      this.scheduleTick();
      return raceState;
    })
    
  }

  _onMsgReceived(event:MessageEvent) {
    let bm:BasicMessage;
    try {
      bm = JSON.parse(event.data);
    } catch(e) {
      throw new Error("Invalid message received: " + event.data);
    }

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
              this.devices.addRemoteUser(client);
            }
          })
          

          this._raceState.absorbPositionUpdate(bm.payload);
          break;
        }
        case BasicMessageType.ServerError:
          assert2(false);
          break;
        case BasicMessageType.ClientConnectionResponse:
          assert2(false);
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

  tick() {
    if(this._ws && this._raceState) {
      // ok, we gotta send our game state back to the main server
      
      const update = new ClientToServerUpdate(this._raceState);
      const wrapper:BasicMessage = {
        type: BasicMessageType.ClientToServerUpdate,
        payload: update,
      };
      this._ws.send(JSON.stringify(wrapper));
      this.scheduleTick();
    }
  }

  getRaceState():RaceState {
    if(this._raceState) {
      return this._raceState;
    } else {
      throw new Error("We don't have a game state!");
    }
  }

  scheduleTick() {
    this._timeout = setTimeout(() => {
      this.tick();
    }, 500);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'connection': Connection;
  }
}
