
import Effect from './effect/index'
import utils from '../chart/convert/utils';
import PrPrExtraJSON, { PrPrExtraVideo } from './types';
import { RePhiEditEasing } from '../chart/easing';
import Game from '../game';
import Shader, { DefaultShader } from './effect/shader';
import { Filter, Texture } from 'pixi.js';
import { newLogger } from '../log';
import { PrprVideo } from './video';
import { SizerData } from '../types/params';
import { join } from '../file/utils';
import { effectEvent } from '../chart/baseEvents';
const log = newLogger("prpr拓展")
export class PrprExtra {
    private game?: Game
    public effects: Effect[] = []
    public videos: PrprVideo[] | PrPrExtraVideo[] = []
    private sizer: SizerData = {} as any
    static from(json: any) {
        let prpr = new this()
        if (json.effects) prpr.effects = this.PrprEffectReader(json);
        if (json.videos) prpr.videos = this.PrprVideoReader(json);
        return prpr
    }

    setGame(game: Game) {
        this.game = game
    }

    resize(size: SizerData) {

        this.sizer = size
        this.videos.forEach((v) => {
            v = v as PrprVideo
            v.resize(size)
        })
    }
    private lastTime: number = 0
    private paused: boolean = false
    calcTime(currentTime: number) {
        if (+currentTime.toFixed(3) != +this.lastTime.toFixed(3)) {
            this.lastTime = currentTime
            this.paused = false
        } else {
            this.paused = true
        }
        this.cleanShader()
        let effects = this.effects
        let { renders, render } = this.game!;
        for (let i = 0, length = effects.length; i < length; i++) {
            const effect = effects[i];
            if (effect.shader === null) continue;
            if (effect.endTime < currentTime) {
                if (!effect.isGlobal) {
                    let index = (render.stage.filters as Filter[]).indexOf((effect.shader as Shader).filter);
                    if (index > -1) (render.stage.filters as Filter[]).slice(index, 1)
                } else {
                    let index = (renders.gameContainer.filters as Filter[]).indexOf((effect.shader as Shader).filter);
                    if (index > -1) (renders.gameContainer.filters as Filter[]).slice(index, 1)
                }
                continue
            }
            if (effect.startTime > currentTime) break;

            effect.calcTime(currentTime, renders.sizer.shaderScreenSize);
            if (effect.isGlobal) {
                let temp: any = (render.stage.filters as Filter[]).slice()
                temp.push((effect.shader as Shader).filter)
                render.stage.filters = temp
            } else {
                let temp: any = (renders.gameContainer.filters as Filter[]).slice()
                temp.push((effect.shader as Shader).filter)
                renders.gameContainer.filters = temp

            }
        }
        for (let i = 0, length = this.videos.length; i < length; i++) {
            const video = this.videos[i] as PrprVideo
            video.video.volume = 0
            video.sprite.zIndex = this.game!.ui.backgrounds.smallCover.zIndex + 1
            if (video.end < currentTime) {
                this.game!.renders.videoContainer.removeChild(video.sprite)
                continue
            }
            if (video.start < currentTime && video.end > currentTime && !this.game!.renders.videoContainer.children.includes(video.sprite)) {
                video.video.currentTime = 0
                this.game!.renders.videoContainer.addChild(video.sprite)
            }
            if (video.start < currentTime && video.end > currentTime) {
                if (!this.paused) {
                    video.play()
                } else {
                    video.pause()
                    continue
                }
            }

            video.calcTime(currentTime)
        }

    }

    cleanShader() {
        this.game!.renders.gameContainer.filters = [DefaultShader.filter];
        this.game!.render.stage.filters = [DefaultShader.filter];
    }

