import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserProfilePicker from './Components/UserProfilePicker';
import { AppAuthContextType } from './ContextAuth';
import { AppPlayerContextType } from './ContextPlayer';
import { AppAuthContextInstance, AppPlayerContextInstance } from './index-contextLoaders';
import { useAuth0 } from '@auth0/auth0-react';
import { RaceState, UserProvider } from './tourjs-shared/RaceState';
import { PacingChallengeMapName, PacingChallengeShortMap, PacingChallengeUserProvider, PowerTimer, PowerTimerAverage, getPacingChallengeMap } from './PacingChallengeShared';
import { DEFAULT_CDA, DEFAULT_CRR, DEFAULT_GRAVITY, DEFAULT_HANDICAP_POWER, DEFAULT_RHO, DEFAULT_RIDER_MASS, HandicapChangeReason, User, UserInterface } from './tourjs-shared/User';
import { RideMap } from './tourjs-shared/RideMap';
import InRaceView from './Components/InRaceView';
import { formatSecondsHms } from './tourjs-shared/Utils';
import { PacingChallengeResultSubmission } from './tourjs-shared/communication';
import { apiPost } from './tourjs-client-shared/api-get';
import './PagePacingChallengeRace.scss';

function _getHandicapSecondsAllowed(localUser:UserInterface, pctZeroToOne:number, map:RideMap) {
  // let's figure out how many handicap-seconds are allowed!
  const handicappedPower = DEFAULT_HANDICAP_POWER * pctZeroToOne;
  const joulesForCrr = DEFAULT_CRR * DEFAULT_RIDER_MASS * DEFAULT_GRAVITY * map.getLength();
  
  const expectedSteadyStateSpeedMetersPerSec = Math.pow(handicappedPower / (DEFAULT_CDA*DEFAULT_RHO*0.5), 0.333333333);
  const joulesForAero = (0.5 * DEFAULT_CDA * DEFAULT_RHO * Math.pow(expectedSteadyStateSpeedMetersPerSec, 2)) * map.getLength();

  const joulesForClimb = (map.getElevationAtDistance(map.getLength()) - map.getElevationAtDistance(0)) * DEFAULT_GRAVITY * DEFAULT_RIDER_MASS;

  const expectedCompletionTimeSeconds = (joulesForClimb + joulesForCrr + joulesForAero) / handicappedPower;
  const expectedPower = localUser.getHandicap() * pctZeroToOne;
  const expectedJoulesAllowed = expectedPower * expectedCompletionTimeSeconds;
  const handicapSecondsAllowed = expectedJoulesAllowed / localUser.getHandicap();

  return handicapSecondsAllowed;
}

function PacingChallengeInRaceStats(props:{hsUsed:number,hsAllowed:number, map:RideMap, localUser:UserInterface}) {

  const km = props.localUser.getDistance() / 1000;
  const kmLeft = (props.map.getLength() - props.localUser.getDistance()) / 1000;
  const hsUsedPerKm = (props.hsUsed / km);
  const hsLeft = Math.max(0, props.hsAllowed - props.hsUsed);

  const hsPerKmLeft = hsLeft / kmLeft;

  if(kmLeft < 0.01) {
    // basically done!
    return <></>;
  }

  return (
    <div className="PacingChallengeInRaceStats__Container">
      <table>
        <tr>
          <th colSpan={2}>Pacing Challenge Data</th>
        </tr>
        <tr>
          <td>⛽ Used</td>
          <td>{props.hsUsed.toFixed(1)}</td>
        </tr>
        <tr>
          <td>⛽ Left</td>
          <td>{hsLeft.toFixed(1)}</td>
        </tr>
        <tr>
          <td>⛽ Used/km</td>
          <td>{hsUsedPerKm.toFixed(2)}/km</td>
        </tr>
        <tr>
          <td>⛽ Left/km</td>
          <td>{hsPerKmLeft.toFixed(2)}/km</td>
        </tr>
      </table>
    </div>
  )
}

