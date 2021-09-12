import fs from 'fs';
import FeedForwardNeuralNetworks from 'ml-fnn';
import { brainPath } from '../app/server-client-common/ServerAISnapshots';
import * as tf from '@tensorflow/tfjs-node'
import { LayersModel, Sequential, Tensor, Tensor2D } from '@tensorflow/tfjs-node';

interface NormData {
  inputMin:Tensor;
  inputMax:Tensor;
  labelMin:Tensor;
  labelMax:Tensor;
}

function buildModel(nInput:number, nOutput:number) {
  // https://codelabs.developers.google.com/codelabs/tfjs-training-regression/index.html#3
  // and
  // https://codelabs.developers.google.com/codelabs/tfjs-training-regression/index.html#8
  const model = tf.sequential();
  model.add(tf.layers.dense({inputShape: [nInput], units: 50}));
  model.add(tf.layers.dense({units: 50, activation: 'sigmoid'}));
  model.add(tf.layers.dense({units: nOutput}));

  return model;
}

function testModel(model:LayersModel, inputData:Tensor2D, labelTensor:Tensor2D, normData:NormData):number {
  // https://codelabs.developers.google.com/codelabs/tfjs-training-regression/index.html#6

  const normalizedInput = normalizeData(inputData, normData.inputMin, normData.inputMax);
  const normalizedLabel = normalizeData(labelTensor, normData.labelMin, normData.labelMax);

  const normalizedPredictions = model.predict(normalizedInput);
  
  const thisScore = tf.metrics.meanSquaredError(normalizedLabel, normalizedPredictions as any).dataSync()[0];

  let checkDeep = false;
  if(checkDeep) {
    const unnormRightAnswer = labelTensor.dataSync();
    const unnormPredAnswer = unnormalizeData(normalizedPredictions, normData.labelMin, normData.labelMax).dataSync();

    unnormRightAnswer.forEach((rightAnswer, index) => {
      console.log(`#${index}: ${rightAnswer.toFixed(2)} vs ${unnormPredAnswer[index].toFixed(2)}`);
    })
  }
  return thisScore;
}

function unnormalizeData(data:any, min:Tensor, max:Tensor) {
  return data.mul(max.sub(min)).add(min);
}
function normalizeData(data:Tensor2D, min:Tensor, max:Tensor) {
  return  data.sub(min).div(max.sub(min));
}
function makeTensor(arr:number[][]) {
  return tf.tensor2d(arr, [arr.length, arr[0].length]);
}

export function startNNTrain() {
  let dir = fs.readdirSync(brainPath(''));
  dir = dir.filter((filename) => filename.endsWith('.training'));

  dir.forEach(async (file) => {
    const contents = fs.readFileSync(brainPath(file), 'utf8');
    let jsons = contents.split('\n$$\n');
    jsons = jsons.filter((js) => !!(js.trim()));
    const datas = jsons.map((js) => JSON.parse(js));

    // we do have a little bit of manipulating to do here
    const labelDatas:{[key:string]:number}[] = datas.map((data) => {
      return {power: data.powerNextSecond};
    })
    const inputDatas:{[key:string]:number}[] = datas.map((data) => {
      delete data.tm;
      delete data.powerNextSecond;
      return data;
    })
    

    const allInputDatasAsNumbers = inputDatas.map((data) => Object.values(data));
    const trainingInputAsNumbers = allInputDatasAsNumbers.slice(0, allInputDatasAsNumbers.length * 0.75);
    const evaluationInputAsNumbers = allInputDatasAsNumbers.slice(allInputDatasAsNumbers.length * 0.75);


    const allLabelsAsNumbers = labelDatas.map((data) => Object.values(data));
    const trainingLabelsAsNumbers = allLabelsAsNumbers.slice(0, allLabelsAsNumbers.length * 0.75);
    const evaluationLabelsAsNumbers = allLabelsAsNumbers.slice(allLabelsAsNumbers.length * 0.75);
    const model = buildModel(allInputDatasAsNumbers[0].length, 1);

    // https://codelabs.developers.google.com/codelabs/tfjs-training-regression/index.html#4
    const inputTensor = makeTensor(trainingInputAsNumbers);
    const labelTensor = makeTensor(trainingLabelsAsNumbers);
    const inputEvaluationTensor = makeTensor(evaluationInputAsNumbers);
    const labelEvaluationTensor = makeTensor(evaluationLabelsAsNumbers);
    const normData:NormData = {
      inputMax: inputTensor.max(),
      inputMin: inputTensor.min(),
      labelMax: labelTensor.max(),
      labelMin: labelTensor.min(),
    }

    const normalizedInputs = normalizeData(inputTensor, normData.inputMin, normData.inputMax);
    const normalizedLabels = normalizeData(labelTensor, normData.labelMin, normData.labelMax);


    
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

      const result = await model.fit(normalizedInputs, normalizedLabels, sequentially);
  
      const thisScore = testModel(model, inputEvaluationTensor, labelEvaluationTensor, normData);
      const prefix = `${loops}: `;
      console.log(prefix + "Metric of prediction = ", thisScore.toFixed(4), " best so far ", bestSoFar.toFixed(4));
      if(thisScore < bestSoFar) {
        model.save(`file://${brainPath(`${file}-${thisScore.toFixed(4)}.brain`)}`);
        bestSoFar = thisScore;
        console.log(prefix + "A best! ^^^^^^^^^^^^^^^^^^^^^^^^");
      }
      loops++;
    }

    //fs.writeFileSync(brainPath(`${file}.brain`), JSON.stringify(nn.toJSON()));
    debugger;
  })
}