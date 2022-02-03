import fs from 'fs';
import FeedForwardNeuralNetworks from 'ml-fnn';
import { BrainLocation, brainPath, DataWithName, doNNTrainWithSnapshots, TrainingDataPrepped, TrainingSnapshotV2, trainingSnapshotToAIInput, trainingSnapshotToAILabel } from './shared/ServerAISnapshots';
import * as tf from '@tensorflow/tfjs-node'
import { LayersModel, Sequential, Tensor, Tensor2D } from '@tensorflow/tfjs-node';
import { assert2 } from './shared/Utils';
import  {rSquared} from 'r-squared';



export function startNNTrain() {
  let dir = fs.readdirSync(brainPath('', BrainLocation.ForTraining));
  dir = dir.filter((filename) => filename.endsWith('.training'));

  let proms = [];
  dir.forEach(async (file) => {
    console.log("training with file ", file);
    const contents = fs.readFileSync(brainPath(file, BrainLocation.ForTraining), 'utf8');
    let jsons = contents.split('\n$$\n');
    jsons = jsons.filter((js) => !!(js.trim()));
    const datas:TrainingSnapshotV2[] = jsons.map((js) => {
      try {
        return JSON.parse(js)
      } catch(e) {
        return null;
      }
    }).filter((val) => !!val);
    proms.push(doNNTrainWithSnapshots(tf, file, datas, (name, contents) => fs.writeFileSync(name, contents), null, ()=>false));

  })
  console.log(proms.length, " brains are training!");
  return Promise.all(proms);
}