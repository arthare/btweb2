import Component from '@ember/component';
import { UserDisplay } from 'bt-web2/shared/User';

export default class DisplayPreRaceRider extends Component.extend({
  // anything which *must* be merged to prototype here
  classNames: ['display-pre-race-rider__container'],
  display: <UserDisplay><unknown>null,
}) {
  // normal class body definition here
  didInsertElement() {
    const display = this.get('display');
    const image = display.user.getImage();
    if(image) {
      const myImg:HTMLElement|null = this.element.querySelector('.display-pre-race-rider__image');
      if(myImg) {
        myImg.style.backgroundImage = `url('${image}')`;
      }
    }
  }
};
