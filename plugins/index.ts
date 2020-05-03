import startPluginHost from './host/index';

import startFakePlugin from './fake/index';

startPluginHost().then((serverUrl) => {
  startFakePlugin(serverUrl);

});
