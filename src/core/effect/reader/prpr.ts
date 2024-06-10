import Effect from '../index'
import utils from '../../chart/convert/utils';
import PrPrExtraJSON from '../types';
import { RePhiEditEasing } from '../../chart/easing';

export default function PrprEffectReader(effect: PrPrExtraJSON) {
    let effectList: Effect[] = [];
    let rawEffects = [...effect.effects];
    let bpmList: any[] = [...effect.bpm];

    { // 将 Beat 计算为对应的时间（秒）
        let currentBeatRealTime = 0.5; // 当前每个 Beat 的实际时长（秒）
        let bpmChangedBeat = 0; // 当前 BPM 是在什么时候被更改的（Beat）
        let bpmChangedTime = 0; // 当前 BPM 是在什么时候被更改的（秒）

        bpmList.forEach((bpm, index) => {
            bpm.endTime = bpmList[index + 1] ? bpmList[index + 1].time : [1e4, 0, 1];

            bpm.startBeat = bpm.time[0] + bpm.time[1] / bpm.time[2];
            bpm.endBeat = bpm.endTime[0] + bpm.endTime[1] / bpm.endTime[2];

            bpmChangedTime += currentBeatRealTime * (bpm.startBeat - bpmChangedBeat);
            bpm.startTime = bpmChangedTime;
            bpm.endTime = currentBeatRealTime * (bpm.endBeat - bpmChangedBeat);

            bpmChangedBeat += (bpm.beat - bpmChangedBeat);

            currentBeatRealTime = 60 / bpm.bpm;
            bpm.beatTime = 60 / bpm.bpm;
        });

        bpmList.sort((a, b) => b.beat - a.beat);
    }

    if (bpmList.length <= 0) {
        bpmList.push({
            startBeat: 0,
            endBeat: 1e4,
            startTime: 0,
            endTime: 1e6 - 1,
            bpm: 120,
            beatTime: 0.5
        });
    }

    utils.calculateRealTime(bpmList, calculateEffectsBeat(rawEffects))
        .forEach((_effect: any) => {
            let __effect = new Effect({
                startTime: _effect.startTime,
                endTime: _effect.endTime,
                shader: _effect.shader,
                isGlobal: _effect.global || false,
                vars: {},
            });

            for (const name in _effect.vars) {
                let _values = _effect.vars[name];

                if (_values instanceof Array) {
                    let _timedValues: any[] = [];
                    let values: any[] = [];

                    utils.calculateEventsBeat(_values)
                        .sort((a: any, b: any) => a.startTime - b.startTime || b.endTime - a.startTime)
                        .forEach((_value: any, index: any, arr: any) => {
                            let prevValue = arr[index - 1];

                            if (!prevValue) _timedValues.push(_value);
                            else if (_value.startTime == prevValue.startTime) {
                                if (_value.endTime >= prevValue.endTime) _timedValues[_timedValues.length - 1] = _value;
                            }
                            else _timedValues.push(_value);
                        }
                        );

                    for (const _value of _timedValues) {
                        values.push(...utils.calculateRealTime(bpmList, utils.calculateEventEase(_value, RePhiEditEasing)));
                    }
                    values.sort((a, b) => a.startTime - b.startTime || b.endTime - a.startTime);
                    __effect.vars[name] = values;
                }
                else {
                    __effect.vars[name] = _values;
                }
            }

            effectList.push(__effect);
        }
        );

    effectList.sort((a, b) => a.startTime - b.startTime);

    return effectList;
}



function calculateEffectBeat(effect: any) {
    effect.startTime = parseFloat((effect.start[0] + (effect.start[1] / effect.start[2])).toFixed(3));
    effect.endTime = parseFloat((effect.end[0] + (effect.end[1] / effect.end[2])).toFixed(3));
    return effect;
}

function calculateEffectsBeat(effects: any) {
    effects.forEach((effect: any) => {
        effect = calculateEffectBeat(effect);
    });
    return effects;
}