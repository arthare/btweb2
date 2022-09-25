import { RaceState } from "../tourjs-shared/RaceState";
import { assert2, formatSecondsHms } from "../tourjs-shared/Utils";
import './PostRaceView.scss';

interface RaceResults {
  raceLengthKm:number;
  tmRaceStart:number;
  names:string[];
  rankings:number[];
  efficiency:number[];
  hsSaved:number[];
  times:number[];
  userSpending:{[key:string]:number}[];
}

function RankingList(props:{title:string, names:string[], values:number[], bigToLittle:boolean, formatValues:(val:number, index:number)=>string}) {

  assert2(props.values.length === props.names.length);

  const comboVals = props.values.map((val, index) => {
    return {
      name: props.names[index],
      val: props.values[index],
      orgIdx: index,
    }
  });
  if(props.bigToLittle) {
    comboVals.sort((a, b) => a.val > b.val ? -1 : 1);
  } else {
    comboVals.sort((a, b) => a.val > b.val ? 1 : -1);
  }
  return (<>
    <h3>{props.title}</h3>
    <ul>
      {comboVals.map((row, index) => {
        return <li>{props.formatValues(row.val, row.orgIdx)}: {row.name}</li>
      })}
    </ul>
  </>)
}

export default function PostRaceView(props:{raceState:RaceState, raceResults:RaceResults}) {
  console.log("Post race view raceresults = ", props.raceResults);

  function userSpendingKeyToString(key:string):string {
    switch(key) {
      case "whole-course": return "Whole Course Spending";
      case "while-downhill": return "While Downhill Spending";
      case "first-half": return "First Half Spending";
      case "last-500m": return "Last 500m Spending";
      case "last-half": return "Second Half Heroes";
    }
  }

  return <div className="PostRaceView__Container">
    <h2>You've finished a {props.raceResults.raceLengthKm.toFixed(1)}km Race!</h2>

    <RankingList title="Who Won? Finishing Order" names={props.raceResults.names} values={props.raceResults.rankings} bigToLittle={false} formatValues={(val:number, index:number) => "#" + (val+1) + " - " + formatSecondsHms(props.raceResults.times[index])} />

    <RankingList title="Effort: FTP-Seconds Spent" names={props.raceResults.names} values={props.raceResults.efficiency} bigToLittle={true} formatValues={(val:number, index:number) => val.toFixed(0) + "/km"} />
    
    <RankingList title="Drafting: FTP-Seconds Saved " names={props.raceResults.names} values={props.raceResults.hsSaved} bigToLittle={true} formatValues={(val:number, index:number) => val.toFixed(1)} />
    
    {Object.keys(props.raceResults.userSpending[0]).map((key, index) => {
      return <RankingList title={userSpendingKeyToString(key)} names={props.raceResults.names} values={props.raceResults.userSpending.map((us) => us[key])} bigToLittle={true} formatValues={(val:number, index:number) => val.toFixed(1)} />
    })}
  </div>
}