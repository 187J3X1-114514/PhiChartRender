import Chart from '../index';
import Judgeline from '../judgeline';
import EventLayer from '../eventlayer';
import Note from '../note';
import utils from './utils';
import { RePhiEditEasing as Easing } from '../easing'
import { RePhiEdit as utils2 } from './otherUtils'
import { chart_log } from './index.js';
import type { Event } from '../anim/type.js';
import { CONST } from '@/core/types/const';
export default function RePhiEditChartConverter(_chart: any) {
    let notes: any[] = [];
    let sameTimeNoteCount = {};
    let ___ = performance.now()
    let rawChart = convertChartFormat(_chart);
    chart_log.info("加载RPE格式的铺面中,版本", rawChart.META.RPEVersion)
    let chart = new Chart({
        name: rawChart.META.name,
        artist: rawChart.META.composer,
        author: rawChart.META.charter,
        difficult: rawChart.META.level,
        offset: rawChart.META.offset / 1000
    });

    { // 将 Beat 计算为对应的时间（秒）
        let currentBeatRealTime = 0.5; // 当前每个 Beat 的实际时长（秒）
        let bpmChangedBeat = 0; // 当前 BPM 是在什么时候被更改的（Beat）
        let bpmChangedTime = 0; // 当前 BPM 是在什么时候被更改的（秒）

        rawChart.BPMList.forEach((bpm: any, index: number) => {
            bpm.endTime = rawChart.BPMList[index + 1] ? rawChart.BPMList[index + 1].startTime : [1e4, 0, 1];

            bpm.startBeat = bpm.startTime[0] + bpm.startTime[1] / bpm.startTime[2];
            bpm.endBeat = bpm.endTime[0] + bpm.endTime[1] / bpm.endTime[2];

            bpmChangedTime += currentBeatRealTime * (bpm.startBeat - bpmChangedBeat);
            bpm.startTime = bpmChangedTime;
            bpm.endTime = currentBeatRealTime * (bpm.endBeat - bpmChangedBeat);

            bpmChangedBeat += (bpm.startBeat - bpmChangedBeat);

            currentBeatRealTime = 60 / bpm.bpm;
            bpm.beatTime = 60 / bpm.bpm;
        });

        rawChart.BPMList.sort((a: any, b: any) => b.startBeat - a.startBeat);
    }

    rawChart.judgeLineList.forEach((_judgeline: any, judgelineIndex: any) => {
        let judgeline = new Judgeline({
            id: judgelineIndex,
            texture: _judgeline.Texture != 'line.png' ? _judgeline.Texture : null,
            parentLine: _judgeline.father >= 0 ? _judgeline.father : NaN,
            zIndex: _judgeline.zOrder != 0 ? _judgeline.zOrder : NaN,
            isCover: _judgeline.isCover == 1
        });

        if (_judgeline.attachUI && _judgeline.attachUI != '') {
            judgeline.attachUI = _judgeline.attachUI
        }

        // 处理 EventLayer
        _judgeline.eventLayers.forEach((_eventLayer: any) => {
            let eventLayer = new EventLayer();

            for (const eventName in _eventLayer) {
                // 拍数数组转小数
                _eventLayer[eventName] = utils.calculateEventsBeat(_eventLayer[eventName] ? _eventLayer[eventName] : []);

                // 拆分缓动并将结果直接 push 进新的 eventLayer 中
                if (eventName != 'speedEvents') {
                    _eventLayer[eventName].forEach((event: any) => {
                        utils.calculateEventEase(event, Easing)
                            .forEach((newEvent) => {
                                switch (eventName) {
                                    case 'moveXEvents':
                                        {
                                            eventLayer.moveX.push(newEvent);
                                            break;
                                        }
                                    case 'moveYEvents':
                                        {
                                            eventLayer.moveY.push(newEvent);
                                            break;
                                        }
                                    case 'alphaEvents':
                                        {
                                            eventLayer.alpha.push(newEvent);
                                            break;
                                        }
                                    case 'rotateEvents':
                                        {
                                            eventLayer.rotate.push(newEvent);
                                            break;
                                        }
                                    default:
                                        {
                                            console.warn('Unsupported event name \'' + eventName + '\', ignoring');
                                        }
                                }
                            }
                            );
                    });
                }
                else {
                    // 拆分 speedEvent
                    _eventLayer.speedEvents.forEach((event: any) => {
                        utils2.separateSpeedEvent(event)
                            .forEach((_event) => {
                                eventLayer.speed.push(_event);
                            }
                            );
                    });
                }
            }
            eventLayer.sort();

            if (
                eventLayer.speed.events.length <= 0 &&
                eventLayer.moveX.events.length <= 0 &&
                eventLayer.moveY.events.length <= 0 &&
                eventLayer.alpha.events.length <= 0 &&
                eventLayer.rotate.events.length <= 0
            ) {
                return;
            }
            let speed = utils.calculateRealTime(rawChart.BPMList, eventLayer.speed.events);
            eventLayer.moveX.events = utils.calculateRealTime(rawChart.BPMList, eventLayer.moveX.events);
            eventLayer.moveY.events = utils.calculateRealTime(rawChart.BPMList, eventLayer.moveY.events);
            eventLayer.alpha.events = utils.calculateRealTime(rawChart.BPMList, eventLayer.alpha.events);
            eventLayer.rotate.events = utils.calculateRealTime(rawChart.BPMList, eventLayer.rotate.events);

            speed.forEach((event: any) => {
                event.value = event.value / (0.6 / (120 / 900));
            });
            eventLayer.moveX.events.forEach((event) => {
                event.start = event.start / 1350;
                event.end = event.end / 1350;
            });
            eventLayer.moveY.events.forEach((event) => {
                event.start = event.start / 900;
                event.end = event.end / 900;
            });
            eventLayer.alpha.events.forEach((event) => {
                event.start = event.start / 255;
                event.end = event.end / 255;

                event.start = event.start > 1 ? 1 : event.start;
                event.end = event.end > 1 ? 1 : event.end;

                event.start = event.start < -1 ? -1 : event.start;
                event.end = event.end < -1 ? -1 : event.end;
            });
            eventLayer.rotate.events.forEach((event) => {
                event.start = (Math.PI / 180) * event.start;
                event.end = (Math.PI / 180) * event.end;
            });
            eventLayer.moveX.events = fixEvent(eventLayer.moveX.events)
            eventLayer.moveY.events = fixEvent(eventLayer.moveY.events)
            eventLayer.alpha.events = fixEvent(eventLayer.alpha.events)
            eventLayer.rotate.events = fixEvent(eventLayer.rotate.events)
            eventLayer.speed.events = speed
            eventLayer.sort();
            judgeline.eventLayers.push(eventLayer);
        });

        // 处理 extendEvents
        if (_judgeline.extended) {
            // 流程跟上边都是一样的，没啥好看的
            if (_judgeline.extended.textEvents && _judgeline.extended.textEvents.length > 0) {
                judgeline.isText = true;

                utils.calculateEventsBeat(_judgeline.extended.textEvents)
                    .forEach((event: any) => {
                        utils2.calculateTextEventEase(event)
                            .forEach((newEvent: any) => {
                                judgeline.extendEvent.text.push(newEvent);
                            }
                            );
                    }
                    );

                judgeline.extendEvent.text.forEach((event, eventIndex) => {
                    if (isNaN(event.endTime)) {
                        event.endTime = judgeline.extendEvent.text[eventIndex + 1] ? judgeline.extendEvent.text[eventIndex + 1].startTime : 100;
                    }
                });
                judgeline.extendEvent.text = utils.calculateRealTime(rawChart.BPMList, judgeline.extendEvent.text);
            }

            if (_judgeline.extended.scaleXEvents && _judgeline.extended.scaleXEvents.length > 0) {
                utils.calculateEventsBeat(_judgeline.extended.scaleXEvents)
                    .forEach((event: any) => {
                        utils.calculateEventEase(event, Easing)
                            .forEach((newEvent) => {
                                judgeline.extendEvent.scaleX.push(newEvent);
                            }
                            );
                    }
                    );
                judgeline.extendEvent.scaleX = utils.calculateRealTime(rawChart.BPMList, judgeline.extendEvent.scaleX);
            }

            if (_judgeline.extended.scaleYEvents && _judgeline.extended.scaleYEvents.length > 0) {
                utils.calculateEventsBeat(_judgeline.extended.scaleYEvents)
                    .forEach((event: any) => {
                        utils.calculateEventEase(event, Easing)
                            .forEach((newEvent) => {
                                judgeline.extendEvent.scaleY.push(newEvent);
                            }
                            );
                    }
                    );
                judgeline.extendEvent.scaleY = utils.calculateRealTime(rawChart.BPMList, judgeline.extendEvent.scaleY);
            }

            if (_judgeline.extended.colorEvents && _judgeline.extended.colorEvents.length > 0) {
                utils.calculateEventsBeat(_judgeline.extended.colorEvents)
                    .forEach((event: any) => {
                        utils2.calculateColorEventEase(event)
                            .forEach((newEvent) => {
                                judgeline.extendEvent.color.push(newEvent);
                            }
                            );
                    }
                    );
                judgeline.extendEvent.color = utils.calculateRealTime(rawChart.BPMList, judgeline.extendEvent.color);
            }

            if (_judgeline.extended.inclineEvents && _judgeline.extended.inclineEvents.length > 0) {
                let inclineEvents = utils.calculateEventsBeat(_judgeline.extended.inclineEvents);

                if (inclineEvents.length == 1 &&
                    (inclineEvents[0].startTime == 0 && inclineEvents[0].endTime == 1) &&
                    (inclineEvents[0].start == 0 && inclineEvents[0].end == 0)
                ) { /* Do nothing */ }
                else {
                    inclineEvents.forEach((event: any) => {
                        utils.calculateEventEase(event, Easing)
                            .forEach((newEvent) => {
                                newEvent.start = (Math.PI / 180) * newEvent.start;
                                newEvent.end = (Math.PI / 180) * newEvent.end;

                                judgeline.extendEvent.incline.push(newEvent);
                            }
                            );
                    });
                    judgeline.extendEvent.incline = utils.calculateRealTime(rawChart.BPMList, judgeline.extendEvent.incline);
                }
            }
        }

        judgeline.noteControls.alpha = utils2.calculateNoteControls(_judgeline.alphaControl, 'alpha', 1);
        judgeline.noteControls.scale = utils2.calculateNoteControls(_judgeline.sizeControl, 'size', 1);
        judgeline.noteControls.x = utils2.calculateNoteControls(_judgeline.posControl, 'pos', 1);
        judgeline.noteControls.y = utils2.calculateNoteControls(_judgeline.yControl, 'y', 1);

        // 事件排序并计算 floorPosition
        judgeline.sortEvent();
        judgeline.calcFloorPosition();

        // 计算 Note 真实时间
        _judgeline.notes = utils.calculateEventsBeat(_judgeline.notes ? _judgeline.notes : []);
        _judgeline.notes.sort((a: any, b: any) => a.startTime - b.startTime);
        _judgeline.notes.forEach((note: any, noteIndex: any) => {
            (sameTimeNoteCount as any)[note.startTime] = !(sameTimeNoteCount as any)[note.startTime] ? 1 : (sameTimeNoteCount as any)[note.startTime] + 1;

            note.id = noteIndex;
            note.judgeline = judgeline;

            notes.push(note);
        });;
        // _judgeline.notes = utils.calculateRealTime(rawChart.BPMList, _judgeline.notes);

        /*
        _judgeline.notes.forEach((_note, noteIndex) =>
        {
            
        });
        */
        if (_judgeline.attachUI && _judgeline.attachUI != '') {
            chart.othersJudgeLine.push(judgeline);
        } else {
            chart.judgelines.push(judgeline);
        }

    });

    // 计算 Note 高亮
    notes.forEach((note) => {
        if ((sameTimeNoteCount as any)[note.startTime] > 1) note.isMulti = true;
    });

    notes = utils.calculateRealTime(rawChart.BPMList, notes);
    notes.forEach((note) => {
        // 计算 Note 的 floorPosition
        let noteStartSpeedEvent = note.judgeline.getFloorPosition(note.startTime);
        note.floorPosition = noteStartSpeedEvent ? noteStartSpeedEvent.floorPosition + noteStartSpeedEvent.value * (note.startTime - noteStartSpeedEvent.startTime) : 0;

        if (note.type == 2) {
            let noteEndSpeedEvent = note.judgeline.getFloorPosition(note.endTime);
            note.holdLength = (noteEndSpeedEvent ? noteEndSpeedEvent.floorPosition + noteEndSpeedEvent.value * (note.endTime - noteEndSpeedEvent.startTime) : 0) - note.floorPosition;
        }
        else {
            note.holdLength = 0;
        }
        let noteType = -1
        switch (note.type) {
            case 1:
                noteType = CONST.NoteType.Tap
                break
            case 2:
                noteType = CONST.NoteType.Hold
                break
            case 3:
                noteType = CONST.NoteType.Flick
                break
            case 4:
                noteType = CONST.NoteType.Drag
                break
        }
        if (noteType != -1) {
            chart.notes.push(new Note({
                id: note.id,
                type: noteType,
                time: note.startTime,
                holdTime: note.endTime - note.startTime,
                speed: note.speed,
                floorPosition: note.floorPosition,
                holdLength: note.holdLength,
                positionX: (note.positionX / (670 * (9 / 80))),
                basicAlpha: note.alpha / 255,
                visibleTime: note.visibleTime < 999999 ? note.visibleTime : NaN,
                yOffset: (note.yOffset / 900),
                xScale: note.size,
                isAbove: note.above == 1 ? true : false,
                isMulti: note.isMulti,
                isFake: note.isFake == 1 ? true : false,
                judgeline: note.judgeline
            }));
        }
    });

    chart.judgelines.sort((a: any, b: any) => a.id - b.id);
    chart.notes.sort((a: any, b: any) => a.time - b.time);

    chart.judgelines.forEach((judgeline: any, _judgelineIndex: any, judgelines: any) => {
        if (!isNaN(judgeline.parentLine) && judgeline.parentLine >= 0) {
            let parentLineId = judgeline.parentLine;
            judgeline.parentLine = null;

            for (const parentLine of judgelines) {
                if (parentLine.id == parentLineId) {
                    judgeline.parentLine = parentLine;
                    break;
                }
            }
        }
        else judgeline.parentLine = null;
    });

    chart.bpmList = utils.calculateHoldBetween(rawChart.BPMList);
    chart_log.info("铺面加载完成", "用时", (performance.now() - ___).toFixed(0) + "ms", "总计note:", chart.notes.length, "个", "判定线", chart.judgelines.length, "条")
    return chart;
}

