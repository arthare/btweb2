// here's what we gotta do:
// 1) start HTTP server that serves up our last wattage
// 2) hook up to waterrower (find COM port, etc)

import { PluginToBrowserUpdate, PluginDescriptor, PluginType } from "../../app/shared/PluginCommunication";
import { sendPowerToPluginHost, signUpWithPluginHost } from "../pluginUtils";

// 3) probably do some dumping to text
var {WaterRower} = require('waterrower');


var lastData = {
  'total_kcal': 0,
};

var stateData = {
  kcalBase: 0,
}

var kcalHistory = [
  {
    time: new Date().getTime(),
    value: 0,
  }
];



export default function startWaterRower(serverUrl:string) {
  let waterrower;
  waterrower = new WaterRower({
    datapoints:['distance','total_kcal', 'kcal_watts'],
  });
  
  if(process.argv[2] === 'test') {
    waterrower.playRecording('simulationdata');
  } else {
    // it'll just initialize otherwise
  }

  waterrower.on('initialized', () => {
    waterrower.reset();
    //waterrower.startRecording();
    const signUp = new PluginDescriptor("WaterRower", PluginType.USBWaterRower, false);
    return signUpWithPluginHost(serverUrl, signUp).then(() => {
      
      let lastPower = -1;
      function reportPower() {
        
        const tmNow = new Date().getTime();

        let lastPull = kcalHistory[kcalHistory.length-1];
        
        // let's figure out our cadence
        let sumDiffMs = 0;
        let sumCount = 0;
        let sumPower = 0;
        for(var x = 0;x < 3; x++) {
          const ix = kcalHistory.length - x - 1;
          const ixBefore = ix - 1;
          if(ixBefore >= 0) {
            const diffMs = kcalHistory[ix].time - kcalHistory[ixBefore].time;
            sumDiffMs += diffMs;

            const joules = (kcalHistory[ix].value - kcalHistory[ixBefore].value);
            const watts = 1000 * joules / diffMs;
            sumPower += watts*diffMs;
            sumCount++;
          }
        }

        let ret = {
          time: tmNow,
          power: 1,
        }
        if(sumCount > 0) {
          const cadencePeriodMs = sumDiffMs / sumCount;
          const tmSinceLastPull = tmNow - lastPull.time;
          if(tmSinceLastPull <= 1.5*cadencePeriodMs) {

            ret = {
              time: lastPull.time,
              power: sumPower / sumDiffMs,
            }

          } else {
            ret = {
              time: lastPull.time,
              power: 0,
            }
          }
        }

        if(ret.power != lastPower) {
          console.log("waterrower sending ", ret.power);
          sendPowerToPluginHost(serverUrl, new PluginToBrowserUpdate(signUp.pluginId, new Date().getTime(), ret.power));
          lastPower = ret.power;
        }
      }

      waterrower.on('data', d => {
        // access the value that just changed using d
        // or access any of the other datapoints using waterrower.readDataPoint('<datapointName>');
        
        switch(d.name) {
          case 'total_kcal':
            const lastKcal = lastData[d.name];
            const thisKcal = d.value;
            if(thisKcal !== lastKcal) {
              // they finished a pull!

              if(thisKcal < lastKcal) {
                // we looped around, so increment the "base"
                stateData.kcalBase += 65536;
              }

              // and now, remember this state for our power-calculation purposes
              const history = {
                time: new Date().getTime(),
                value: d.value + stateData.kcalBase,
              };
              kcalHistory.push(history);


              console.log(history.time % 10000 + " kcal " + history.value);
              lastData[d.name] = thisKcal;
            }
            break;
          default:
            break;
        }

        reportPower();
      });
    })
    
  })

}