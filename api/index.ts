import { startGameServer, startSelfCheck } from "./index-gameServer";

console.log("Node version " + process.version);

if(process.argv.find((val) => val === 'neural')) {
  const { startNNTrain } = require('./index-nntrain');
  startNNTrain();
}
else if(process.argv.find((val) => val === 'self-check')) {
  startSelfCheck();
} else {
  startGameServer();
}