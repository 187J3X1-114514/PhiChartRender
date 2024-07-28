import Chart from '../index';
import Judgeline from '../judgeline';
import EventLayer from '../eventlayer';
import Note from '../note';
import utils from './utils';
import { PhiEditEasing as Easing } from '../easing'
import { PhiEdit as utils2 } from './otherUtils'
import { chart_log } from './index.js';
export default function PhiEditChartConverter(_chart: any) {
    let rawChart = _chart.split("\n");
    let chart = new Chart();
    let ___ = performance.now()
    chart_log.info("加载PEC格式的铺面中")

    let chartSimple = {
        bpm: new Array<any>(),
        judgelines: new Array<any>(),
        _judgelines: new Array<any>(),
        notes: new Array<any>(),
        notesPerLine: new Array<any>(),
        sameTimeNoteCount: {},

        pushNote: function (note: any) {
            (this.sameTimeNoteCount as any)[utils2.floorNum(note.startTime)] = !(this.sameTimeNoteCount as any)[utils2.floorNum(note.startTime)] ? 1 : (this.sameTimeNoteCount as any)[utils2.floorNum(note.startTime)] + 1;
            if (!(this.notesPerLine as any)[note.lineId]) (this.notesPerLine as any)[note.lineId] = [];
            (this.notesPerLine as any)[note.lineId].push(note);
            this.notes.push(note);
        },

        pushEventToLine: function (lineId: any, eventName: any, event: any) {
            if (isNaN(lineId) || lineId < 0) {
                console.warn('Invalid line id: ' + lineId + ', ignored');
                return;
            }
            if (!(this._judgelines as any)[lineId]) (this._judgelines as any)[lineId] = new Judgeline({ id: lineId });
            if ((this._judgelines as any)[lineId].eventLayers.length < 1) (this._judgelines as any)[lineId].eventLayers.push(new EventLayer());
            if (!(this._judgelines as any)[lineId].eventLayers[0][eventName]) throw new Error('No such event type: ' + eventName);

            let events = (this._judgelines as any)[lineId].eventLayers[0][eventName];
            let lastEvent = events[events.length - 1];

            if (
                lastEvent &&
                lastEvent.startTime == event.startTime &&
                (
                    (
                        isNaN(lastEvent.endTime) &&
                        isNaN(event.endTime)
                    ) ||
                    (
                        !isNaN(lastEvent.endTime) &&
                        !isNaN(event.endTime) &&
                        lastEvent.endTime == event.endTime
                    )
                )
            ) {
                lastEvent.endTime = event.endTime;

                if (isNaN(parseFloat(event.value))) {
                    lastEvent.start = event.start;
                    lastEvent.end = event.end;
                }
                else {
                    lastEvent.value = event.value;
                }
            }
            else {
                events.push(event);
            }
        }
    };

    /*
    chartSimple.pushNote = chartSimple.pushNote.bind(chartSimple);
    chartSimple.pushEventToLine = chartSimple.pushEventToLine.bind(chartSimple);
    */
    if (!isNaN(rawChart[0])) chart.offset = parseFloat((parseFloat(rawChart.shift()) / 1000).toFixed(4)) - 0.175;
    else return null;

    rawChart.forEach((_command: any, commandIndex: any) => {
        if (!_command) return;
        if (_command == '') return;
        if (_command.replace(/\s/g, '') == '') return;

        let command = _command.split(' ');

        for (let commandIndex = 1; commandIndex < command.length; commandIndex++) {
            command[commandIndex] = parseFloat(command[commandIndex]);
        }

        switch (command[0]) {
            // bpm 列表
            case 'bp': {
                chartSimple.bpm.push({
                    startBeat: command[1] || 0,
                    bpm: command[2] || 120
                });
                break;
            }
            // note
            case 'n1':
                { // tap
                    chartSimple.pushNote({
                        type: 1,
                        lineId: !isNaN(command[1]) ? command[1] : -1,
                        startTime: command[2] || 0,
                        positionX: command[3] || 0,
                        isAbove: command[4] == 1 ? true : false,
                        isFake: command[5] == 1 ? true : false
                    });
                    break;
                }
            case 'n2':
                { // hold
                    chartSimple.pushNote({
                        type: 3,
                        lineId: !isNaN(command[1]) ? command[1] : -1,
                        startTime: command[2] || 0,
                        endTime: command[3] || (command[2] || 0),
                        positionX: command[4] || 0,
                        isAbove: command[5] == 1 ? true : false,
                        isFake: command[6] == 1 ? true : false
                    });
                    break;
                }
            case 'n3':
                { // flick
                    chartSimple.pushNote({
                        type: 4,
                        lineId: !isNaN(command[1]) ? command[1] : -1,
                        startTime: command[2] || 0,
                        positionX: command[3] || 0,
                        isAbove: command[4] == 1 ? true : false,
                        isFake: command[5] == 1 ? true : false
                    });
                    break;
                }
            case 'n4':
                { // drag
                    chartSimple.pushNote({
                        type: 2,
                        lineId: !isNaN(command[1]) ? command[1] : -1,
                        startTime: command[2] || 0,
                        positionX: command[3] || 0,
                        isAbove: command[4] == 1 ? true : false,
                        isFake: command[5] == 1 ? true : false
                    });
                    break;
                }
            // note 附加信息
            case '#':
                { // 速度
                    chartSimple.notes[chartSimple.notes.length - 1].speed = !isNaN(command[1]) ? command[1] : 1;
                    break;
                }
            case '&':
                { // 缩放
                    chartSimple.notes[chartSimple.notes.length - 1].xScale = !isNaN(command[1]) ? command[1] : 1;
                    break;
                }
            // 判定线事件相关
            case 'cv':
                { // speed
                    chartSimple.pushEventToLine(command[1], 'speed', {
                        startTime: command[2] || 0,
                        endTime: NaN,
                        value: !isNaN(command[3]) ? command[3] / 7 : 1
                    });
                    break;
                }
            case 'cm':
                { // moveX & moveY
                    chartSimple.pushEventToLine(command[1], 'moveX', {
                        startTime: command[2] || 0,
                        endTime: command[3] || (command[2] || 0),
                        start: NaN,
                        end: command[4] / 2048 - 0.5 || 0,
                        easingType: command[6] || 1
                    });
                    chartSimple.pushEventToLine(command[1], 'moveY', {
                        startTime: command[2] || 0,
                        endTime: command[3] || (command[2] || 0),
                        start: NaN,
                        end: command[5] / 1400 - 0.5 || 0,
                        easingType: command[6] || 1
                    });
                    break;
                }
            case 'cp':
                { // moveX & moveY（瞬时）
                    chartSimple.pushEventToLine(command[1], 'moveX', {
                        startTime: command[2] || 0,
                        endTime: NaN,
                        start: command[3] / 2048 - 0.5 || 0,
                        end: command[3] / 2048 - 0.5 || 0,
                        easingType: 1
                    });
                    chartSimple.pushEventToLine(command[1], 'moveY', {
                        startTime: command[2] || 0,
                        endTime: NaN,
                        start: command[4] / 1400 - 0.5 || 0,
                        end: command[4] / 1400 - 0.5 || 0,
                        easingType: 1
                    });
                    break;
                }
            case 'cr':
                { // rotate
                    chartSimple.pushEventToLine(command[1], 'rotate', {
                        startTime: command[2] || 0,
                        endTime: command[3] || (command[2] || 0),
                        start: NaN,
                        end: command[4] || 0,
                        easingType: command[5] || 1
                    });
                    break;
                }
            case 'cd':
                { // rotate（瞬时）
                    chartSimple.pushEventToLine(command[1], 'rotate', {
                        startTime: command[2] || 0,
                        endTime: NaN,
                        start: command[3] || 0,
                        end: command[3] || 0,
                        easingType: 1
                    });
                    break;
                }
            case 'cf':
                { // alpha
                    chartSimple.pushEventToLine(command[1], 'alpha', {
                        startTime: command[2] || 0,
                        endTime: command[3] || (command[2] || 0),
                        start: NaN,
                        end: command[4] || 0,
                        easingType: 1
                    });
                    break;
                }
            case 'ca':
                { // alpha（瞬时）
                    chartSimple.pushEventToLine(command[1], 'alpha', {
                        startTime: command[2] || 0,
                        endTime: NaN,
                        start: command[3] || 0,
                        end: command[3] || 0,
                        easingType: 1
                    });
                    break;
                }
            default:
                {
                    console.warn('Unsupported command: ' + command[0] + ', ignoring.\nAt line ' + (commandIndex + 2) + ':\n' + command.join(' '));
                }
        }
    });

    if (chartSimple.bpm.length <= 0) {
        chartSimple.bpm.push({
            startBeat: 0,
            endBeat: 1e4,
            bpm: 120
        });
    }

    chartSimple.bpm.sort((a, b) => a.startBeat - b.startBeat);

    { // 将 Beat 计算为对应的时间（秒）
        let currentBeatRealTime = 0.5; // 当前每个 Beat 的实际时长（秒）
        let bpmChangedBeat = 0; // 当前 BPM 是在什么时候被更改的（Beat）
        let bpmChangedTime = 0; // 当前 BPM 是在什么时候被更改的（秒）

        chartSimple.bpm.forEach((bpm, index) => {

            bpm.endBeat = chartSimple.bpm[index + 1] ? chartSimple.bpm[index + 1].startBeat : 1e4;

            bpmChangedTime += currentBeatRealTime * (bpm.startBeat - bpmChangedBeat);
            bpm.startTime = bpmChangedTime;
            bpm.endTime = currentBeatRealTime * (bpm.endBeat - bpmChangedBeat);

            bpmChangedBeat += (bpm.startBeat - bpmChangedBeat);

            currentBeatRealTime = 60 / bpm.bpm;
            bpm.beatTime = 60 / bpm.bpm;
        });
    }

    // note 和 bpm 按时间排序
    chartSimple.bpm.sort((a, b) => b.startBeat - a.startBeat);
    for (const lineId in chartSimple.notesPerLine) {
        chartSimple.notesPerLine[lineId].sort((a: any, b: any) => a.startTime - b.startTime);
    }

    for (const lineId in chartSimple._judgelines) {
        let judgeline = chartSimple._judgelines[lineId];

        judgeline.sortEvent();

        // 事件参数补齐
        judgeline.eventLayers[0].alpha.forEach((event: any, eventIndex: any, array: any) => {
            if (isNaN(event.endTime)) event.endTime = eventIndex < array.length - 1 ? array[eventIndex + 1].startTime : 1e5;
            if (isNaN(event.start)) event.start = eventIndex > 0 ? array[eventIndex - 1].end : 0;
        });
        judgeline.eventLayers[0].moveX.forEach((event: any, eventIndex: any, array: any) => {
            if (isNaN(event.endTime)) event.endTime = eventIndex < array.length - 1 ? array[eventIndex + 1].startTime : 1e5;
            if (isNaN(event.start)) event.start = eventIndex > 0 ? array[eventIndex - 1].end : 0;
        });
        judgeline.eventLayers[0].moveY.forEach((event: any, eventIndex: any, array: any) => {
            if (isNaN(event.endTime)) event.endTime = eventIndex < array.length - 1 ? array[eventIndex + 1].startTime : 1e5;
            if (isNaN(event.start)) event.start = eventIndex > 0 ? array[eventIndex - 1].end : 0;
        });
        judgeline.eventLayers[0].rotate.forEach((event: any, eventIndex: any, array: any) => {
            if (isNaN(event.endTime)) event.endTime = eventIndex < array.length - 1 ? array[eventIndex + 1].startTime : 1e5;
            if (isNaN(event.start)) event.start = eventIndex > 0 ? array[eventIndex - 1].end / (Math.PI / 180) : 0;

            event.start = event.start * (Math.PI / 180);
            event.end = event.end * (Math.PI / 180);
        });
        judgeline.eventLayers[0].speed.forEach((event: any, eventIndex: any, array: any) => {
            if (isNaN(event.endTime)) event.endTime = eventIndex < array.length - 1 ? array[eventIndex + 1].startTime : 1e5;
        });

        // Alpha 事件单独进行计算
        judgeline.eventLayers[0].alpha.forEach((event: any) => {
            let noNoteSetsVisibleTime = true;

            if (event.start == -1) event.start = -255;
            else if (event.start == -2) event.start = -510;
            else if (event.start < -100 && event.start >= -1000) {
                for (let eventCountIndex = 0, eventCountLength = Math.ceil((event.endTime - event.startTime) / utils.CalcBetweenTime); eventCountIndex < eventCountLength; eventCountIndex++) {
                    let currentTime = (event.startTime + (eventCountIndex * utils.CalcBetweenTime)) >= event.endTime ? event.endTime : (event.startTime + (eventCountIndex * utils.CalcBetweenTime));
                    let currentEventValue = utils.valueCalculator(event, Easing, currentTime);
                    let visibleBeat = ((currentEventValue + 100) * -1) / 10;

                    if (currentEventValue >= -100) break;

                    for (const note of chartSimple.notesPerLine[lineId]) {
                        if (note.startTime < currentTime) continue;
                        if (note.startTime > currentTime) break;

                        note.visibleBeat = visibleBeat;
                        noNoteSetsVisibleTime = false;
                    }
                }

                event.start = noNoteSetsVisibleTime ? -255 : 0;
            }

            if (event.end == -1) event.end = -255;
            else if (event.end == -2) event.end = -510;
            else if (event.end < -100) event.end = noNoteSetsVisibleTime ? -255 : 0;

            event.start = event.start / 255;
            event.end = event.end / 255;
        });

        // 拆分缓动
        for (const name in judgeline.eventLayers[0]) {
            if (name == 'speed' || !(judgeline.eventLayers[0][name] instanceof Array)) continue;

            let newEvents: any[] = [];
            judgeline.eventLayers[0][name].forEach((event: any) => {
                utils.calculateEventEase(event, Easing)
                    .forEach((newEvent) => {
                        newEvents.push(newEvent);
                    }
                    );
            });
            judgeline.eventLayers[0][name] = newEvents;
        }

        // 合并相同变化量事件
        /*
        for (const name in judgeline.eventLayers[0])
        {
            if (name != 'speed' && (judgeline.eventLayers[0][name] instanceof Array))
            {
                judgeline.eventLayers[0][name] = utils.arrangeSameValueEvent(judgeline.eventLayers[0][name]);
            }
        }
        judgeline.eventLayers[0].speed = utils.arrangeSameSingleValueEvent(judgeline.eventLayers[0].speed);
        */

        // 计算事件真实时间
        for (const name in judgeline.eventLayers[0]) {
            if (!(judgeline.eventLayers[0][name] instanceof Array)) continue;
            judgeline.eventLayers[0][name] = utils.calculateRealTime(chartSimple.bpm, judgeline.eventLayers[0][name]);
        }

        judgeline.sortEvent();
        judgeline.calcFloorPosition();
    };

    for (const lineId in chartSimple.notesPerLine) {
        let notes = chartSimple.notesPerLine[lineId];

        // 计算 Note 高亮
        notes.forEach((note: any) => {
            if ((chartSimple.sameTimeNoteCount as any)[utils2.floorNum(note.startTime)] > 1) note.isMulti = true;
        });

        notes = utils2.calculateRealVisibleTime(chartSimple.bpm, notes);
        notes = utils.calculateRealTime(chartSimple.bpm, notes);
        notes.sort((a: any, b: any) => a.startTime - b.startTime);

        notes.forEach((note: any, noteIndex: any) => {
            let judgeline = chartSimple._judgelines[note.lineId];

            if (!judgeline) {
                console.warn('Judgeline ' + note.lineId + ' doesn\'t exist, ignoring.');
                return;
            }

            {  // 计算 Note 的 floorPosition
                let noteStartSpeedEvent = judgeline.getFloorPosition(note.startTime);
                note.floorPosition = noteStartSpeedEvent ? noteStartSpeedEvent.floorPosition + noteStartSpeedEvent.value * (note.startTime - noteStartSpeedEvent.startTime) : 0;

                if (note.type == 3) {
                    let noteEndSpeedEvent = judgeline.getFloorPosition(note.endTime);
                    note.holdLength = (noteEndSpeedEvent ? noteEndSpeedEvent.floorPosition + noteEndSpeedEvent.value * (note.endTime - noteEndSpeedEvent.startTime) : 0) - note.floorPosition;
                }
                else {
                    note.holdLength = 0;
                }
            }

            // 推送 Note
            chart.notes.push(new Note({
                id: noteIndex,
                type: note.type,
                time: note.startTime,
                holdTime: note.endTime - note.startTime,
                speed: note.speed,
                isAbove: note.isAbove,
                isMulti: note.isMulti,
                isFake: note.isFake,
                positionX: note.positionX * 9 / 1024,
                floorPosition: note.floorPosition,
                holdLength: note.holdLength,
                xScale: note.xScale,
                visibleTime: note.visibleTime,
                judgeline: judgeline
            }));
        });
    }

    for (const lineId in chartSimple._judgelines) {
        chart.judgelines.push(chartSimple._judgelines[lineId]);
    }

    chart.judgelines.sort((a: any, b: any) => a.id - b.id);
    chart.notes.sort((a: any, b: any) => a.time - b.time);

    chart.bpmList = utils.calculateHoldBetween(chartSimple.bpm);
    chart_log.info("铺面加载完成", "用时", (performance.now() - ___).toFixed(0) + "ms", "总计note:", chart.notes.length, "个", "判定线", chart.judgelines.length, "条")
    return chart;
}