import { number as verifyNum } from '../../../verify';
import { BezierEasing } from '../../bezier-easing';

export const calcBetweenTime = 0.125; // 1/32

/**
 * 将一个事件的拍数数组转换为拍数小数
 * 
 * @param {Object} event 欲转换的事件
 * @return {Object} 转换出的事件
 */
function calculateEventBeat(event: any) {
    event.startTime = parseFloat((event.startTime[0] + (event.startTime[1] / event.startTime[2])).toFixed(3));
    event.endTime = parseFloat((event.endTime[0] + (event.endTime[1] / event.endTime[2])).toFixed(3));
    return event;
}

/**
 * 将一组事件的拍数数组转换为拍数小数
 * 
 * @param {Array} events 欲转换的事件组
 * @return {Array} 转换出的事件组
 */
function calculateEventsBeat(events: any[]) {
    events.forEach((event: any) => {
        event = calculateEventBeat(event);
    });
    return events;
}

function clamp(val: number, min: number, max: number) {
    return val > max ? max : val < min ? min : val;
}

/**
 * 计算在某时间下某一事件的返回值
 * 
 * @param {Object} event 欲用于计算值的事件
 * @param {Array} Easings 该事件配套的缓动函数组
 * @param {Number} currentTime 欲计算的时间
 * @param {Number} [easingsOffset] 缓动函数偏移，默认为 `1`
 * @return {Number} 返回在指定时间下当前事件的值
 */
function valueCalculator(event: any, Easings: any, currentTime: any, easingsOffset = 1) {
    if (event.start == event.end) return event.start;
    if (event.startTime > currentTime) throw new Error('currentTime must bigger than startTime');
    if (event.endTime < currentTime) throw new Error('currentTime must smaller than endTime');

    let timePercentEnd = (currentTime - event.startTime) / (event.endTime - event.startTime);
    let timePercentStart = 1 - timePercentEnd;

    if (event.bezier === 1) {
        let bezier = BezierEasing(clamp(event.bezierPoints[0], 0, 1), event.bezierPoints[1], clamp(event.bezierPoints[2], 0, 1), event.bezierPoints[3]);
        return event.start * bezier(timePercentStart) + event.end * bezier(timePercentEnd);
    }
    else {
        let easeFunction = Easings[event.easingType - easingsOffset] ? Easings[event.easingType - easingsOffset] : Easings[0];
        let easePercent = easeFunction(verifyNum(event.easingLeft, 0, 0, 1) * timePercentStart + verifyNum(event.easingRight, 1, 0, 1) * timePercentEnd);
        let easePercentStart = easeFunction(verifyNum(event.easingLeft, 0, 0, 1));
        let easePercentEnd = easeFunction(verifyNum(event.easingRight, 1, 0, 1));

        easePercent = (easePercent - easePercentStart) / (easePercentEnd - easePercentStart);

        return event.start * (1 - easePercent) + event.end * easePercent;
    }

}

/**
 * 计算一组事件/Note的绝对时间
 * 
 * @param {Array} _bpmList 一组已计算好绝对时间的 BPM 列表，传入前请先倒序排序
 * @param {Array} _events 欲计算绝对时间的事件/Note数组
 * @return {Array} 已经计算好时间的事件/Note数组
 */
function calculateRealTime(_bpmList: any, _events: any) {
    let bpmList = _bpmList.slice();
    let events = _events.slice();

    events.forEach((event: any) => {
        for (let bpmIndex = 0, bpmLength = bpmList.length; bpmIndex < bpmLength; bpmIndex++) {
            let bpm = bpmList[bpmIndex];

            if (bpm.startBeat > event.endTime) continue;
            if (event.time) event.time = bpm.startTime + ((event.time - bpm.startBeat) * bpm.beatTime);
            event.endTime = bpm.startTime + ((event.endTime - bpm.startBeat) * bpm.beatTime);

            for (let nextBpmIndex = bpmIndex; nextBpmIndex < bpmLength; nextBpmIndex++) {
                let nextBpm = bpmList[nextBpmIndex];

                if (nextBpm.startBeat > event.startTime) continue;
                event.startTime = nextBpm.startTime + ((event.startTime - nextBpm.startBeat) * nextBpm.beatTime);
                break;
            }

            break;
        }
    });

    return events.slice();
}

/**
 * 拆分事件缓动
 * 
 * @param {Object} event 欲拆分缓动的事件
 * @param {Array} Easings 该事件配套的缓动函数组
 * @param {Number} [easingsOffset] 缓动函数偏移，默认为 `1`
 * @param {Boolean} [forceLinear] 强制拆分 linear 缓动
 * @return {Array} 已拆分完缓动的事件数组
 */
