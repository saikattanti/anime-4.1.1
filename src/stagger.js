/// <reference path='./types.js' />

import {
  emptyString,
  unitsExecRgx,
} from './consts.js';

import {
  isArr,
  isUnd,
  isNum,
  parseNumber,
  round,
  abs,
  floor,
  sqrt,
  max,
  isStr,
  isFnc,
  shuffle,
} from './helpers.js';

import {
  parseEasings,
} from './eases.js';

import {
  parseTimelinePosition,
} from './timeline.js';

import {
  getOriginalAnimatableValue,
} from './values.js';

import {
  registerTargets,
} from './targets.js';

/**
 * @param  {Number|String|[Number|String,Number|String]} val
 * @param  {StaggerParams} params
 * @return {StaggerFunction}
 */
export const stagger = (val, params = {}) => {
  let values = [];
  let maxValue = 0;
  const from = params.from;
  const reversed = params.reversed;
  const ease = params.ease;
  const hasEasing = !isUnd(ease);
  const hasSpring = hasEasing && !isUnd(/** @type {Spring} */(ease).ease);
  const staggerEase = hasSpring ? /** @type {Spring} */(ease).ease : hasEasing ? parseEasings(ease) : null;
  const grid = params.grid;
  const axis = params.axis;
  const customTotal = params.total;
  const fromFirst = isUnd(from) || from === 0 || from === 'first';
  const fromCenter = from === 'center';
  const fromLast = from === 'last';
  const fromRandom = from === 'random';
  const isRange = isArr(val);
  const useProp = params.use;
  const val1 = isRange ? parseNumber(val[0]) : parseNumber(val);
  const val2 = isRange ? parseNumber(val[1]) : 0;
  const unitMatch = unitsExecRgx.exec((isRange ? val[1] : val) + emptyString);
  const start = params.start || 0 + (isRange ? val1 : 0);
  let fromIndex = fromFirst ? 0 : isNum(from) ? from : 0;
  return (target, i, t, tl) => {
    const [ registeredTarget ] = registerTargets(target);
    const total = isUnd(customTotal) ? t : customTotal;
    const customIndex = !isUnd(useProp) ? isFnc(useProp) ? useProp(registeredTarget, i, total) : getOriginalAnimatableValue(registeredTarget, useProp) : false;
    const staggerIndex = isNum(customIndex) || isStr(customIndex) && isNum(+customIndex) ? +customIndex : i;
    if (fromCenter) fromIndex = (total - 1) / 2;
    if (fromLast) fromIndex = total - 1;
    if (!values.length) {
      for (let index = 0; index < total; index++) {
        if (!grid) {
          values.push(abs(fromIndex - index));
        } else {
          const fromX = !fromCenter ? fromIndex % grid[0] : (grid[0] - 1) / 2;
          const fromY = !fromCenter ? floor(fromIndex / grid[0]) : (grid[1] - 1) / 2;
          const toX = index % grid[0];
          const toY = floor(index / grid[0]);
          const distanceX = fromX - toX;
          const distanceY = fromY - toY;
          let value = sqrt(distanceX * distanceX + distanceY * distanceY);
          if (axis === 'x') value = -distanceX;
          if (axis === 'y') value = -distanceY;
          values.push(value);
        }
        maxValue = max(...values);
      }
      if (staggerEase) values = values.map(val => staggerEase(val / maxValue) * maxValue);
      if (reversed) values = values.map(val => axis ? (val < 0) ? val * -1 : -val : abs(maxValue - val));
      if (fromRandom) values = shuffle(values);
    }
    const spacing = isRange ? (val2 - val1) / maxValue : val1;
    const offset = tl ? parseTimelinePosition(tl, isUnd(params.start) ? tl.iterationDuration : start) : /** @type {Number} */(start);
    /** @type {String|Number} */
    let output = offset + ((spacing * round(values[staggerIndex], 2)) || 0);
    if (params.modifier) output = params.modifier(output);
    if (unitMatch) output = `${output}${unitMatch[2]}`;
    return output;
  }
}
