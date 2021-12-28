import Controller from '@ember/controller';
import { doNNTrainWithSnapshots, TrainingSnapshotV2 } from 'bt-web2/server-client-common/ServerAISnapshots';
import Ember from 'ember';

const handleFiles = (files:any):Promise<TrainingSnapshotV2[]> => {
  console.log("handling files ", files);

  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = async (theFile:ProgressEvent<FileReader>) => {
      const res = theFile.target?.result;
      const str = new TextDecoder().decode(res as any);
      // ok, str will be a bunch of valid JSONs, divided by "$$" to split them up
      const chunks = str.split('$$').filter((res) => !!res.trim());
      const datas:TrainingSnapshotV2[] = chunks.map((c) => JSON.parse(c));
  
      resolve(datas);
  
    }
    fr.readAsArrayBuffer(files[0]);
  })
}

export default class Ai extends Controller.extend({
  // anything which *must* be merged to prototype here
  datas:null as any,
  running:false,

  actions: {
    async onFileChange(evt:any) {
      console.log("file drop ", evt);
      const files = evt.target.files;
      console.log("files = ", files);
      const datas = await handleFiles(files);
      this.set('datas', datas);
    },
    cancel() {
      this.set('running', false);
    },
    async train() {
      const tfvis = (window as any).tfvis;
      tfvis.visor();

      const metrics = ['mse'];
      const container = {
        name: 'show.fitCallbacks',
        tab: 'Training',
        styles: {
          height: '1000px'
        }
      };
      //const callbacks = tfvis.show.fitCallbacks(container, metrics);
      const callbacks = undefined;


      const tf = (window as any).tf;

      const datas = this.get('datas');
      const writeResult = (fileName:string, contents:string) => {

        var data = new Blob([contents], {type: 'text/plain'});
        var url = window.URL.createObjectURL(data);
        const linky = document.createElement('a');
        linky.href = url;
        linky.download = fileName;
        linky.target="_blank";
        document.body.appendChild(linky);
        linky.click();
        document.body.removeChild(linky);
      }

      this.set('running', true);
      await doNNTrainWithSnapshots(tf, 'art', datas, writeResult, callbacks, () => !this.get('running'));
      debugger;
    }
  }
}) {
  // normal class body definition here

  startup() {
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'ai': Ai;
  }
}
