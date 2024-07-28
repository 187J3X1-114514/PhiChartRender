import { number as verifyNum } from '../../../verify';
import utils from '../utils';
import { Color } from 'pixi.js';
import { RePhiEditEasing as Easing } from '../../easing'
const calcBetweenTime = 0.125;
function calculateTextEventEase(event: any) {
    const _calcBetweenTime = calcBetweenTime / 2;
    const NumberReg = /(.+)%P%/;
    const isNumberRequired = NumberReg.test(event.start) && NumberReg.test(event.end);
    const timeBetween = event.endTime - event.startTime;
    let result: any = [];

    if (!event) return [];

    if (isNumberRequired) {
        const startNum = Number(event.start.match(NumberReg)[1]) || 0;
        const endNum = Number(event.end.match(NumberReg)[1]) || 0;
        const NotFloatNum = Math.round(startNum) === startNum && Math.round(endNum) === endNum;

        for (let timeIndex = 0, timeCount = Math.ceil(timeBetween / _calcBetweenTime); timeIndex < timeCount; timeIndex++) {
            let currentTime = event.startTime + (timeIndex * _calcBetweenTime);
            let nextTime = (event.startTime + ((timeIndex + 1) * _calcBetweenTime)) <= event.endTime ? event.startTime + ((timeIndex + 1) * _calcBetweenTime) : event.endTime;
            let nextTimePercent = (nextTime - event.startTime) / timeBetween;
            let currentNum = startNum * (1 - nextTimePercent) + endNum * nextTimePercent;

            if (NotFloatNum) {
                currentNum = Math.round(currentNum);
            }

            if (result[result.length - 1] && result[result.length - 1].value == currentNum) {
                result[result.length - 1].endTime = nextTime;
                continue;
            }

            result.push({
                startTime: currentTime,
                endTime: nextTime,
                value: currentNum + '',
            });
        }
    }
    else if (event.start != event.end) {
        const startText = event.start.length <= event.end.length ? event.start : event.end;
        const endText = event.start.length <= event.end.length ? event.end : event.start;
        const isProgressive = startText == '' || endText.indexOf(startText) === 0;

        if (isProgressive) {
            let currentText = [];
            let lastTextIndex = -1;

            for (let timeIndex = 0, timeCount = Math.ceil(timeBetween / _calcBetweenTime); timeIndex < timeCount; timeIndex++) {
                let currentTime = event.startTime + (timeIndex * _calcBetweenTime);
                let nextTime = (event.startTime + ((timeIndex + 1) * _calcBetweenTime)) <= event.endTime ? event.startTime + ((timeIndex + 1) * _calcBetweenTime) : event.endTime;
                let currentTextIndex = Math.floor(_valueCalculator(event, nextTime, startText.length, endText.length - 1));

                if (lastTextIndex + 1 < currentTextIndex) {
                    for (let extraTextIndex = lastTextIndex + 1; extraTextIndex < currentTextIndex; extraTextIndex++) {
                        currentText.push(endText[extraTextIndex]);
                    }
                }
                else if (lastTextIndex + 1 > currentTextIndex) {
                    currentText.length = currentTextIndex;
                }

                if (endText[currentTextIndex]) currentText.push(endText[currentTextIndex]);
                if (result[result.length - 1] && result[result.length - 1].value == currentText.join('')) {
                    result[result.length - 1].endTime = nextTime;
                    continue;
                }

                if (nextTime == event.endTime) {
                    result.push({
                        startTime: currentTime,
                        endTime: nextTime,
                        value: event.end
                    });

                    break;
                }

                result.push({
                    startTime: currentTime,
                    endTime: nextTime,
                    value: currentText.join(''),
                });

                lastTextIndex = currentTextIndex;
            }
        }
        else {
            result.push({
                startTime: event.startTime,
                endTime: event.endTime,
                value: event.start
            });
            result.push({
                startTime: event.endTime,
                endTime: NaN,
                value: event.end
            });
        }
    }
    else {
        result.push({
            startTime: event.startTime,
            endTime: event.endTime,
            value: event.start
        });
    }

    return result;
}

function calculateColorEventEase(event: any) {
    let timeBetween = event.endTime - event.startTime;
    let result = [];

    if (!event) return [];

    if (
        event.start[0] != event.end[0] ||
        event.start[1] != event.end[1] ||
        event.start[2] != event.end[2]
    ) {
        for (let timeIndex = 0, timeCount = Math.ceil(timeBetween / calcBetweenTime); timeIndex < timeCount; timeIndex++) {
            let currentTime = event.startTime + (timeIndex * calcBetweenTime);
            let nextTime = (event.startTime + ((timeIndex + 1) * calcBetweenTime)) <= event.endTime ? event.startTime + ((timeIndex + 1) * calcBetweenTime) : event.endTime;

            result.push({
                startTime: currentTime,
                endTime: nextTime,
                value: (new Color([
                    Math.round(_valueCalculator(event, nextTime, event.start[0], event.end[0])) / 255,
                    Math.round(_valueCalculator(event, nextTime, event.start[1], event.end[1])) / 255,
                    Math.round(_valueCalculator(event, nextTime, event.start[2], event.end[2])) / 255
                ]).toArray())
            });
        }
    }
    else {
        result.push({
            startTime: event.startTime,
            endTime: event.endTime,
            value: (new Color([
                event.start[0] / 255,
                event.start[1] / 255,
                event.start[2] / 255
            ]).toArray())
        });
    }

    return result;
}

