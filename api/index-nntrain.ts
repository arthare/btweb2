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

  dir.forEach(async (file) => {
    const contents = fs.readFileSync(brainPath(file, BrainLocation.ForTraining), 'utf8');
    let jsons = contents.split('\n$$\n');
    jsons = jsons.filter((js) => !!(js.trim()));
    const datas:TrainingSnapshotV2[] = jsons.map((js) => JSON.parse(js));
    doNNTrainWithSnapshots(tf, file, datas, (name, contents) => fs.writeFileSync(name, contents), null, ()=>false);

    //fs.writeFileSync(brainPath(`${file}.brain`, BrainLocation.ForTraining), JSON.stringify(nn.toJSON()));
    debugger;
  })
}