import fs from 'fs';
import FeedForwardNeuralNetworks from 'ml-fnn';
import { brainPath, DataWithName, TrainingDataPrepped, TrainingSnapshot, trainingSnapshotToAIInput, trainingSnapshotToAILabel } from '../app/server-client-common/ServerAISnapshots';
import * as tf from '@tensorflow/tfjs-node'
import { LayersModel, Sequential, Tensor, Tensor2D } from '@tensorflow/tfjs-node';
import { normalizeData, unnormalizeData, makeTensor, NormData } from '../app/server-client-common/ServerGame';
import { assert2 } from '../app/server-client-common/Utils';
import  {rSquared} from 'r-squared';

function buildModel(nInput:number, nOutput:number) {
  // https://codelabs.developers.google.com/codelabs/tfjs-training-regression/index.html#3
  // and
  // https://codelabs.developers.google.com/codelabs/tfjs-training-regression/index.html#8
  const model = tf.sequential();
  model.add(tf.layers.dense({inputShape: [nInput], units: 50}));
  model.add(tf.layers.dense({units: 300, activation: 'sigmoid'}));
  model.add(tf.layers.dense({units: 300, activation: 'sigmoid'}));
  model.add(tf.layers.dense({units: nOutput}));

  return model;
}

function testModel(model:LayersModel, inputData:Tensor2D, labelTensor:Tensor2D, normData:NormData, checkDeep:boolean, names:DataWithName[][]):{score:number, data:number[][], labels:string[]} {
  // https://codelabs.developers.google.com/codelabs/tfjs-training-regression/index.html#6

  const normalizedInput = normalizeData(inputData, normData.inputMin, normData.inputMax);
  const normalizedLabel = normalizeData(labelTensor, normData.labelMin, normData.labelMax);

  const normalizedPredictions = model.predict(normalizedInput);
  
  const thisScore = tf.metrics.meanSquaredError(normalizedLabel, normalizedPredictions as any).dataSync()[0];

  
  let data:number[][] = [];
  let labels:string[] = [];
  if(checkDeep) {
    const normRightAnswer = normalizedLabel.dataSync();
    const normPredAnswer = (normalizedPredictions as Tensor2D).dataSync();

    const unnormRightAnswer = labelTensor.dataSync();
    const unnormInputs = inputData.dataSync();
    const unnormPredAnswer = unnormalizeData(normalizedPredictions, normData.labelMin, normData.labelMax).dataSync();

    const perRow = unnormInputs.length / unnormPredAnswer.length;

    labels.push("Right Answer");
    labels.push("Predicted Answer");
    labels.push("Norm Right Answer");
    labels.push("Norm Predicted Answer");
    labels.push(...names[0].map((data) => data.name));

    unnormRightAnswer.forEach((ans, index) => {
      let myRow:number[] = [];
      myRow.push(ans); // the correct answer
      myRow.push(unnormPredAnswer[index]); // the predicted answer
      myRow.push(normRightAnswer[index]);
      myRow.push(normPredAnswer[index]);

      myRow.push(...unnormInputs.slice(index*perRow, (index+1)*perRow));
      data.push(myRow);
    })
  }
  return {score: thisScore, data, labels};
}


function removeBoringColumns(data:DataWithName[][]):number[][] {
  const cols = data[0].length;

  let ret:number[][] = [];

  let killCols = [];
  for(var ixCol = 0; ixCol < cols; ixCol++) {
    let colMax = Math.max(...data.map((row) => row[ixCol].data));
    let colMin = Math.min(...data.map((row) => row[ixCol].data));
    if(colMin === colMax) {
      console.error("Data column ", data[0][ixCol].name, " is bad");
      debugger;
      killCols.push(ixCol);
    }
  }

  return data.map((row) => {
    let ret = [];
    let lastCol = -1;
    killCols.forEach((ixKillCol) => {
      ret.push(...row.slice(lastCol+1, ixKillCol));
      lastCol = ixKillCol;
    })
    ret.push(...row.slice(lastCol+1, row.length).map((dt) => dt.data));

    ret.forEach((val) => {
      assert2(!isNaN(val) && val >= -10000);
    });
    return ret;
  })
}

