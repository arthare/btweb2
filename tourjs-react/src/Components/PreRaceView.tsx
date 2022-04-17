import { prependOnceListener } from "process";
import { RaceState } from "../tourjs-shared/RaceState";
import { UserInterface, UserTypeFlags } from "../tourjs-shared/User";
import { RaceMapStatic } from "./RaceMapStatic";
import RaceMini from "./RaceMini";
import './PreRaceView.scss'
import RobotFace from '../AppImg/robot.png'
import HumanNoFace from '../AppImg/no-face.png';
import { getDeviceFactory } from "../tourjs-client-shared/DeviceFactory";
import { AppPlayerContextType } from "../ContextPlayer";

function PreRacePerson(props:{user:UserInterface}) {

  let imgSrc = props.user.getImage() || "";

  if(!imgSrc) {
    // no image - could be a human without image, or a bot
    if(props.user.getUserType() & UserTypeFlags.Ai) {
      imgSrc = RobotFace;
    } else {
      imgSrc = HumanNoFace;
    }
  }

  return <div className="PreRacePerson__Container">
    <div className="PreRacePerson__Inner-Container">
      <div className="PreRacePerson__Image-Container">
        <img src={imgSrc} className="PreRacePerson__Image" />
      </div>
      <table className="PreRacePerson__Data-Container">
        <tbody>
          <tr>
            <td className="PreRacePerson__Data-Container--Key">Name</td>
            <td className="PreRacePerson__Data-Container--Value">{props.user.getName()}</td>
          </tr>
          <tr>
            <td className="PreRacePerson__Data-Container--Key">Handicap</td>
            <td className="PreRacePerson__Data-Container--Value">{props.user.getHandicap().toFixed(0)}W</td>
          </tr>
          <tr>
            <td className="PreRacePerson__Data-Container--Key">Power</td>
            <td className="PreRacePerson__Data-Container--Value">{props.user.getLastPower().toFixed(0)}W</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
}

function PreRaceSection(props:{name:string, children:any}) {
  

  return <div className="PreRaceSection__Container">
    <div className="PreRaceSection__Name">{props.name}</div>
    <div className="PreRaceSection__People">
      {props.children}
    </div>
  </div>
}
export function DistanceDisplay(props:{meters:number}) {
  const d = Math.abs(props.meters);
  if(d < 1000) {
    return <>{d.toLocaleString(undefined, {maximumFractionDigits: 0}) + 'm'}</>;
  } else if(d < 10000) {
    return <>{(d/1000).toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2}) + 'km'}</>;
  } else {
    return <>{(d/1000).toLocaleString(undefined, {maximumFractionDigits: 1, minimumFractionDigits: 1}) + 'km'}</>;
  }
}
export function TimeDisplay(props:{ms:number}) {

  let str = '';
  let ms = props.ms;
  if(ms < 60000) {
    str = (ms / 1000).toFixed(1) + 's';
  } else {
    const minutes = Math.floor(ms / 60000);
    ms -= minutes * 60000;
    const seconds = ms / 1000;
    str = `${minutes}m ${seconds.toFixed(0)}s`;
  }

  return <>{str}</>
}

export default function PreRaceView(props:{raceState:RaceState, tmStart:number, playerContext:AppPlayerContextType}) {

  const tmNow = new Date().getTime();

  const allUsers = props.raceState.getUserProvider().getUsers(tmNow);
  const humans = allUsers.filter((user) => !(user.getUserType() & UserTypeFlags.Ai));
  const notHumans = allUsers.filter((user) => (user.getUserType() & UserTypeFlags.Ai));
  const map = props.raceState.getMap();

  const onAddPowermeter = async () => {
    const device = await getDeviceFactory().findPowermeter();
    props.playerContext.setPowerDevice(device);
    return device;

  }
  const onAddHrm = async () => {
    const device = await getDeviceFactory().findHrm();
    props.playerContext.setPowerDevice(device);
    return device;
  }

  return <div>
    <h1>Pre-Race Lobby</h1>

    <PreRaceSection name="Map">
      <table className="PreRaceView__MapDetails">
        <tbody>
          <tr>
            <td className="PreRacePerson__Data-Container--Key">Race Name:</td>
            <td className="PreRacePerson__Data-Container--Value">{props.raceState.getGameId()}</td>
          </tr>
          <tr>
            <td className="PreRacePerson__Data-Container--Key">Starts in:</td>
            <td className="PreRacePerson__Data-Container--Value"><TimeDisplay ms={props.tmStart - tmNow} /></td>
          </tr>
          <tr>
            <td className="PreRacePerson__Data-Container--Key">Length:</td>
            <td className="PreRacePerson__Data-Container--Value">{map.getLength().toFixed(0)}m</td>
          </tr>
          <tr>
            <td colSpan={2}>
              <RaceMapStatic map={map} className={"PreRaceView__Map"} />
            </td>
          </tr>
        </tbody>
      </table>
    </PreRaceSection>
    <PreRaceSection name="Devices">
      <div className="PreRaceView__DeviceButtons">
        <button onClick={() => onAddPowermeter()}>Add Powermeter</button>
        <button onClick={() => onAddHrm()}>Add Heart Rate</button>
      </div>
      <div className="PreRaceView__DeviceStatus">
        <h3>Current Device Status</h3>
        <table>
          <tbody>
            <tr>
              <td className="PreRacePerson__Data-Container--Key">Power</td>
              <td className="PreRacePerson__Data-Container--Value">{props.playerContext.localUser.getLastPower().toFixed(0)}W</td>
            </tr>
            <tr>
              <td className="PreRacePerson__Data-Container--Key">Heart Rate</td>
              <td className="PreRacePerson__Data-Container--Value">{props.playerContext.localUser.getLastHrm(new Date().getTime()).toFixed(0)}bpm</td>
            </tr>
          </tbody>
        </table>
      </div>
      
    </PreRaceSection>
    <PreRaceSection name="Humans" >
      {humans.map((user) => {
        return <PreRacePerson user={user} />
      })}
    </PreRaceSection>
    <PreRaceSection name="AIs">
      {notHumans.map((user) => {
        return <PreRacePerson user={user} />
      })}
    </PreRaceSection>
  </div>
}