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

export default App;
