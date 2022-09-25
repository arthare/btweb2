import { UserTypeFlags } from "../tourjs-shared/User";
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
  key:string;
  types:number[];
}

function RankingList(props:{title:string, names:string[], values:number[], bigToLittle:boolean, formatValues:(val:number, index:number)=>string, formatClass:(index:number)=>string[]}) {

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
        return <li className={`RankingList__Item ${props.formatClass(row.orgIdx).join(' ')}`}>{props.formatValues(row.val, row.orgIdx)}: {row.name}</li>
      })}
    </ul>
  </>)
}

export default function PostRaceView(props:{raceResults:RaceResults}) {
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

  const permalink = `https://${window.location.host}/results/${props.raceResults.key}`;

  const formatClass = (index:number):string[] => {
    const typ = props.raceResults.types[index];

    let classes = [];
    if(typ & UserTypeFlags.Ai) {
      classes.push('Ai');
    } else {
      classes.push('Human');
    }
    if(typ & UserTypeFlags.Bot) {
      classes.push('Bot');
    }
    if(typ & UserTypeFlags.Local) {
      classes.push('Local');
    }
    if(typ & UserTypeFlags.Remote) {
      classes.push('Remote');
    }
    return classes;
  }

  return <div className="PostRaceView__Container">
    <h2>You've finished a {props.raceResults.raceLengthKm.toFixed(1)}km Race!</h2>
    <p>Permalink: <a href={permalink}>Permalink</a></p>
    <RankingList title="Who Won? Finishing Order" formatClass={formatClass} names={props.raceResults.names} values={props.raceResults.rankings} bigToLittle={false} formatValues={(val:number, index:number) => "#" + (val+1) + " - " + formatSecondsHms(props.raceResults.times[index])} />

    <RankingList title="Effort: FTP-Seconds Spent" formatClass={formatClass} names={props.raceResults.names} values={props.raceResults.efficiency} bigToLittle={true} formatValues={(val:number, index:number) => val.toFixed(0) + "/km"} />
    
    <RankingList title="Drafting: FTP-Seconds Saved " formatClass={formatClass} names={props.raceResults.names} values={props.raceResults.hsSaved} bigToLittle={true} formatValues={(val:number, index:number) => val.toFixed(1)} />
    
    {Object.keys(props.raceResults.userSpending[0]).map((key, index) => {
      return <RankingList title={userSpendingKeyToString(key)} formatClass={formatClass} names={props.raceResults.names} values={props.raceResults.userSpending.map((us) => us[key])} bigToLittle={true} formatValues={(val:number, index:number) => val.toFixed(1)} />
    })}
  </div>
}