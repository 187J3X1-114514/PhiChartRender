import Chart from '../index';
import Judgeline from '../judgeline';
import EventLayer from '../eventlayer.js';
import Note from '../note';

import utils from './utils';
import type { Event, OfficialChartEvent, BpmEvent, ValueEvent } from '../anim/type';
import type { officialChartData } from '../types/index.js';
import type { extendNoteData } from '../types/note.js';
import { chart_log } from './index.js';
import { CONST } from '@/core/types/const';

export default function OfficialChartConverter(_chart: officialChartData) {
    let chart = new Chart();
    let ___ = performance.now()
    chart_log.info("加载官方格式的铺面中,版本",_chart.formatVersion)
    let rawChart = convertOfficialVersion(_chart);
    let notes: extendNoteData[] = [];
    let sameTimeNoteCount = {};
    let bpmList: BpmEvent[] = [];
    
    chart.offset = rawChart.offset;

    rawChart.judgeLineList.forEach((_judgeline, index: number) => {
        let judgeline = new Judgeline({ id: index });
        let events = new EventLayer();
        let judgelineNotes: any[] = [];

        _judgeline.speedEvents.forEach((e: ValueEvent) => {
            events.speed.push({
                startTime: calcRealTime(e.startTime, _judgeline.bpm),
                endTime: calcRealTime(e.endTime, _judgeline.bpm),
                value: e.value
            });
        });
        _judgeline.judgeLineMoveEvents.forEach((e: OfficialChartEvent) => {
            events.moveX.push({
                startTime: calcRealTime(e.startTime, _judgeline.bpm),
                endTime: calcRealTime(e.endTime, _judgeline.bpm),
                start: e.start - 0.5,
                end: e.end - 0.5
            });
            events.moveY.push({
                startTime: calcRealTime(e.startTime, _judgeline.bpm),
                endTime: calcRealTime(e.endTime, _judgeline.bpm),
                start: e.start2 - 0.5,
                end: e.end2 - 0.5
            });
        });
        _judgeline.judgeLineRotateEvents.forEach((e: Event) => {
            events.rotate.push({
                startTime: calcRealTime(e.startTime, _judgeline.bpm),
                endTime: calcRealTime(e.endTime, _judgeline.bpm),
                start: -(Math.PI / 180) * e.start,
                end: -(Math.PI / 180) * e.end
            });
        });
        _judgeline.judgeLineDisappearEvents.forEach((e: Event) => {
            events.alpha.push({
                startTime: calcRealTime(e.startTime, _judgeline.bpm),
                endTime: calcRealTime(e.endTime, _judgeline.bpm),
                start: e.start,
                end: e.end
            });
        });

        judgeline.eventLayers.push(events);
        judgeline.sortEvent();

        judgeline.eventLayers[0].moveX.events = utils.arrangeSameValueEvent(judgeline.eventLayers[0].moveX.events);
        judgeline.eventLayers[0].moveY.events = utils.arrangeSameValueEvent(judgeline.eventLayers[0].moveY.events);
        judgeline.eventLayers[0].rotate.events = utils.arrangeSameValueEvent(judgeline.eventLayers[0].rotate.events);
        judgeline.eventLayers[0].alpha.events = utils.arrangeSameValueEvent(judgeline.eventLayers[0].alpha.events);

        judgeline.calcFloorPosition();

        _judgeline.notesAbove.forEach((rawNote, rawNoteIndex) => {
            rawNote.judgeline = judgeline;
            rawNote.id = rawNoteIndex;
            rawNote.bpm = _judgeline.bpm;
            rawNote.isAbove = true;
            // let note = pushNote(rawNote, judgeline, rawNoteIndex, _judgeline.bpm, true);
            judgelineNotes.push(rawNote);
        });
        _judgeline.notesBelow.forEach((rawNote, rawNoteIndex) => {
            rawNote.judgeline = judgeline;
            rawNote.id = rawNoteIndex;
            rawNote.bpm = _judgeline.bpm;
            rawNote.isAbove = false;
            // let note = pushNote(rawNote, judgeline, rawNoteIndex, _judgeline.bpm, false);
            judgelineNotes.push(rawNote);
        });

        judgelineNotes.sort((a, b) => a.time - b.time);
        judgelineNotes.forEach((note, noteIndex) => {
            (sameTimeNoteCount as any)[note.time] = !(sameTimeNoteCount as any)[note.time] ? 1 : (sameTimeNoteCount as any)[note.time] + 1;
            note.id = noteIndex;
        });

        notes.push(...judgelineNotes);

        chart.judgelines.push(judgeline);
    });

    notes.sort((a, b) => a.time - b.time);
    notes.forEach((note) => {
        if ((sameTimeNoteCount as any)[note.time] > 1) note.isMulti = true;
        chart.notes.push(pushNote(note));
    });
    chart.notes.sort((a, b) => a.time - b.time);

    notes.sort((a, b) => a.time - b.time);
    notes.forEach((note) => {
        if (bpmList.length <= 0) {
            bpmList.push({
                startTime: note.time,
                endTime: note.time,
                bpm: note.bpm,
                holdBetween: ((-1.2891 * note.bpm) + 396.71) / 1000
            });
        }
        else {
            bpmList[bpmList.length - 1].endTime = note.time;

            if (bpmList[bpmList.length - 1].bpm != note.bpm) {
                bpmList.push({
                    startTime: note.time,
                    endTime: note.time,
                    bpm: note.bpm,
                    holdBetween: ((-1.2891 * note.bpm) + 396.71) / 1000
                });
            }
        }
    });
    bpmList.sort((a, b) => a.startTime - b.startTime);

    if (bpmList.length > 0) {
        bpmList[0].startTime = 1 - 1000;
        bpmList[bpmList.length - 1].endTime = 1e4;
    }
    else {
        bpmList.push({
            startTime: 1 - 1000,
            endTime: 1e4,
            bpm: 120,
            holdBetween: 0.242018
        });
    }

    chart.bpmList = bpmList.slice();
    chart_log.info("铺面加载完成","用时",(performance.now()-___).toFixed(0)+"ms","总计note:",chart.notes.length,"个","判定线",chart.judgelines.length,"条")
    return chart;

    function pushNote(rawNote: extendNoteData) {
        rawNote.time = calcRealTime(rawNote.time, rawNote.bpm);
        rawNote.holdTime = calcRealTime(rawNote.holdTime, rawNote.bpm);
        rawNote.holdEndTime = rawNote.time + rawNote.holdTime;

        {  // 考虑到 js 精度，此处重新计算 Note 的 floorPosition 值
            let noteStartSpeedEvent = rawNote.judgeline.getFloorPosition(rawNote.time);
            rawNote.floorPosition = noteStartSpeedEvent ? noteStartSpeedEvent.floorPosition + noteStartSpeedEvent.value * (rawNote.time - noteStartSpeedEvent.startTime) : 0;

            if (rawNote.type == CONST.NoteType.Hold) {
                //let noteEndSpeedEvent = rawNote.judgeline.getFloorPosition(rawNote.holdEndTime);
                rawNote.holdLength = rawNote.holdTime * rawNote.speed /*(noteEndSpeedEvent ? noteEndSpeedEvent.floorPosition + noteEndSpeedEvent.value * (rawNote.holdEndTime - noteEndSpeedEvent.startTime) : 0) - rawNote.floorPosition */;
            }
            else {
                rawNote.holdLength = 0;
            }
        }

        return new Note({
            id: rawNote.id,
            lineId: rawNote.lineId ? rawNote.lineId : rawNote.judgeline.id,
            type: rawNote.type,
            time: rawNote.time,
            holdTime: rawNote.holdTime,
            holdLength: rawNote.holdLength,
            positionX: rawNote.positionX,
            floorPosition: rawNote.floorPosition,
            speed: rawNote.speed,
            isAbove: rawNote.isAbove,
            isMulti: rawNote.isMulti,
            useOfficialSpeed: true,
            judgeline: rawNote.judgeline
        });
    }
};


