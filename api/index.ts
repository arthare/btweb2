import { startGameServer, startSelfCheck } from "./index-gameServer";

console.log("Node version " + process.version);

if(process.argv.find((val) => val === 'neural')) {
  console.log("starting neural");
  const { startNNTrain } = require('./index-nntrain');
  startNNTrain();
}
else if(process.argv.find((val) => val === 'self-check')) {
  console.log("starting self check");
  startSelfCheck();
} else {
  console.log("starting game server");
  startGameServer();
}