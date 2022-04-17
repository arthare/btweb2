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

export function InRaceViewStatus(props:{raceState:RaceState, tmNow:number, playerContext:AppPlayerContextType}) {

  const localUser = props.raceState.getLocalUser();
  let wattage;
  let draftWatts;
  let percentHill;
  let bpm;

  if(localUser) {
    const power = localUser.getLastPower();
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

  return <div className="InRaceViewStatus__Container">
    <div className="InRaceViewStatus__Connect" onClick={() => onConnectPm()}>
      🔌
    </div>
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
  </div>
}