function PacingChallengeRace(props:any) {
  const navigate = useNavigate();

  const authContext = useContext<AppAuthContextType|null>(AppAuthContextInstance);
  const playerContext = useContext<AppPlayerContextType|null>(AppPlayerContextInstance);
  const auth0 = useAuth0();
  const [authState, setAuthState] = authContext.gate(auth0, useState, useEffect, navigate);
  

  // race stuff
  const [raceState, setRaceState] = useState<RaceState|null>(null);
  const [ticks, setTicks] = useState<number>(-1);
  const [hsUsed, setHsUsed] = useState<number>(0);
  const [hsAllowed, setHsAllowed] = useState<number>(0);

  const {mapName, strStrength} = useParams();

  const strengthZeroToOne = parseFloat(strStrength);
  if(strengthZeroToOne < 0 || strengthZeroToOne > 1.25) {
    navigate('/');
  }

  const tickPacingChallenge = (map:PacingChallengeShortMap, userProvider:UserProvider, raceState:RaceState, handisecsAllowed:number, ticks:number, powerTimer:PowerTimer) => {
    const tmNow = new Date().getTime();
    setTicks(ticks);
    const localUser = raceState.getLocalUser();
    if(!localUser) {
      console.log("no local user in pacing race");
      debugger;
      return;
    }
    powerTimer.notifyPower(tmNow, localUser.getLastPower());
    const avg = powerTimer.getAverage(tmNow);

    const hsUsed = avg.joules / localUser.getHandicap();
    console.log(ticks, "hsUsed = ", hsUsed);
    setHsUsed(hsUsed);

    if(localUser.getDistance() >= map.getLength()) {
      // you're done!
      const penaltyEnergy = Math.max(0, hsUsed - handisecsAllowed);
      if(penaltyEnergy > 0) {
        alert(`🟡🟡You made it, but with penalties 🟡🟡\nTime ${formatSecondsHms(avg.totalTimeSeconds)}\nEnergy: ${hsUsed.toFixed(1)}\nEnergy Over Limit: ${(penaltyEnergy).toFixed(1)}`)
      } else {
        alert(`✅✅You made it unpenalized!✅✅\nTime ${formatSecondsHms(avg.totalTimeSeconds)}\nEnergy: ${hsUsed.toFixed(1)}\nEnergy Left over: ${(handisecsAllowed - hsUsed).toFixed(1)}`);
      }
      raceState.stop();
      
      const hsLeft = handisecsAllowed - hsUsed;


      const submission:PacingChallengeResultSubmission = {
        mapName: mapName,
        "name": localUser.getName(),
        "time": avg.totalTimeSeconds + 5*penaltyEnergy,
        "hsLeft": hsLeft,
        "pct": (strengthZeroToOne*100),
        tmWhen: new Date().getTime(),
      }

      return apiPost('pacing-challenge-result', submission).finally(() => {
        raceState.stop();
        navigate('/');
      });
    }

    setTimeout(() => {
      tickPacingChallenge(map, userProvider, raceState, handisecsAllowed, ticks + 1, powerTimer);
    }, 200);
  }

  useEffect(() => {
    if(playerContext && playerContext.localUser && mapName && strengthZeroToOne && !raceState) {
      // ok, we've got a user, map, and strength.  we're ready to go.
      const map = getPacingChallengeMap(PacingChallengeMapName[mapName]);
      if(!map) throw new Error("Map not recognized");

      const userProvider = new PacingChallengeUserProvider(playerContext.localUser, strengthZeroToOne, map.getLength());
      const raceState = new RaceState(map, userProvider, `Pacing-Challenge-${strengthZeroToOne.toFixed(0)}%`);
      const handisecsAllowed = _getHandicapSecondsAllowed(playerContext.localUser, strengthZeroToOne, map);
      setHsAllowed(handisecsAllowed);
      const powerTimer = new PowerTimer(new Date().getTime());

      playerContext.localUser.setDistance(0);
      playerContext.localUser.setSpeed(0);

      setRaceState(raceState);

      tickPacingChallenge(map, userProvider, raceState, handisecsAllowed, 0, powerTimer);
    }
  }, [playerContext, playerContext.localUser, mapName, strengthZeroToOne])

  return <>
    {!playerContext || !authContext && (
        <div>Loading...</div>
    )}
    {playerContext && authContext && (
      <>
        {playerContext && !playerContext.localUser && (
          <UserProfilePicker playerContext={playerContext} authContext={authContext} auth0={auth0} authState={authState} fnOnChangeUser={()=>authContext.refreshAliases(auth0, setAuthState)} />
        )}
        {playerContext && playerContext.localUser && raceState && (<>
          <InRaceView raceState={raceState}>
            <PacingChallengeInRaceStats hsUsed={hsUsed} hsAllowed={hsAllowed} map={raceState.getMap()} localUser={raceState.getLocalUser()}/>
          </InRaceView>
        </>)}
      </>
    )}
  </>
}

export default PacingChallengeRace;