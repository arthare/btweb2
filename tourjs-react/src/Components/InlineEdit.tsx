import { useEffect, useRef, useState } from 'react';
import './InlineEdit.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faCancel, faCheck } from '@fortawesome/free-solid-svg-icons'


function InlineEdit(props:{fnOnChange:(value:string|number)=>void, label:string, value:string|number}) {

  const [editing, setEditing] = useState<boolean>(false);
  const [value, setValue] = useState<string|number>(props.value);
  const inputBoxRef = useRef<HTMLInputElement>();


  useEffect(() => {

  }, []);

  const onChange = (evt:any) => {
    setValue(evt.target.value);
  }
  const onApply = () => {
    // they're done editing!
    props.fnOnChange(value);
    setEditing(false);
  }
  const onCancel = () => {
    setValue(props.value);
    setEditing(false);
  }
  const onKeyDown = (evt) => {
    switch(evt.code) {
      case 'Enter':
        onApply();
        break;
      case 'Escape':
        onCancel();
        break;
    }
  }

  useEffect(() => {
    if(editing) {
      // we just started editing.  make sure to select the input box
      setValue(props.value);
      if(inputBoxRef && inputBoxRef.current) {
        console.log("we have an inputbox ref", inputBoxRef);
        const i = inputBoxRef.current as HTMLInputElement;
        if(i) {
          i.focus();
          i.selectionStart = 0;
          i.selectionEnd = i.value.length;
        }
      }
      const i = document.querySelector('input.InlineEdit__Input') as HTMLInputElement;
      if(i) {
        console.log("focused!");
        //i.focus();
      }
    }
  }, [editing, inputBoxRef])


  return (
    <div className="InlineEdit__Container">
      <div className="InlineEdit__Label">{props.label}</div>
      {editing && (<>
                    <input ref={inputBoxRef} onKeyDown={onKeyDown} className="InlineEdit__Input" value={value} onChange={(evt) => onChange(evt)}></input>
                    <FontAwesomeIcon className="InlineEdit__Clickable" icon={faCancel} onClick={()=>onCancel()} />
                    <FontAwesomeIcon className="InlineEdit__Clickable" icon={faCheck} onClick={()=>onApply()} />
                  </>
      ) || (<>
              <div className="InlineEdit__Display">
                {value} 
              </div>
              <FontAwesomeIcon className="InlineEdit__Clickable" icon={faPenToSquare}  onClick={()=>setEditing(true)} onTouchEnd={()=>setEditing(true)} />
            </>
      )}
    </div>
  )
  
}

export default InlineEdit;