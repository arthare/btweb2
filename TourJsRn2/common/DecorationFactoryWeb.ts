import { DecorationFactory, LoadedDecoration, ThemeConfig } from "./DecorationFactory";

export class WebDecorationFactory extends DecorationFactory<HTMLImageElement> {
  
  constructor(rootResourceUrl:string, themeConfig:ThemeConfig) {
    super();
    this._availableDecorations = [];

    themeConfig.decorationSpecs.forEach((decSpec) => {

      let cNeededToLoad = decSpec.imageUrl.length;
      let cLoaded = 0;
      let imageElements:HTMLImageElement[] = [];
      decSpec.imageUrl.forEach((imgUrl) => {
        const img = document.createElement('img');
        img.onload = () => {
          // we're loaded!  this is now a loaded decoration
          imageElements.push(this.flipImage(img));
          cLoaded++;
          if(cLoaded === cNeededToLoad) {
            this._availableDecorations.push(new LoadedDecoration(decSpec, imageElements));
          }
        }
        img.src = rootResourceUrl + imgUrl;
      })
    })
  }

  private flipImage(img:HTMLImageElement):HTMLImageElement {
    if(typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
    
      canvas.width  = img.width  ;
      canvas.height = img.height ;
      var newCtx = canvas.getContext('2d') ;
      if(newCtx) {
        newCtx.save      () ;
        newCtx.translate ( img.width / 2, img.height / 2) ;
        newCtx.rotate  (Math.PI);
        newCtx.drawImage ( img, - img.width / 2, - img.height / 2) ; 
        newCtx.restore   () ;
      }
    
      const outImage = document.createElement('img');
      outImage.src = canvas.toDataURL();
      return outImage;
    } else {
      return img;
    }
  }
}
