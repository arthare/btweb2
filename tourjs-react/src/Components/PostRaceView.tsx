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

function RankingList(props:{title:string, names:string[], values:number[], bigToLittle:boolean, formatValues:(val:number, unsortedIndex:number, sortedIndex:number)=>string, formatClass:(index:number)=>string[]}) {

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
        return <li className={`RankingList__Item ${props.formatClass(row.orgIdx).join(' ')}`}>{props.formatValues(row.val, row.orgIdx, index)}: {row.name}</li>
      })}
    </ul>
  </>)
}

export default function PostRaceView(props:{raceResults:RaceResults}) {
  console.log("Post race view raceresults = ", props.raceResults);

  function userSpendingKeyToString(key:string):string {
    switch(key) {
      case "whole-course": return "Whole Course Spending (total)";
      case "while-downhill": return "While Downhill Spending (total)";
      case "while-uphill": return "While Uphill (total)";
      case "first-half": return "First Half Spending (total)";
      case "last-half": return "Second Half Spending (total)";
      case "last-500m": return "Last 500m Spending (/total)";
      default:
        console.warn("Don't know good string for " + key);
        debugger;
        return key;
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

  const formatValuesForFinishOrder = (val:number, orgIdx:number, sortedIndex:number) => {
    const finishTime = props.raceResults.times[orgIdx];
    let timeValue = '';
    if(finishTime < 0 || finishTime === Number.MAX_SAFE_INTEGER) {
      timeValue = 'DNF';
    } else {
      timeValue = formatSecondsHms(props.raceResults.times[orgIdx]);
    }

    return '#' + (sortedIndex+1) + ' - ' + timeValue;
  }

  const filteredTimes = props.raceResults.times.map((time) => {
    if(time <= 0) {
      time = Number.MAX_SAFE_INTEGER;
    }
    return time;
  })
  return <div className="PostRaceView__Container">
    <h2>You've finished a {props.raceResults.raceLengthKm.toFixed(1)}km Race!</h2>
    <p>Permalink: <a href={permalink}>Permalink</a></p>
    <RankingList title="Who Won? Finishing Order" formatClass={formatClass} names={props.raceResults.names} values={filteredTimes} bigToLittle={false} formatValues={formatValuesForFinishOrder} />

    <RankingList title="Effort: FTP-Seconds Spent Per Km" formatClass={formatClass} names={props.raceResults.names} values={props.raceResults.efficiency} bigToLittle={true} formatValues={(val:number, index:number, sortedIndex:number) => val.toFixed(0) + "/km"} />
    
    <RankingList title="Drafting: FTP-Seconds Saved " formatClass={formatClass} names={props.raceResults.names} values={props.raceResults.hsSaved} bigToLittle={true} formatValues={(val:number, index:number, sortedIndex:number) => val.toFixed(1)} />
    
    <h4>Total Spending In Key Scenarios</h4>
    {Object.keys(props.raceResults.userSpending[0]).map((key, index) => {
      return <RankingList title={userSpendingKeyToString(key)} formatClass={formatClass} names={props.raceResults.names} values={props.raceResults.userSpending.map((us) => us[key])} bigToLittle={true} formatValues={(val:number, index:number, sortedIndex:number) => val?.toFixed(1) || "N/A"} />
    })}
  </div>
}