function calculateEventEase(event: any, Easings: any, easingsOffset = 1, forceLinear = false) {
    let result = [];
    let timeBetween = event.endTime - event.startTime;

    if (!event) debugger;

    if (
        (
            event.bezier == 1 ||
            (
                event.easingType && Easings[event.easingType - easingsOffset] && (event.easingType - easingsOffset !== 0 || forceLinear) &&
                event.easingType <= Easings.length
            )
        ) &&
        event.start != event.end &&
        event.startTime != event.endTime
    ) {
        if (typeof event.start == "number" && typeof event.end == "number") {
            for (let timeIndex = 0, timeCount = Math.ceil(timeBetween / calcBetweenTime); timeIndex < timeCount; timeIndex++) {
                let currentTime = event.startTime + (timeIndex * calcBetweenTime);
                let nextTime = event.startTime + ((timeIndex + 1) * calcBetweenTime) <= event.endTime ? event.startTime + ((timeIndex + 1) * calcBetweenTime) : event.endTime;

                result.push({
                    startTime: currentTime,
                    endTime: nextTime,
                    start: valueCalculator(event, Easings, currentTime, easingsOffset),
                    end: valueCalculator(event, Easings, nextTime, easingsOffset)
                });
            }
        } else {
            result.push({
                startTime: event.startTime,
                endTime: event.endTime,
                start: event.start,
                end: event.end
            });
        }

    }
    else {
        result.push({
            startTime: event.startTime,
            endTime: event.endTime,
            start: event.start,
            end: event.end
        });
    }

    return result;
}

/**
 * 计算一组 BPM 的 HoldBetween 值
 * 
 * @param {Array} _bpmList 欲用于计算的 BPM 数组
 * @return {Array} 计算完毕的 BPM 数组
 */
function calculateHoldBetween(_bpmList: any) {
    let bpmList = _bpmList.slice();
    let result: any = [];

    bpmList.sort((a: any, b: any) => a.startTime - b.startTime);
    bpmList.forEach((bpm: any) => {
        if (result.length <= 0) {
            result.push({
                startTime: bpm.startTime,
                endTime: bpm.startTime,
                bpm: bpm.bpm,
                holdBetween: ((-1.2891 * bpm.bpm) + 396.71) / 1000
            });
        }
        else {
            result[result.length - 1].endTime = bpm.startTime;

            if (result[result.length - 1].bpm != bpm.bpm) {
                result.push({
                    startTime: bpm.startTime,
                    endTime: bpm.startTime,
                    bpm: bpm.bpm,
                    holdBetween: ((-1.2891 * bpm.bpm) + 396.71) / 1000
                });
            }
        }
    });

    result.sort((a: any, b: any) => a.startTime - b.startTime);

    if (result.length > 0) {
        result[0].startTime = 1 - 1000;
        result[result.length - 1].endTime = 1e4;
    }
    else {
        result.push({
            startTime: 1 - 1000,
            endTime: 1e4,
            bpm: 120,
            holdBetween: 0.242018
        });
    }

    return result;
}

/**
 * 合并一组事件中值相同的事件
 * 
 * @param {Array} _events 欲合并相同值的事件组
 * @return {Array} 已合并相同值的事件组
 */
function arrangeSameValueEvent(_events: any[]) {
    if (!_events || _events.length <= 0) return [];

    let events = _events.slice();
    let result = [events.shift()];

    for (const event of events) {
        if (
            result[result.length - 1].start == result[result.length - 1].end &&
            event.start == event.end &&
            result[result.length - 1].start == event.start
        ) {
            result[result.length - 1].endTime = event.endTime;
        }
        else {
            result.push(event);
        }
    }

    return result.slice();
}

/**
 * 合并一组速度事件中值相同的事件
 * 
 * @param {Array} events 欲合并相同值的速度事件组
 * @return {Array} 已合并相同值的速度事件组
 */
function arrangeSameSingleValueEvent(events: any[]) {
    if (!events || events.length <= 0) return [];

    let newEvents = [];
    for (let i of events) {
        let lastEvent = newEvents[newEvents.length - 1];

        if (!lastEvent || lastEvent.value != i.value) {
            newEvents.push(i);
        } else {
            lastEvent.endTime = i.endTime;
        }
    }

    return newEvents.slice();
}

export {
    calculateEventBeat,
    calculateEventsBeat,

    valueCalculator,
    calculateRealTime,

    calculateEventEase,
    calculateHoldBetween,

    arrangeSameValueEvent,
    arrangeSameSingleValueEvent
}
