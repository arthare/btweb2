import { CanvasRenderingContext2D } from "react-native-canvas";
import { DecorationFactory, LoadedDecoration, ThemeConfig } from "./DecorationFactory";

export class WebDecorationFactory<TImageType,TCanvasType> extends DecorationFactory<TImageType, TCanvasType> {
  
  constructor(rootResourceUrl:string, themeConfig:ThemeConfig, fnCreateImage:()=>TImageType) {
    super();
    this._availableDecorations = [];

    themeConfig.decorationSpecs.forEach((decSpec) => {

      let cNeededToLoad = decSpec.imageUrl.length;
      let cLoaded = 0;
      let imageElements:TImageType[] = [];
      decSpec.imageUrl.forEach((imgUrl) => {
        const img = fnCreateImage();
        img.onload = () => {
          // we're loaded!  this is now a loaded decoration
          console.log("loaded ", img.src);
          imageElements.push(this.flipImage(img));
          cLoaded++;
          if(cLoaded === cNeededToLoad) {
            this._availableDecorations.push(new LoadedDecoration<TImageType, TCanvasType>(decSpec, imageElements));
          }
        }
        img.onerror = () => {
          console.log("failed to load ", img.src);
        }
        
        img.src = rootResourceUrl + imgUrl;
        console.log("trying to load ", img.src);
      })
    })
  }

  private flipImage(img:TImageType):TImageType {
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
