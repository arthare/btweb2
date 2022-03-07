import { TourJsAlias } from "../tourjs-shared/signin-types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {  faCircleCheck, faCircle,  } from '@fortawesome/free-regular-svg-icons'
import {  faPenToSquare, faCamera } from '@fortawesome/free-solid-svg-icons'
import './InlineImageEdit.scss';

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
function InlineImageEdit(props:{tempAlias:TourJsAlias, fnOnUpdate:(newImageBase64:string)=>void}) {
  
  const onChangeImage = (evt) => {
    // they want to change their image
    const files = evt.target.files;
    const fr = new FileReader();
    fr.onload = async (val:any) => {
      const bigImageBase64:string = val?.target?.result;
      let appropriateSizeImage = bigImageBase64;
      if(bigImageBase64.length > 512*1024) {
        // this image is too damn big
        console.log("image from camera is too large " + (bigImageBase64.length/1024).toFixed(0) + "kb, need to downsize");
        appropriateSizeImage = await resizeImage(bigImageBase64, 1024, 1024);
        console.log("average downsizing, image is ", (appropriateSizeImage.length/1024).toFixed(0));
      } else {
        // this image is fine (512kB or smaller)
      }

      props.fnOnUpdate(appropriateSizeImage);
    }
    fr.readAsDataURL(files[0]);
  }

  return (<>{props.tempAlias.imageBase64 && (<>
    <img className="InlineImageEdit__Image--Element" src={props.tempAlias.imageBase64} />
    <input type="file" accept="image/*" className="InlineImageEdit__File-Picker" onChange={onChangeImage}/>
    <FontAwesomeIcon className="InlineImageEdit__Edit-Icon" icon={faPenToSquare} />
  </>) || (
    <div className="InlineImageEdit__No-Image">
      <FontAwesomeIcon className="InlineImageEdit__Camera-Icon" icon={faCamera} />
      <input type="file" accept="image/*" className="InlineImageEdit__File-Picker" onChange={onChangeImage}/>
    </div>
  )}</>);
}

export default InlineImageEdit;