import Route from '@ember/routing/route';

async function loadScript(src:string) {
  const script = document.createElement('script');
  script.src = src;

  return new Promise((resolve) => {
    script.onload = resolve;
    document.head.appendChild(script);
  })
}

export default class Ai extends Route.extend({
  // anything which *must* be merged to prototype here
}) {
  // normal class body definition here
  async beforeModel() {
    await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.0.0/dist/tf.min.js');
    await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-vis");
  }

  model() {

  }

  setupController(controller:any, params:any) {
    controller.startup();
  }
}
