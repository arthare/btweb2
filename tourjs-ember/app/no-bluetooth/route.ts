import Route from '@ember/routing/route';

export default class NoBluetooth extends Route.extend({
  // anything which *must* be merged to prototype here
}) {
  // normal class body definition here
  model() {
    if(window?.navigator?.bluetooth?.getAvailability) {
      window.navigator.bluetooth.getAvailability().then((available) => {
        if(available) {
          // oh wait, bluetooth IS available
          this.transitionTo('index');
        } else {
          // still broken
        }
      })
    } else {
      // yep, bluetooth is definitely broken
    }
  }
}
