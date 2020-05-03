import fetch from 'node-fetch';
import { PluginDescriptor, PluginType, PluginToBrowserUpdate, BrowserToPluginUpdate } from '../../app/server-client-common/PluginCommunication';
import { signUpWithPluginHost, sendPowerToPluginHost } from '../pluginUtils';

export default function startPlugin(serverUrl) {

  // Since this will end up being the boilerplate plugin outline:
  // 1) Find and connect to your device before signing up with the PluginHost - this will prevent a bunch of crap from showing up
  //    when the user in the browser goes to connect
  // 2) Once you're sure you've got a solid connection, then call signUpWithPluginHost to register with the plugin host
  // 3) Once you're signed up, just send new power data whenever it is available and the plugin host will get it to the browser
  const signUp:PluginDescriptor = {
    pluginId: '' + Math.random()*1000000,
    humanName: "Fake Plugin For Testing",
    pluginType: PluginType.Fake,
    supportsSmartTrainer: true,
  }

  return signUpWithPluginHost(serverUrl, signUp).then((success) => {
    console.log("Plugin: Signed up with server");


    function newUpdate() {
      const update:PluginToBrowserUpdate = {
        pluginId:signUp.pluginId,
        tmUpdate: new Date().getTime(),
        lastPower: 100 + Math.random()*50,
      }
      return sendPowerToPluginHost(serverUrl, update).then((browserToPlugin:BrowserToPluginUpdate|undefined) => {

        if(browserToPlugin) {
          console.log("they said: ", browserToPlugin);
        }

      }, (failure) => {
        // huh?
        console.log("failed to talk to server ", failure);
      }).finally(() => {
        setTimeout(newUpdate, 1000);
      });
    }

    setTimeout(newUpdate, 1000);
  })
}