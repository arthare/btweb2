import { RaceState } from "../tourjs-shared/RaceState";
import { RideMapElevationOnly } from "../tourjs-shared/RideMap";
import { UserInterface, UserTypeFlags } from "../tourjs-shared/User";
import { assert2 } from "../tourjs-shared/Utils";
import { DistanceDisplay, TimeDisplay } from "./PreRaceView";
import HumanGroupMember from '../AppImg/no-face.png';
import RobotGroupMember from '../AppImg/robot.png';
import FinishGroupMember from '../AppImg/finishline.png';
import './InRaceViewStatus.scss';
import { getDeviceFactory } from "../tourjs-client-shared/DeviceFactory";
import { AppPlayerContextType } from "../ContextPlayer";
import { useState } from "react";

export function InRaceViewStatus(props:{raceState:RaceState, tmNow:number, playerContext:AppPlayerContextType}) {

  let [tmOfLastNonzero, setTmOfLastNonzero] = useState<number>(0);
  let [lastHandicap, setLastHandicap] = useState<number>(0);
  let [tmStartDisplayHandicap, setTmStartDisplayHandicap] = useState<number>(0);
  const tmNow = new Date().getTime();
  const tmSinceLastNonZero = tmNow - tmOfLastNonzero;
  
  const localUser = props.raceState.getLocalUser();




  let wattage;
  let draftWatts;
  let percentHill;
  let bpm;
  let handicap;

  if(localUser) {
    const currentHandicap = handicap = localUser.getHandicap();
    if(currentHandicap.toFixed(0) !== lastHandicap.toFixed(0)) {
      setLastHandicap(currentHandicap);
      setTmStartDisplayHandicap(tmNow);
      console.log("your handicap changed!");
    }
    const power = localUser.getLastPower();
    
    if(props.playerContext.powerDevice) {
      // ok, we appear to have a power device
      if(power > 0 && tmSinceLastNonZero > 1000) {
        setTmOfLastNonzero(new Date().getTime());
      }
    }

    wattage = `${power.toFixed(0)}⚡`;

    const savings = localUser.getLastWattsSaved();
    if(savings && savings.watts > 0) {
      draftWatts = `+${savings.watts.toFixed(0)}⚡`;
    }

    const slope = localUser.getLastSlopeInWholePercent();
    percentHill = slope.toFixed(1) + '%';

    const hrm = localUser.getLastHrm(props.tmNow);
    if(hrm) {
      bpm = `${hrm.toFixed(0)}❤`
    } else {
      bpm = `--❤`;
    }
  }

  const onConnectPm = async () => {
    const device = await getDeviceFactory().findPowermeter();
    console.log("set power device to ", device);
    props.playerContext.setPowerDevice(device);
    return device;
  }

  let hasPower = tmSinceLastNonZero < 5000;
  const connectClass = hasPower ? "Power" : "NoPower";

  let handiDisplay:boolean = tmNow < tmStartDisplayHandicap + 10000;

  return <><div className="InRaceViewStatus__Container">
    {wattage && <div className="InRaceViewStatus__InfoChunk">
      {wattage}
      {draftWatts && <span className="InRaceViewStatus__Draft">({draftWatts} draft)</span>}
    </div>}
    {percentHill && <div className="InRaceViewStatus__InfoChunk">
      {percentHill}
    </div>}
    {bpm && <div className="InRaceViewStatus__InfoChunk">
      {bpm}
    </div>}
    <div className={`InRaceViewStatus__Connect ${connectClass}`} onClick={() => onConnectPm()}>
      🔌
    </div>
  </div>
  <div className={`InRaceViewStatus__Handicap ${handicap && handiDisplay && 'Shown'}`}>
    FTP: {handicap.toFixed(0)}⚡
  </div>
  </>
}