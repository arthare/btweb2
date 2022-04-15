import { useEffect, useState } from "react"
import './NoBleHelper.scss'

export enum UnsupportMode {
  Supported,
  BrowserUnsupported,
  BleUnavailable,
  Unknown,
}

function SupportTree(props:{title:string, subtitle:string, pc:string[], android:string[], ios:string[], macos:string[]}) {
  return (<div className="NoBleHelper__SupportTree--Container">
    <h3>{props.title}</h3>
    <p>{props.subtitle}</p>
    <div className="NoBleHelper__SupportTree--Chunk">
      <p>PC</p>
      <ul>
        {props.pc.map((str, index) => <li key={index}>{str}</li>)}
      </ul>
    </div>
    
    <div className="NoBleHelper__SupportTree--Chunk">
      <p>Android</p>
      <ul>
        {props.android.map((str, index) => <li key={index}>{str}</li>)}
      </ul>
    </div>
    
    <div className="NoBleHelper__SupportTree--Chunk">
      <p>Mac Laptops</p>
      <ul>
        {props.macos.map((str, index) => <li key={index}>{str}</li>)}
      </ul>
    </div>
    
    <div className="NoBleHelper__SupportTree--Chunk">
      <p>iOS</p>
      <ul>
        {props.ios.map((str, index) => <li key={index}>{str}</li>)}
      </ul>
    </div>
  </div>

  )
}

export default function NoBleHelper() {

  let [supportState, setSupportState] = useState<UnsupportMode>(UnsupportMode.Unknown);

  useEffect(() => {
    // startup ble support check
    async function doIt() {
      if(!window.navigator.bluetooth) {
        setSupportState(UnsupportMode.BrowserUnsupported);
      } else {
        // sometimes we'll still have window.navigator.bluetooth but stuff still won't work
        const available = await window.navigator.bluetooth.getAvailability();
        if(!available) {
          setSupportState(UnsupportMode.BleUnavailable);
        } else {
          setSupportState(UnsupportMode.Supported);
        }
      }
    }
    doIt();
  }, []);

  console.log("noble support state ", supportState);
  switch(supportState) {
    case UnsupportMode.Supported:
    case UnsupportMode.Unknown:
      return <></>;
    case UnsupportMode.BleUnavailable:
      return <div className="NoBleHelper__Container">
        <SupportTree 
            title="BLE Unavailable"
            subtitle="It looks like your browser supports web-bluetooth, but bluetooth is disabled, denied, or unavailable"
            pc={["You may have to enable bluetooth.", "If you're sure it is enabled, you may need a BLE adapter like an IOGear GBU521"]}
            android={["You may have to enable bluetooth.", "Possibly, you may need to turn it off and on again or reboot your phone."]}
            ios={["iOS is not supported - Apple does not permit web-bluetooth on iOS in any browser", "You may have luck with the Bluefy app, though this has not been tested"]}
            macos={["You may have to enable bluetooth", "You may have to give Chrome bluetooth permissions"]}
            />
      </div>
    case UnsupportMode.BrowserUnsupported:
      return <div className="NoBleHelper__Container">
        <SupportTree 
            title="Browser Missing BLE Support"
            subtitle="Your browser does not support web-bluetooth"
            pc={["Use Chrome"]}
            android={["Use Chrome"]}
            ios={["iOS is not supported - Apple does not permit web-bluetooth on iOS in any browser", "You may have luck with the Bluefy app, though this has not been tested"]}
            macos={["Use Chrome", "You may have to give Chrome bluetooth permissions"]}
            />
      </div>

  }
}