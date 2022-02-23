import Component from '@ember/component';
import Ember from 'ember';
import { computed } from '@ember/object';
import Devices from 'bt-web2/services/devices';
import md5 from 'ember-md5';

export interface UserSetupParameters {
  name:string;
  handicap:number;
  imageBase64:string|null;
  bigImageMd5:string|null;
}

export const USERSETUP_KEY_IMAGE = "user-set-up:lastImage";
export const USERSETUP_KEY_NAME = "user-set-up:lastName";
export const USERSETUP_KEY_HANDICAP = "user-set-up:lastHandicap";
export const USERSETUP_PAST_USERS = "user-set-up:past-users";

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

        const b64 = e.target.result;
        let appropriateSizeImagePromise = Promise.resolve(b64);
        if(b64.length > 4*1024*1024) {
          // this image is too damn big
          console.log("image from camera is too large " + (b64.length/1024).toFixed(0) + "kb, need to downsize");
          appropriateSizeImagePromise = resizeImage(b64, 1024, 1024);
        } else {
          // this image is fine
        }

        return appropriateSizeImagePromise.then((b64Smaller) => {
          this.setImage(b64Smaller, false);
        })
      };
    })(f);

    // Read in the image file as a data URL.
    reader.readAsDataURL(f);
  }
}

export function resizeImage(originalBase64:string, maxWidth:number, maxHeight:number):Promise<string> {

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

export function storeFromVirginImage(base64:string, recursed:boolean, displayImage:HTMLImageElement|null):Promise<string> {
  
  if(!recursed) {
    console.log("setting ", base64.substr(0, 100), " with length ", base64.length, "and md5 ", md5(base64), " to localstorage");
    localStorage.setItem(USERSETUP_KEY_IMAGE, base64);
  }
  

  const img:HTMLImageElement = document.createElement('img');
  return new Promise((resolve, reject) => {
    img.onload = () => {
      // ok, we've got the image
      if(img.width <= 256 && img.height <= 256) {
        // this image is fine!
        if(displayImage) {
          displayImage.src = base64;
        } else {
          // lol what
        }
        return resolve(base64);
      } else {
        // we need to resize this sucker
        
        return resizeImage(base64, 256, 256).then((resizedBase64) => {
          return storeFromVirginImage(resizedBase64, true, displayImage);
        }).then(resolve, reject);
      }
    }
    img.src = base64;

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
    useOldUser(user:any) {
      console.log("useOldUser ", user);
      this.set('userName', user.name);
      this.set('userHandicap', user.handicap);
      
      const displayImage:HTMLImageElement|null = this.element.querySelector('.user-set-up__image');
      if(displayImage) {
        displayImage.src = user.imageBase64;
        window.localStorage.setItem(USERSETUP_KEY_IMAGE, user.imageBase64);
      }

    },
    done() {
      const displayImage:HTMLImageElement|null = this.element.querySelector('.user-set-up__image');
      const bigImageBase64 = localStorage.getItem(USERSETUP_KEY_IMAGE);
      let imageBase64 = null;
      if(displayImage) {
        imageBase64 = displayImage.src;
      }

      localStorage.setItem(USERSETUP_KEY_HANDICAP, '' + this.userHandicap);
      localStorage.setItem(USERSETUP_KEY_NAME, '' + this.userName);

      const user = {
        name: this.userName,
        handicap: parseFloat(this.userHandicap),
        imageBase64: imageBase64,
        bigImageMd5: md5(bigImageBase64),
      };
      const oldUsers = this.get('pastUsers');
      oldUsers[user.name] = user;
      window.localStorage.setItem(USERSETUP_PAST_USERS, JSON.stringify(oldUsers));

      this.onDone(user);
    }

  },

  pastUsers: Ember.computed(function() {
    try {
      const data = window.localStorage.getItem(USERSETUP_PAST_USERS);
      if(!data) {
        return null;
      }
      const users = JSON.parse(data);
      return users; // this will be a hash from names to user objects (things that we would pass to onDone())
    } catch(e) {
      return null;
    }
  }),
}) {

  didInsertElement() {
    window.assert2(this.onDone);
    

    const lastImage = window.localStorage.getItem(USERSETUP_KEY_IMAGE);
    if(lastImage) {
      this.setImage(lastImage);
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

  setImage(base64:string) {

    const displayImage:HTMLImageElement|null = this.element.querySelector('.user-set-up__image');
    storeFromVirginImage(base64, false, displayImage);
  }

  // normal class body definition here
  @computed("userName", "userHandicap")
  get disableDone():boolean {
    return !this.get('userName') || !this.get('userHandicap');
  }
};