    init() {
        if (this.game == undefined) return
        let game = this.game!
        let tempEffects = this.effects.slice()
        for (let e of tempEffects) {
            let effect = this.effects[this.effects.indexOf(e)]
            if (effect.shader instanceof Shader) return;
            effect.shader = effect.shader as string
            let shaderName = effect.shader //(effect.shader.startsWith("/")) ? game.chart.rootPath + effect.shader : 
            let shaderRaw = this.getShaderText(shaderName)
            if (shaderRaw) {
                effect.shader = Shader.from(shaderRaw, shaderName, e.vars)
            } else {
                this.effects.splice(this.effects.indexOf(effect), 1)
                log.warn("没有发现名为", shaderName, "的着色器文件，当前加载的文件列表：", game.zipFiles.getFileList())
            }

        }
        let tempVideos = (this.videos as PrPrExtraVideo[]).splice(0, (this.videos as PrPrExtraVideo[]).length)
        for (let e of tempVideos) {
            let tex = this.game!.zipFiles.get(join(this.game!.chart.rootPath, e.path)) as Texture
            this.videos.push(PrprVideo.from(tex, e) as any)
        }

    }
    reset() {
        for (const effect of this.effects) effect.reset();
    }
    static get none(): PrprExtra {
        return PrprExtra.from({})
    }
    formatShader(text: string) {
        let shaderTextList = text.split("\n")
        let result = text
        let needReplace = false
        let versionLine = undefined
        for (let t of shaderTextList) {
            if (t.includes("uv") && t.includes("uniform")) {
                needReplace = true
            }
            if (t.includes("screenTexture") && t.includes("uniform")) {
                needReplace = true
            }
            if (t.includes("version") && t.startsWith("#version")) {
                versionLine = shaderTextList.indexOf(t)
            }
        }
        if (versionLine != undefined) {
            result = result.replace(shaderTextList[versionLine], '')
        }
        if (needReplace) {
            result = (result as any).replaceAll("uv", "vTextureCoord").replaceAll("screenTexture", "uTexture")
        }
        return result
    }
    getShaderText(name: string) {
        if (name.startsWith("/")) {
            let nl = name.split('')
            nl.splice(0, 1)
            let _name = nl.join('').split('.')[0]
            switch (_name.toLowerCase()) { //着色器兼容
                case "bloom":
                    return (Shader.presets as any)['bloom']
                case "movecamera":
                    return (Shader.presets as any)['movecamera']
                default:
                    return this.formatShader(this.game!.zipFiles.get(this.game!.chart.rootPath + name) as string)
            }
        } else {
            return (Shader.presets as any)[name]!
        }
    }
    private static PrprVideoReader(json: PrPrExtraJSON) {
        let rawVideos = [...json.videos];
        let bpmList: any[] = [...json.bpm];
        let result = [...json.videos];
        let currentBeatRealTime = 0.5;
        let bpmChangedBeat = 0;
        let bpmChangedTime = 0;
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
        result = utils.calculateRealTime(bpmList, calculateVideosBeat(rawVideos)) as PrPrExtraVideo[]
        result.forEach((_video) => {
            let videoP: Record<string, any> = {
                ...{ "alpha": _video.alpha ? _video.alpha : 1 },
                ...{ "dim": _video.dim ? _video.dim : 1 },
            }
            for (const name in videoP) {
                let _values = videoP[name];
                if (_values instanceof Array && _values[0]?.startTime) {
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

                    for (let _value of _timedValues) {
                        _value = {
                            ...{
                                "easingType": _video.easingType,
                                "easingLeft": _video.easingLeft,
                                "easingRight": _video.easingRight
                            }
                        }
                        values.push(...utils.calculateRealTime(bpmList, utils.calculateEventEase(_value, RePhiEditEasing)));
                    }
                    values.sort((a, b) => a.startTime - b.startTime || b.endTime - a.startTime);
                    (_video as any)[name] = values;
                }
                else {
                    (_video as any)[name] = [{
                        startTime: -999999,
                        start: _values,
                        end: _values,
                        endTime: -999999
                    }]
                }
            }
        })
        return result
    }

    static PrprEffectReader(effect: PrPrExtraJSON) {
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
                    if (_effect.vars[name] instanceof Array) {
                        let _values: effectEvent[] = _effect.vars[name].slice();
                        if (_values[0]?.startTime && _values[0]?.end instanceof Array && _values.length > 0) {
                            delete _effect.vars[name]
                            for (let i = 0, length = (_values[0].start as number[]).length; i < length; i++) {
                                _effect.vars[name + "@#$%&___" + i] = []
                            }
                            for (const event of _values) {
                                let start = event.start as number[]
                                let end = event.end as number[]
                                let is_color = start.length == 4
                                for (let i = 0, length = start.length; i < length; i++) {
                                    _effect.vars[name + "@#$%&___" + i].push({
                                        ...event,
                                        ...{
                                            start: start[i] / (is_color ? 255 : 1),
                                            end: end[i] / (is_color ? 255 : 1)
                                        }
                                    })
                                }

                            }
                        }
                    }

                }
                for (const name in _effect.vars) {
                    let _values = _effect.vars[name];
                    if (_values instanceof Array && _values[0]?.startTime) {
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
                        __effect.vars[name] = [{
                            startTime: -999999,
                            start: _values,
                            end: _values,
                            endTime: 999999
                        }]
                    }
                }

                effectList.push(__effect);
            }
            );

        effectList.sort((a, b) => a.startTime - b.startTime);

        effectList.forEach((v) => {
            for (const name in v.vars) {
                const values = v.vars[name];
                if (values.value) {
                    v.vars[name] = new Array().push(v.vars[name])
                }
            }
        })
        return effectList;
    }
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

function calculateVideoBeat(video: any) {
    if (video.startTime) video.startTime = parseFloat((video.startTime[0] + (video.startTime[1] / video.startTime[2])).toFixed(3));
    if (video.endTime) video.endTime = parseFloat((video.endTime[0] + (video.endTime[1] / video.endTime[2])).toFixed(3));
    if (video.time) video.time = parseFloat((video.time[0] + (video.time[1] / video.time[2])).toFixed(3));
    return video;
}

function calculateVideosBeat(videos: any) {
    videos.forEach((video: any) => {
        video = calculateVideoBeat(video);
    });
    return videos;
}