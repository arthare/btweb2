import { prependOnceListener } from "process";
import { RaceState } from "../tourjs-api-lib/RaceState";
import { UserInterface, UserTypeFlags } from "../tourjs-api-lib/User";
import { RaceMapStatic } from "./RaceMapStatic";
import RaceMini from "./RaceMini";
import './PreRaceView.scss'
import RobotFace from '../AppImg/robot.png'
import HumanNoFace from '../AppImg/no-face.png';
import { getDeviceFactory } from "../tourjs-client-lib/DeviceFactory";
import { AppPlayerContextType } from "../ContextPlayer";
import ConnectionManager from "../tourjs-api-lib/communication";
import { useEffect, useState } from "react";
import { scoreUserInterestingNess } from "./InRaceViewLeaderboard";
import { msPromise } from "../tourjs-client-lib/DeviceUtils";

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
            <td className="PreRacePerson__Data-Container--Value">{props.user.getLastPower().power.toFixed(0)}W</td>
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

function UserSummary(props:{user:UserInterface, counter:number}) {

  let [suffix, setSuffix] = useState<string>('');
  let [suffixClass, setSuffixClass] = useState<string>('');

  let extraClass = '';
  if(props.user.getUserType() & UserTypeFlags.Local) {
    extraClass = 'Local';
  } else if(!(props.user.getUserType() & UserTypeFlags.Ai)) {
    extraClass = 'Human'
  }

  useEffect(() => {
    if(extraClass) {
      const data = props.user.getLastPower();
      setSuffixClass(data.power > 0 ? 'Nonzero' : '');

      setSuffix(`- ${props.user.getLastPower().power.toFixed(0)}W`);
    } else {
      setSuffix('');
    }
  }, [props.counter]);


  return <div className={`UserSummary__Container ${extraClass}`}>
    {props.user.getName()} <span className={`UserSummary__Watts ${suffixClass}`}>{suffix}</span>
  </div>
}

export default function PreRaceView(props:{raceState:RaceState, tmStart:number, playerContext:AppPlayerContextType}) {

  const tmNow = new Date().getTime();

  const allUsers = props.raceState.getUserProvider().getUsers(tmNow);
  const humans = allUsers.filter((user) => !(user.getUserType() & UserTypeFlags.Ai));
  const notHumans = allUsers.filter((user) => (user.getUserType() & UserTypeFlags.Ai));
  const map = props.raceState.getMap();
  const [offsetting, setOffsetting] = useState<boolean>(false);
  const [zeroOffsetResultCharacter, setZeroOffsetResultCharacter] = useState<string>('?');
  const [pmStatus, setPmStatus] = useState<string>('');


  const [counter, setCounter] = useState<number>(0);
  const [counterInterval, setCounterInterval] = useState<any>(null);


  const onAddPowermeter = async () => {
    setZeroOffsetResultCharacter('');
    if(props.playerContext.powerDevice !== null) {
      props.playerContext.disconnectPowerDevice();
      await msPromise(1000);
    }
    try {
      const device = await getDeviceFactory().findPowermeter(setPmStatus);
      props.playerContext.setPowerDevice(device);
      return device;
    } catch(e) {
      setPmStatus("Error while connecting powermeter");
    }

  }
  const onDisconnectPowermeter = async () => {
    setZeroOffsetResultCharacter('');
    props.playerContext.disconnectPowerDevice();
  }

  const onStartNow = () => {
    ConnectionManager._this.startRaceSoon(30*1000);
  }
  const onDelayStart = (seconds:number) => {
    ConnectionManager._this.delayRaceStart(seconds*1000);
  }
  const onZeroOffset = async () => {
    setZeroOffsetResultCharacter('?');
    setOffsetting(true);
    try {
      await props.playerContext.zeroOffset();
      setZeroOffsetResultCharacter('✔️');
    } catch(e) {
      setZeroOffsetResultCharacter('❌');
    } finally {
      setOffsetting(false);
    }
  }

  useEffect(() => {
    if(props.playerContext.powerDevice) {
      setPmStatus(`You are connected to ${props.playerContext.powerDevice.name()}`);
    }
  }, [props.playerContext.powerDevice])

  useEffect(() => {
    // on startup, start a 1hz timer
    let counterVal = 0;
    if(counterInterval) {
      clearInterval(counterInterval);
    }
    let timeout = setInterval(() => {
      counterVal++;
      console.log("counter = ", counterVal);
      setCounter(counterVal);
    }, 1000);
    setCounterInterval(timeout);
    return function cleanup() {
      clearInterval(counterInterval);
    }
  }, []);


  const sortedPlayers = allUsers.slice();
  sortedPlayers.sort((a,b) => {
    let pointsLeft = scoreUserInterestingNess(a);
    let pointsRight = scoreUserInterestingNess(b);
    if(pointsLeft !== pointsRight) {
      return pointsLeft > pointsRight ? -1 : 1;
    } else {
      return a.getName() < b.getName() ? -1 : 1;
    }
  })

  return <div className="PreRaceView__Container">
    <div className="PreRaceView__Statuses--Container">
      <button onClick={() => onAddPowermeter()} >
        Reconnect PM<br />
        <span className="PreRaceView__YouAreConnected">{pmStatus}</span>
      </button>
      <button disabled={offsetting} onClick={() => onZeroOffset()} >
        Zero PM<br />
        <span className="PreRaceView__YouAreConnected">{zeroOffsetResultCharacter}</span>
      </button>
      <button onClick={() => onDelayStart(60)} >
        Delay Start
      </button>
      <button onClick={() => onStartNow() }>
        Start Now
      </button>
    </div>
    <div className="PreRaceView__PlayersAndMap--Container">
      <div className="PreRaceView__Players--Container">
        {sortedPlayers.map((u) => <UserSummary user={u} counter={counter} />)}
      </div>
      <div className="PreRaceView__Map--Container">
        <div className="PreRaceView__Map--MapData">
          Race Name: {props.raceState.getGameId()}
        </div>
        <div className="PreRaceView__Map--MapData">
          Starts in: <TimeDisplay ms={props.tmStart - tmNow} />
        </div>
        <div className="PreRaceView__Map--MapData">
          Length: {map.getLength().toFixed(1)}m
        </div>
        <RaceMapStatic map={map} className={"PreRaceView__Map--Static"} />
        <div className="PreRaceView__Map--Image">
        </div>
        
      </div>
    </div>
  </div>
}