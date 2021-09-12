import { startGameServer } from "./index-gameServer";

if(process.argv.find((val) => val === 'neural')) {
  const { startNNTrain } = require('./index-nntrain');
  startNNTrain();
} else {
  startGameServer();
}