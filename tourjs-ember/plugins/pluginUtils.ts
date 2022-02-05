import { PluginDescriptor, PluginToBrowserUpdate, BrowserToPluginUpdate } from "../app/tourjs-shared/PluginCommunication";
import fetch from 'node-fetch';

export function signUpWithPluginHost(serverUrl:string, pluginDescriptor:PluginDescriptor):Promise<any> {
  return fetch(`${serverUrl}/plugin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pluginDescriptor),
  }).then((response) => {
    return response.json();
  });
}

export function sendPowerToPluginHost(serverUrl:string, powerUpdate:PluginToBrowserUpdate):Promise<BrowserToPluginUpdate|undefined> {
  return fetch(`${serverUrl}/power`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(powerUpdate),
  }).then((response) => {
    return response.json();
  });
}