import React, { useContext, useEffect, useState } from 'react';
import NoBleHelper from './Components/NoBleHelper';
import PowerDevicePicker from './Components/PowerDevicePicker';
import RacePicker from './Components/RacePicker';
import { RaceScheduler } from './Components/RaceScheduler';
import UserProfilePicker from './Components/UserProfilePicker';
import { PacingChallengeResultSubmission, ServerHttpGameListElement } from './tourjs-shared/communication';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { AppAuthContextType } from './ContextAuth';
import { AppPlayerContextType } from './ContextPlayer';
import { AppAuthContextInstance, AppPlayerContextInstance } from './index-contextLoaders';
import { RideMap } from './tourjs-shared/RideMap';
import { RaceMapStatic } from './Components/RaceMapStatic';
import { PacingChallengeDb, PacingChallengeMapName, PacingChallengeMapRecords, getPacingChallengeMap } from './PacingChallengeShared';
import './PacingChallengeSetup.scss';
import { apiGet } from './tourjs-client-shared/api-get';
import { formatSecondsHms } from './tourjs-shared/Utils';
import { normalize } from 'path';

function PacingChallengeMapButton(props:{map:RideMap, strengths:number[], name:string, onSelect:(name:string, strength:number)=>void}) {
  return <div className="PacingChallengeMapButton__Outer-Container">
    <h4>{props.name}</h4>
    <div className="PacingChallengeMapButton__Container">
      <div className="PacingChallengeMapButton__Left">
        <RaceMapStatic className="PacingChallenge__Map--Display" map={props.map} />
      </div>
      <div className="PacingChallengeMapButton__Right">
        {props.strengths.map((s) => {
          return <button className="PacingChallengeMapButton__Right--Button" onClick={() => props.onSelect(props.name, s)}>{(s*100).toFixed(0)}%</button>
        })}
      </div>
    </div>
  </div>
}

const maps:{[key:string]:RideMap} = {
  "hills1": getPacingChallengeMap(PacingChallengeMapName.Hills1),
  "hills2": getPacingChallengeMap(PacingChallengeMapName.Hills2),
  "flat": getPacingChallengeMap(PacingChallengeMapName.Flat),
  "long": getPacingChallengeMap(PacingChallengeMapName.Long),
}

function getRecordsForMap(db:PacingChallengeDb, map:string, strength:number) {
  const mapData:PacingChallengeMapRecords = db[map];
  if(mapData) {
    const strengthKey = 'effort' + (strength*100).toFixed(0);
    const data:PacingChallengeResultSubmission[] = mapData[strengthKey];

    data.sort((a, b) => {
      return a.time < b.time ? -1 : 1;
    })
    return data;
  }
  return [];
}

function normalizeMapName(name:string) {
  return name;
}

function PacingChallengeSetup(props:{authContext:AppAuthContextType, playerContext:AppPlayerContextType}) {
  const navigate = useNavigate();

  let [pacingChallengeRecords, setPacingChallengeRecords] = useState<null|PacingChallengeDb>(null);
  let [mapNameList, setMapNameList] = useState<string[]>([]);

  const strengths = [0.5,0.8,0.9,1.0,1.25];

  console.log("maps = ", mapNameList);
  useEffect(() => {
    apiGet('pacing-challenge-records', {name:'', map:''}).then((currentRecords:PacingChallengeDb) => {
      setPacingChallengeRecords(currentRecords);
    });
  }, [])

  // outer div looks like RaceScheduler__Container
  // map picker looks like BluetoothDevicePicker__Container
  if(!props.playerContext?._localUser) {
    return (<div className="PacingChallenge__Container">
      <h2>Pacing Challenge</h2>
      You need to pick a player for pacing challenge
    </div>)
  }


  const onSelectMap = (name:string, strength:number) => {
    navigate(`/pacing/${name}/${strength}`);
  }



  return (
    <div className="PacingChallenge__Container">
      <h2>Pacing Challenge</h2>

      {pacingChallengeRecords && (
        <table className="PacingChallenge__RecordTable">
          <div className="PacingChallenge__RecordRow">
            <div className="PacingChallenge__RecordCell">Records</div>
            {strengths.map((s) => {
              return <div className="PacingChallenge__RecordCell">{(s*100).toFixed(0)}%</div>
            })}
          </div>
          {Object.keys(pacingChallengeRecords).map((mapName) => {
            return (<div className="PacingChallenge__RecordRow">
              <div className="PacingChallenge__RecordCell">{mapName}</div>
              {strengths.map((s) => {
                const data = getRecordsForMap(pacingChallengeRecords, mapName, s);
                return <div className="PacingChallenge__RecordCell">
                  {data.slice(0,3).map((record) => {
                    return <div className="PacingChallenge__Record">{formatSecondsHms(record.time)} - {record.name}</div>
                  })}
                </div>
              })}
            </div>)
          })}
        </table>

      )}

      <div className="PacingChallenge__Maps">
        <PacingChallengeMapButton strengths={strengths} map={maps['hills1']} name="Hilly 1" onSelect={(name, strength) => onSelectMap(name, strength)} />
        <PacingChallengeMapButton strengths={strengths} map={maps['hills2']} name="Hilly 2" onSelect={(name, strength) => onSelectMap(name, strength)}  />
        <PacingChallengeMapButton strengths={strengths} map={maps['flat']} name="Flat" onSelect={(name, strength) => onSelectMap(name, strength)}  />
        <PacingChallengeMapButton strengths={strengths} map={maps['long']} name="Long" onSelect={(name, strength) => onSelectMap(name, strength)}  />
      </div>
    </div>)
}

export default PacingChallengeSetup;