function calculateNoteControls(_noteControls: any, valueName = 'alpha', defaultValue = 1) {
    if (!_noteControls || !(_noteControls instanceof Array) || _noteControls.length <= 0) return [];
    if (
        _noteControls.length == 2 &&
        (_noteControls[0].x == 0 && _noteControls[1].x >= 10000) &&
        (_noteControls[0][valueName] == defaultValue && _noteControls[1][valueName] == defaultValue)
    ) { return [] };

    let noteControls = _noteControls.slice().sort((a, b) => b.x - a.x);
    let result: any[] = [];

    for (let controlIndex = 0; controlIndex < noteControls.length; controlIndex++) {
        const control = noteControls[controlIndex];
        const nextControl = noteControls[controlIndex + 1];

        result = [...result, ...separateNoteControl(control, nextControl, valueName)];
    }

    result = arrangeSameValueControls(result);
    if (result[0].y < 10000) result.unshift({ _y: 9999999 / 900, y: 9999999, value: result[0].value });

    return result;

    function arrangeSameValueControls(controls: any) {
        let result = [];

        for (const control of controls) {
            if (result.length > 0 && result[result.length - 1].value == control.value) {
                continue;
            }

            result.push(control);
        }

        return result.slice();
    }

    function separateNoteControl(control: any, nextControl: any = null, valueName = 'alpha') {
        let result = [];
        let xBetween = control.x - (nextControl ? nextControl.x : 0);
        let valueBetween = control[valueName] - (nextControl ? nextControl[valueName] : control[valueName]);
        let easingFunc = Easing[control.easing - 1];
        let currentX = control.x;

        if (control[valueName] == (nextControl ? nextControl[valueName] : control[valueName])) {
            return [{ _y: control.x / 900, y: control.x, value: control[valueName] }];
        }

        while (currentX > (nextControl ? nextControl.x : 0)) {
            let currentPercent = (control.x - currentX) / xBetween;
            let currentValue = parseFloat((control[valueName] - valueBetween * easingFunc(currentPercent)).toFixed(2));

            if (result.length > 0 && parseFloat((result[result.length - 1].value).toFixed(2)) == currentValue) {
                result[result.length - 1]._y = currentX / 900;
                result[result.length - 1].y = currentX;
            }
            else {
                result.push({
                    _y: currentX / 900,
                    y: currentX,
                    value: currentValue
                });
            }

            currentX -= 2;
        }

        if (result[result.length - 1].value != (nextControl ? nextControl[valueName] : control[valueName])) {
            result.push({
                _y: (nextControl ? nextControl.x : 0) / 900,
                y: (nextControl ? nextControl.x : 0),
                value: (nextControl ? nextControl[valueName] : control[valueName])
            });
        }

        return result;
    }
}

function separateSpeedEvent(event: any) {
    let result = [];
    let timeBetween = event.endTime - event.startTime;

    if (event.start != event.end) {
        for (let timeIndex = 0, timeCount = Math.ceil(timeBetween / calcBetweenTime); timeIndex < timeCount; timeIndex++) {
            let currentTime = event.startTime + (timeIndex * calcBetweenTime);
            let nextTime = (event.startTime + ((timeIndex + 1) * calcBetweenTime)) <= event.endTime ? event.startTime + ((timeIndex + 1) * calcBetweenTime) : event.endTime;

            result.push({
                startTime: currentTime,
                endTime: nextTime,
                value: utils.valueCalculator(event, Easing, nextTime)
            });
        }
    }
    else {
        result.push({
            startTime: event.startTime,
            endTime: event.endTime,
            value: event.start
        });
    }

    return result;
}

function _valueCalculator(event: any, currentTime: any, startValue = 0, endValue = 1) {
    if (startValue == endValue) return startValue;
    if (event.startTime > currentTime) throw new Error('currentTime must bigger than startTime');
    if (event.endTime < currentTime) throw new Error('currentTime must smaller than endTime');

    let timePercentStart = (currentTime - event.startTime) / (event.endTime - event.startTime);
    let timePercentEnd = 1 - timePercentStart;
    let easeFunction = Easing[event.easingType - 1] ? Easing[event.easingType - 1] : Easing[0];
    let easePercent = easeFunction(verifyNum(event.easingLeft, 0, 0, 1) * timePercentEnd + verifyNum(event.easingRight, 1, 0, 1) * timePercentStart);
    let easePercentStart = easeFunction(verifyNum(event.easingLeft, 0, 0, 1));
    let easePercentEnd = easeFunction(verifyNum(event.easingRight, 1, 0, 1));

    easePercent = (easePercent - easePercentStart) / (easePercentEnd - easePercentStart);

    return startValue * (1 - easePercent) + endValue * easePercent;
}
export {
    calculateColorEventEase, calculateNoteControls, calculateTextEventEase, _valueCalculator, separateSpeedEvent
}