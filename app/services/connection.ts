import Service from '@ember/service';
import { ClientToServerUpdate, BasicMessage, BasicMessageType, ClientConnectionResponse, ClientConnectionRequest}  from 'bt-web2/server-client-common/communication';
import { RaceState } from 'bt-web2/server-client-common/RaceState';
import { User } from 'bt-web2/server-client-common/User';
import { RideMapHandicap } from 'bt-web2/server-client-common/RideMapHandicap';

export default class Connection extends Service.extend({
  // anything which *must* be merged to prototype here
}) {
  // normal class body definition here
  _timeout:any = 0;
  _ws:WebSocket|null = null;
  _gameState:RaceState|null = null;
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
        riderName: user.getDisplay().name,
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

  connect(targetHost:string, gameId:string, accountId:string, user:User) {
    const url = `ws://${targetHost}:8080`;

    return new Promise<WebSocket>((resolve, reject) => {
      const ws = new WebSocket(url);
      ws.onopen = () => {
        resolve(ws);
      }
      ws.onerror = (err) => {
        reject(err);
        this.disconnect();
      }
    }).then((ws:WebSocket) => {
      if(!user) {
        throw new Error("You don't have a user, how do you expect to connect?");
      }
      return this._performStartupNegotiate(ws, user, accountId).then((ccr:ClientConnectionResponse) => {
        user.setId(ccr.yourAssignedId);

        const map = new RideMapHandicap(ccr.map);
        this._gameState = new RaceState(map, this.devices);
        this._ws = ws;
        this._gameId = gameId;
        return ws;
      })
    }).then(() => {
      this.scheduleTick();
    })
    
  }

  tick() {
    if(this._ws && this._gameState) {
      // ok, we gotta send our game state back to the main server
      
      const update = new ClientToServerUpdate(this._gameState);
      const wrapper:BasicMessage = {
        type: BasicMessageType.ClientToServerUpdate,
        payload: update,
      };
      this._ws.send(JSON.stringify(wrapper));
      this.scheduleTick();
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
