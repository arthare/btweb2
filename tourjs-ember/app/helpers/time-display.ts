import { helper } from '@ember/component/helper';
import { formatSecondsHms } from 'bt-web2/tourjs-shared/Utils';

export function timeDisplay(params/*, hash*/) {
  if(params.length < 1) {
    return;
  }
  const asNumber = parseFloat(params[0]);
  if(isFinite(asNumber)) {
    return formatSecondsHms(asNumber);
  }
  return params[0];
}

export default helper(timeDisplay);
