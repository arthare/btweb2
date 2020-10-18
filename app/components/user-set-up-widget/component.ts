import Component from '@ember/component';
import Ember from 'ember';
import { computed } from '@ember/object';
import Devices from 'bt-web2/services/devices';

export interface UserSetupParameters {
  name:string;
  handicap:number;
  imageBase64:string|null;
}

export const USERSETUP_KEY_IMAGE = "user-set-up:lastImage";
export const USERSETUP_KEY_NAME = "user-set-up:lastName";
export const USERSETUP_KEY_HANDICAP = "user-set-up:lastHandicap";

function handleFileSelect(this:UserSetUp, evt:any) {
  var files = evt.target.files; // FileList object
  // Loop through the FileList and render image files as thumbnails.
  for (var i = 0, f; f = files[i]; i++) {

    // Only process image files.
    if (!f.type.match('image.*')) {
      continue;
    }

    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = ((theFile) => {
      return (e:any) => {
        // Render thumbnail.
        this.setImage(e.target.result, false);
      };
    })(f);

    // Read in the image file as a data URL.
    reader.readAsDataURL(f);
  }
}

function resizeImage(originalBase64:string, maxWidth:number, maxHeight:number):Promise<string> {

  return new Promise((resolve) => {
    var img = new Image;
    img.onload = function() {
      const aspect = img.width / img.height;

      let desiredHeight = 64;
      let desiredWidth = desiredHeight * aspect;
      if(aspect > 1) {
        // wider than high
        desiredWidth = maxWidth;
        desiredHeight = maxWidth / aspect;
      } else {
        desiredHeight = maxHeight;
        desiredWidth = maxHeight * aspect;
      }
  
      var canvas = document.createElement('canvas');
      canvas.width = desiredWidth;
      canvas.height = desiredHeight;
      canvas.style.width = desiredWidth + 'px';
      canvas.style.height = desiredHeight + 'px';
      canvas.style.position = 'fixed';
      canvas.style.left = '-10000px';
      canvas.style.top = '0px';
      canvas.style.zIndex = '10000';
      canvas.style.border = "1px solid black";
      document.body.appendChild(canvas);
  
      var ctx = canvas.getContext('2d');
      if(ctx){
        ctx.drawImage(img, 0, 0, desiredWidth, desiredHeight);
    
        var newDataUri = canvas.toDataURL('image/jpeg', 0.75);
        document.body.removeChild(canvas);
        resolve(newDataUri);
      }
    }
    img.src = originalBase64;
  })


}

export default class UserSetUp extends Component.extend({
  // anything which *must* be merged to prototype here
  devices: <Devices><unknown>Ember.inject.service('devices'),

  userName:'Art',
  userHandicap:'300',
  canDoBluetooth: true,
  onDone: (param:UserSetupParameters) => {},

  actions: { 
    done() {
      const displayImage:HTMLImageElement|null = this.element.querySelector('.user-set-up__image');
      let imageBase64 = null;
      if(displayImage) {
        imageBase64 = displayImage.src;
      }

      localStorage.setItem(USERSETUP_KEY_HANDICAP, '' + this.userHandicap);
      localStorage.setItem(USERSETUP_KEY_NAME, '' + this.userName);

      this.onDone({
        name: this.userName,
        handicap: parseFloat(this.userHandicap),
        imageBase64: imageBase64,
      })
    }

  }
}) {

  didInsertElement() {
    window.assert2(this.onDone);
    

    const lastImage = window.localStorage.getItem(USERSETUP_KEY_IMAGE);
    if(lastImage) {
      this.setImage(lastImage, false);
    }

    const lastName = window.localStorage.getItem(USERSETUP_KEY_NAME);
    if(lastName) {
      this.set('userName', lastName);
    }

    const lastHandicap = '' + window.localStorage.getItem(USERSETUP_KEY_HANDICAP);
    if(lastHandicap && isFinite(parseFloat(lastHandicap)) ) {
      this.set('userHandicap', lastHandicap);
    }

    const files = this.element.querySelector('input[type="file"]');
    if(files) {
      files.addEventListener('change', handleFileSelect.bind(this), false);
    }
  }

  setImage(base64:string, recursed:boolean) {

    if(!recursed) {
      console.log("setting ", base64.substr(0, 100), " with length ", base64.length, " to localstorage");
      localStorage.setItem(USERSETUP_KEY_IMAGE, base64);
    }

    const img:HTMLImageElement = document.createElement('img');
    img.onload = () => {
      // ok, we've got the image
      if(img.width <= 64 && img.height <= 64) {
        // this image is fine!
        const displayImage:HTMLImageElement|null = this.element.querySelector('.user-set-up__image');
        if(displayImage) {
          displayImage.src = base64;
        } else {
          // lol what
        }
      } else {
        // we need to resize this sucker
        
        return resizeImage(base64, 64, 64).then((resizedBase64) => {
          this.setImage(resizedBase64, true);
        })
      }
    }
    img.src = base64;
  }

  // normal class body definition here
  @computed("userName", "userHandicap")
  get disableDone():boolean {
    return !this.get('userName') || !this.get('userHandicap');
  }
};
