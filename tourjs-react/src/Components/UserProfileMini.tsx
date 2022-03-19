import { useEffect, useState } from "react";
import { TourJsAlias } from "../tourjs-shared/signin-types";
import InlineEdit from "./InlineEdit";
import './UserProfileMini.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {  faCircleCheck, faCircle,  } from '@fortawesome/free-regular-svg-icons'
import {  faPenToSquare, faCamera } from '@fortawesome/free-solid-svg-icons'
import InlineImageEdit from "./InlineImageEdit";



function UserProfileMini(props:{alias: TourJsAlias, fnOnUpdate:(newValue:TourJsAlias)=>void, selected:boolean, fnOnSelect:()=>void}) {

  let [tempAlias, setTempAlias] = useState<TourJsAlias>(props.alias);

  useEffect(() => {
    // on startup make tempAlias a completely separate copy of alias
    setTempAlias(JSON.parse(JSON.stringify(props.alias)));
  }, []);

  const onChangeHandicap = (val:string|number) => {
    if(!val) {
      return;
    }

    if(typeof val === 'string') {
      val = val.trim();
    } else {
      val = '' + val;
    }
    
    if(!val) {
      alert(`Your handicap ${val} doesn't seem to make sense`);
      setTempAlias({...tempAlias});
    } if(parseInt(val) + '' !== val) {
      alert(`Your handicap ${val} doesn't appear to be a whole number`);
      setTempAlias({...tempAlias});
    } else {
      const newAlias:TourJsAlias = {
        ...tempAlias,
        handicap: parseInt(val),
      }
      setTempAlias(newAlias);
      props.fnOnUpdate(newAlias);
    }
  }
  const onChangeName = (val:string) => {
    if(!val) {
      alert(`Your name ${val} is too short`);
      return;
    } else {
      const newAlias:TourJsAlias = {
        ...tempAlias,
        name: val,
      }
      setTempAlias(newAlias);
      props.fnOnUpdate(newAlias);
    }
  }
  const onChangeImage = (image:string) => {
    const newAlias:TourJsAlias = {
      ...tempAlias,
      imageBase64: image,
    }
    setTempAlias(newAlias);
    props.fnOnUpdate(newAlias);
  }


  return (
    <div className="UserProfileMini__Container">
      <div className="UserProfileMini__Image">
        <InlineImageEdit tempAlias={tempAlias} fnOnUpdate={(image:string) => onChangeImage(image)} />
      </div>
      <div className="UserProfileMini__NameHandi">
        <div className="UserProfileMini__Name">
          <InlineEdit label={"Name"} value={tempAlias.name} fnOnChange={(val:string) => onChangeName(val)} />
        </div>
        <div className="UserProfileMini__Handicap">
          <InlineEdit label={"Handicap"} value={tempAlias.handicap} fnOnChange={(val:string) => onChangeHandicap(val)} />
        </div>
      </div>
      <div className="UserProfileMini__Selector">
        {props.selected && (
          <FontAwesomeIcon className="UserProfileMini__Selector--Icon Selected" icon={faCircleCheck} />
        ) || (
          <FontAwesomeIcon className="UserProfileMini__Selector--Icon Unselected" icon={faCircleCheck} onClick={() => {console.log("onselect!"); props.fnOnSelect()}} />
        )}
      </div>
    </div>
  )
}

export default UserProfileMini;