function convertOfficialVersion(chart: officialChartData) {
    let newChart: officialChartData = JSON.parse(JSON.stringify(chart));

    switch (newChart.formatVersion) {
        case 1:
            {
                newChart.formatVersion = 3;
                for (const i of newChart.judgeLineList) {
                    let floorPosition = 0;

                    for (const x of i.speedEvents) {
                        if (x.startTime < 0) x.startTime = 0;
                        x.floorPosition = floorPosition;
                        floorPosition += (x.endTime - x.startTime) * x.value / i.bpm * 1.875;
                    }

                    //for (const x of i.judgeLineDisappearEvents)
                    //{
                    //    x.start2 = 0;
                    //    x.end2   = 0;
                    //}

                    for (const x of i.judgeLineMoveEvents) {
                        x.start2 = x.start % 1e3 / 520;
                        x.end2 = x.end % 1e3 / 520;
                        x.start = parseInt((x.start / 1e3).toFixed(10)) / 880;
                        x.end = parseInt((x.end / 1e3).toFixed(10)) / 880;
                    }

                    //for (const x of i.judgeLineRotateEvents)
                    //{
                    //    x.start2 = 0;
                    //    x.end2   = 0;
                    //}
                }
                break
            }
        case 3: {
            break;
        }
        default:
            throw new Error('不受支持的铺面版本: ' + newChart.formatVersion);
    }

    return newChart;
}

function calcRealTime(time: number, bpm: number) {
    return time / bpm * 1.875;
}