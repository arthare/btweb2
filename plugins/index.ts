import startPluginHost from './host/index';

import startFakePlugin from './fake/index';
import startWaterRower from './waterrower/index';

startPluginHost().then((serverUrl) => {
  startFakePlugin(serverUrl);
  startWaterRower(serverUrl);
});