function convertChartFormat(rawChart: any) {
    let chart = JSON.parse(JSON.stringify(rawChart));

    if (chart.META.RPEVersion <= 100) {
        chart.judgeLineList.forEach((judgeline: any) => {
            judgeline.bpmfactor = 1;
            judgeline.father = -1;
            judgeline.zOrder = 0;
            judgeline.eventLayers.forEach((eventLayer: EventLayer) => {
                eventLayer.speed.events.forEach((event: any) => {
                    event.easingLeft = 0;
                    event.easingRight = 1;
                });
                eventLayer.moveX.events.forEach((event: any) => {
                    event.easingLeft = 0;
                    event.easingRight = 1;
                });
                eventLayer.moveY.events.forEach((event: any) => {
                    event.easingLeft = 0;
                    event.easingRight = 1;
                });
                eventLayer.alpha.events.forEach((event: any) => {
                    event.easingLeft = 0;
                    event.easingRight = 1;
                });
                eventLayer.rotate.events.forEach((event: any) => {
                    event.easingLeft = 0;
                    event.easingRight = 1;
                });

            });
        });
    }

    return chart;
}

function fixEvent(events: Event[]) {
    let temp = events.slice()
    temp.forEach((event, index) => {
        if (index != temp.length - 1) {
            if (temp[index + 1].startTime != temp[index].endTime) {
                let ij_i = events.indexOf(event) + 1
                events.splice(ij_i, 0,
                    {
                        start: event.end,
                        end: event.end,
                        startTime: event.endTime,
                        endTime: events[ij_i].startTime
                    })
            }
        }
    })
    return events
}