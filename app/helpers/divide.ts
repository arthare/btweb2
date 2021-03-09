import { helper } from '@ember/component/helper';

export function divide(params:any[]/*, hash*/) {
  if(params.length < 2) {
    return '';
  }
  const d1 = parseFloat('' + params[0]);
  const d2 = parseFloat('' + params[1]);
  console.log("dividing ", params[0], " by ", params[1]);
  const ret = (d1/d2);
  if(params[2]) {
    return ret.toFixed(params[2]);
  } else {
    return (d1 / d2);
  }
}

export default helper(divide);