export function startNNTrain() {
  let dir = fs.readdirSync(brainPath(''));
  dir = dir.filter((filename) => filename.endsWith('.training'));

  dir.forEach(async (file) => {
    const contents = fs.readFileSync(brainPath(file), 'utf8');
    let jsons = contents.split('\n$$\n');
    jsons = jsons.filter((js) => !!(js.trim()));
    const datas:TrainingSnapshot[] = jsons.map((js) => JSON.parse(js));
    datas.sort((a, b) => a.tm % 1000 < b.tm % 1000 ? -1 : 1); // shuffle by the # of milliseconds.  this should be fairly effective at shuffling


    // take our training snapshots and convert them into our training inputs
    let inputDataPrepped = datas.map(trainingSnapshotToAIInput);

    // remove all the columns that have no actual information in them
    const allInputDatasAsNumbers = removeBoringColumns(inputDataPrepped);

    // take our training snapshots and convert them into our training labels
    const allLabelsAsNumbers = datas.map(trainingSnapshotToAILabel);
    const model = buildModel(allInputDatasAsNumbers[0].length, 1);

    // https://codelabs.developers.google.com/codelabs/tfjs-training-regression/index.html#4

    

    const inputTensor = makeTensor(allInputDatasAsNumbers);
    const labelTensor = makeTensor(allLabelsAsNumbers);
    const inputTrainingTensor = inputTensor.slice(0, 0.75*datas.length);
    const labelTrainingTensor = labelTensor.slice(0, 0.75*datas.length);
    const inputEvalTensor = inputTensor.slice(0.75*datas.length, 0.25*datas.length);
    const labelEvalTensor = labelTensor.slice(0.75*datas.length, 0.25*datas.length);

    const normData:NormData = new NormData(inputTensor, labelTensor);

    const normalizedInputs = normalizeData(inputTrainingTensor, normData.inputMin, normData.inputMax);
    const normalizedLabels = normalizeData(labelTrainingTensor, normData.labelMin, normData.labelMax);


    
    // https://codelabs.developers.google.com/codelabs/tfjs-training-regression/index.html#5
    model.compile({
      optimizer: tf.train.adam(),
      loss: tf.losses.meanSquaredError,
      metrics: ['mse'],
    });

    const batchSize = 30;
    const epochs = 500;

    let bestSoFar = 1000;

    let loops = 0;
    while(true) {

      const fromTheStartEachTime = {
        initialEpoch: 0,
        batchSize,
        epochs:epochs,
        shuffle: true,
        verbose: 0,
      }
      const sequentially = {
        initialEpoch: loops * epochs,
        batchSize,
        epochs: (loops+1)*epochs,
        shuffle: true,
        verbose: 0,
      }

      let sequenceParam;
      if(Math.random() > 0.9) {
        sequenceParam = fromTheStartEachTime;
        loops = 0;
      } else {
        sequenceParam = sequentially;
      }

      const result = await model.fit(normalizedInputs, normalizedLabels, sequenceParam);
  
      const thisScore = testModel(model, inputEvalTensor, labelEvalTensor, normData, false, inputDataPrepped);
      const prefix = `${loops}: `;
      console.log(prefix + "Metric of prediction = ", thisScore.score.toFixed(8), " best so far ", bestSoFar.toFixed(8));
      if(thisScore.score < bestSoFar) {

        const brainName = `${file}-${thisScore.score.toFixed(8)}.brain`;
        await model.save(`file://${brainPath(brainName)}`);

        // put the norm.json so that we can figure out the norms that this brain was trained with
        fs.writeFileSync(brainPath(brainName + '/norm.json'), JSON.stringify(normData.toJSON()));

        { // make the CSV
          const bigScore = testModel(model, inputEvalTensor, labelEvalTensor, normData, true, inputDataPrepped);
          let lines:string[] = [];
          lines.push(bigScore.labels.join('\t'));

          const restOfLines:string[] = bigScore.data.map((dataLine) => {
            return dataLine.map(d => d.toFixed(8)).join('\t');
          });
          lines.push(...restOfLines);
          fs.writeFileSync(brainPath(brainName + '/check.txt'), lines.join('\n'));
        }


        bestSoFar = thisScore.score;
        console.log(prefix + "A best! ^^^^^^^^^^^^^^^^^^^^^^^^");
      }
      loops++;
    }

    //fs.writeFileSync(brainPath(`${file}.brain`), JSON.stringify(nn.toJSON()));
    debugger;
  })
}