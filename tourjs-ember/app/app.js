import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';
import ENV from 'bt-web2/config/environment';
const App = Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver
});

if(ENV.environment === 'production') {
  //console.log = () => {};
}


window.assert2 = (f, reason) => {
  if(!f) {
    if(reason) {
      console.log("Assertions failed: Reason = ", reason);
    }
    debugger;
  }
}

loadInitializers(App, config.modulePrefix);

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
 
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
 
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function setupServiceWorker() {
  await navigator.serviceWorker.register('sw.js');
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if(subscription) {
    // we're subscribed, I guess
    console.log("we're already subscribed");
    return subscription;
  } else {
    
  const vapidPublicKey = 'BKF-5tBkRM2NuN3z5UM7ksk1wXxGZzlj2VAepn0nu6BLSMm3b6o7ohKi49LZ4JWNtFGeBbiaDlAF14CuYk2WDpA';
  const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
   
  registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedVapidKey
  });
  }

}
setupServiceWorker();
  
export default App;
