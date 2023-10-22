import { RaceState } from "../tourjs-shared/RaceState";
import { HillStats, RideMapElevationOnly } from "../tourjs-shared/RideMap";
import { UserInterface, UserTypeFlags } from "../tourjs-shared/User";
import { assert2 } from "../tourjs-shared/Utils";
import { DistanceDisplay, TimeDisplay } from "./PreRaceView";
import HumanGroupMember from '../AppImg/no-face.png';
import RobotGroupMember from '../AppImg/robot.png';
import FinishGroupMember from '../AppImg/finishline.png';
import './InRaceViewStatus.scss';
import { getDeviceFactory } from "../tourjs-client-shared/DeviceFactory";
import { AppPlayerContextType } from "../ContextPlayer";
import { useEffect, useState } from "react";
import { msPromise } from "../tourjs-client-shared/DeviceUtils";

function ProgressCanvass(props:{pct:number, className:string}) {

  let [myId, setMyId] = useState<string>('');

  useEffect(() => {
    setMyId('progresscanvas_' + Math.random());
  }, []);

  useEffect(() => {
    let animReq:any;
    function paintFrame() { 
      const canvas:HTMLCanvasElement|null = document.getElementById(myId) as HTMLCanvasElement|null;
      const ctx = canvas?.getContext('2d');
      if(canvas && ctx) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        const circleWidth = Math.min(canvas.width, canvas.height)*0.8;
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = circleWidth/10;
        ctx.fillStyle =  'rgba(255,255,255,0.3)';
        ctx.fillRect(0,0,canvas.width,canvas.height);
        //ctx.fillStyle = 'red';
        //ctx.fillRect(0,0,canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255,255,255,1)';
        ctx.fillRect(0,0,props.pct*canvas.width,canvas.height);
        
        animReq = requestAnimationFrame(paintFrame);
      }

    }
    animReq = requestAnimationFrame(paintFrame);

    return function cleanup() {
      cancelAnimationFrame(animReq);
    }

  }, [props.pct])

  return <canvas id={myId} className={`ProgressCanvas__Canvas ${props.className}`}></canvas>
}



//Bottom Left Status:
//Wattage
//Hillslope
interface HillStatsExtended extends HillStats {
  tmStarted:number;
}
interface HillStatsCompleted extends HillStatsExtended {
  tmEnded:number;
  tmDisplayUntil:number;
}

let lastHillStats:HillStatsExtended|null = null;


export function InRaceViewStatus(props:{raceState:RaceState, tmNow:number, playerContext:AppPlayerContextType}) {

  const localUser = props.raceState.getLocalUser();

  let wattage;
  let draftWatts;
  let percentHill;
  let bpm;
  let pctUp;


  if(localUser) {
    
    const power = localUser.getLastPower().power;
    

    wattage = `${power.toFixed(0)}⚡`;

    const savings = localUser.getLastWattsSaved();
    if(savings && savings.watts > 0) {
      draftWatts = `+${savings.watts.toFixed(0)}`;
    }

    const slope = localUser.getLastSlopeInWholePercent();
    percentHill = slope.toFixed(1) + '%';

    const hillStats = props.raceState.getMap().getHillStatsAtDistance(localUser.getDistance());
    if(hillStats && hillStats.endElev > hillStats.startElev) {
      pctUp = (localUser.getLastElevation() - hillStats.startElev) / (hillStats.endElev - hillStats.startElev);
    }

    if(hillStats?.id !== lastHillStats?.id) {
      lastHillStats = {
        ...hillStats,
        tmStarted:new Date().getTime(),
      }

    }

    const hrm = localUser.getLastHrm(props.tmNow);
    if(hrm) {
      bpm = `${hrm.toFixed(0)}❤`
    } else {
      bpm = `--❤`;
    }
  }



  return <><div className="InRaceViewStatus__Outer-Container">
    
      {wattage && <div className="InRaceViewStatus__Wattage">
        {wattage}
        {draftWatts && <span className="InRaceViewStatus__Draft">({draftWatts})</span>}
      </div>}
      {percentHill && <div className="InRaceViewStatus__Hill Flex">
        {percentHill}
        <span className="InRaceViewStatus__Hill FlexGrow">{pctUp && <ProgressCanvass pct={pctUp} className="InRaceViewStatus__Progress"/>}</span>
      </div>}

  </div>
  
  </>
}





//Top right Status:
//PM Connect
//FTP
export function InRaceViewStatusExtra(props:{raceState:RaceState, tmNow:number, playerContext:AppPlayerContextType}) {

  let [tmOfLastNonzero, setTmOfLastNonzero] = useState<number>(0);
  let [lastHandicap, setLastHandicap] = useState<number>(0);
  let [tmStartDisplayHandicap, setTmStartDisplayHandicap] = useState<number>(0);
  let [isDoublingPower, setIsDoublingPower] = useState<boolean>(props.playerContext.doublePower);
  const tmNow = new Date().getTime();
  const tmSinceLastNonZero = tmNow - tmOfLastNonzero;
  
  const localUser = props.raceState.getLocalUser();

  let handicap;


  useEffect(() => {
    setIsDoublingPower(props.playerContext.doublePower);
  }, [props.playerContext.doublePower])

  if(localUser) {
    const currentHandicap = handicap = localUser.getHandicap();
    if(currentHandicap.toFixed(0) !== lastHandicap.toFixed(0)) {
      setLastHandicap(currentHandicap);
      setTmStartDisplayHandicap(tmNow);
      console.log("your handicap changed!");
    }
    const power = localUser.getLastPower().power;
    
    if(props.playerContext.powerDevice) {
      // ok, we appear to have a power device
      if(power > 0 && tmSinceLastNonZero > 1000) {
        setTmOfLastNonzero(new Date().getTime());
      }
    }
  }

  const onPmStatusArrived = (str:string) => {

  }

  const onConnectPm = async () => {
    if(props.playerContext.powerDevice !== null) {
      props.playerContext.disconnectPowerDevice();
      await msPromise(1000);
    }
    const device = await getDeviceFactory().findPowermeter(onPmStatusArrived);
    console.log("set power device to ", device);
    props.playerContext.setPowerDevice(device);
    return device;
  }
  const on2XPower = async  () => {
    props.playerContext.set2XMode(!props.playerContext.doublePower);
  }

  let hasPower = tmSinceLastNonZero < 5000;
  const connectClass = hasPower ? "Power" : "NoPower";

  let handiDisplay:boolean = tmNow < tmStartDisplayHandicap + 10000;

  return <><div className="InRaceViewStatus__Outer-Container">
    {localUser && localUser.getDistance() <= 1000 && (
      <div className={`InRaceViewStatus__Connect SmallButton`} onClick={() => on2XPower()}>
        {isDoublingPower && ("2x") || ("1/2")}
      </div>
    )}
    <div className={`InRaceViewStatus__Connect ${connectClass} SmallButton`} onClick={() => onConnectPm()}>
      🔌
    </div>
    <div className={`InRaceViewStatus__Handicap ${handicap && handiDisplay && 'Shown'}`}>
    FTP: {handicap.toFixed(0)}⚡
    </div>
  </div>
  
  </>
}