const express = require('express');
import * as core from 'express-serve-static-core';
import {PluginToBrowserUpdate, PluginType, PluginDescriptor, BrowserToPluginUpdate} from '../../app/server-client-common/PluginCommunication';
import {setCorsHeaders, postStartup} from '../../api/ServerHttp';
import fetch from 'node-fetch';
const app = express()
const port = 63939;



export interface PluginState {
  tmUpdate: number;
  lastPower: number;
  descriptor: PluginDescriptor;

  lastSlopeInstruction?: BrowserToPluginUpdate;
}

class PluginServerState {

  _plugins:Map<string, PluginState>;
  _ws:WebSocket|null;

  constructor() {
    this._plugins = new Map();
    this._ws = null;
  }

  notifyNewPlugin(desc:PluginDescriptor) {
    // hi, new plugin!
    this._plugins.set(desc.pluginId, {
      tmUpdate: new Date().getTime(),
      lastPower: 0,
      descriptor: desc,
      lastSlopeInstruction: undefined,
    });
  }

  getPluginList():PluginDescriptor[] {
    let ret:PluginDescriptor[] = [];
    this._plugins.forEach((pluginState) => {
      ret.push(pluginState.descriptor);
    });
    return ret;
  }

  hasPlugin(pluginId:string):boolean {
    return this._plugins.has(pluginId);
  }
  getPluginDataForBrowser(pluginId:string):PluginToBrowserUpdate {
    if(!this.hasPlugin(pluginId)) {
      return new PluginToBrowserUpdate(pluginId, new Date().getTime(), 0);
    }
    const pluginData:PluginState = this._plugins.get(pluginId);
    return new PluginToBrowserUpdate(pluginId, pluginData.tmUpdate, pluginData.lastPower);
  }

  setSlopeForPlugin(slope:BrowserToPluginUpdate) {
    if(!this._plugins.has(slope.pluginId)) {
      return false;
    }
    this._plugins.get(slope.pluginId).lastSlopeInstruction = slope;
  }

  notifyNewPluginData(pluginId:string, state:PluginToBrowserUpdate):BrowserToPluginUpdate|undefined {
    if(!this._plugins.has(pluginId)) {
      return;
    }

    this._plugins.get(pluginId).tmUpdate = state.tmUpdate;
    this._plugins.get(pluginId).lastPower = state.lastPower;
    return this._plugins.get(pluginId).lastSlopeInstruction;
  }
}



const serverState = new PluginServerState();

export default function startPluginHost():Promise<string> {

  const targetUrl = `http://localhost:${port}`;
  return fetch(`${targetUrl}/device-list`).then(() => {
    // there's already a plugin host running
    console.log("There's already a plugin host running, so no need to host ourselves");
    return targetUrl;
  }, (failure) => {
    // there isn't already a plugin host running, so we can be the plugin host!
    app.get('/device-list', (req:core.Request, res:core.Response) => {
      setCorsHeaders(req, res);
      res.writeHead(200, 'ok');
      res.write(JSON.stringify(serverState.getPluginList()));
      res.end();
    })
    
    app.post('/plugin', (req:core.Request, res:core.Response) => {
      // a plugin wants to join the party!
      return postStartup(req, res).then((postContent) => {

        if(PluginDescriptor.validate(postContent)) {
          serverState.notifyNewPlugin(postContent);

          res.writeHead(200, "ok");
          res.write("{}");
          res.end();
        } else {
          res.writeHead(400, "your plugin signup was invalid");
          res.write(JSON.stringify(postContent));
          res.end();
          debugger; // huh?
        }
      })
    });
    app.post('/power', (req:core.Request, res:core.Response) => {
      // a plugin wants to join the party!
      return postStartup(req, res).then((postContent) => {
        if(PluginToBrowserUpdate.validate(postContent)) {
          const instructions = serverState.notifyNewPluginData(postContent.pluginId, postContent);

          res.writeHead(200, "ok");
          res.write(JSON.stringify(instructions || ""));
          res.end();
        } else {
          res.writeHead(400, "bad");
          res.write(JSON.stringify(postContent));
          res.end();
          debugger; // huh?
        }
      })
    });

    app.get('/power', (req:core.Request, res:core.Response) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      const pluginId:any = req.query["id"];
      if(typeof pluginId === 'string' && serverState.hasPlugin(pluginId)) {
        const pluginState:PluginToBrowserUpdate = serverState.getPluginDataForBrowser(<string>pluginId);
        res.writeHead(200, "ok");
        res.write(JSON.stringify(pluginState));
        res.end();
      } else {
        res.writeHead(404, "plugin not found");
        res.write("{}");
        res.end();
      }
    });

    app.post('/slope', (req:core.Request, res:core.Response) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST");
      return postStartup(req, res).then((postContent:BrowserToPluginUpdate) => {
        if(serverState.hasPlugin(postContent.pluginId)) {
          serverState.setSlopeForPlugin(postContent);

          res.writeHead(200, "ok");
          res.write("'ok'");
          res.end();
        } else {
          res.writeHead(404, "plugin not found");
          res.write("{}");
          res.end();
        }
      });
    });

    app.listen(port);
    return targetUrl;
  })


  return 
}