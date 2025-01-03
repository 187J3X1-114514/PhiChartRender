import * as verify from '../../verify';
import utils from '../convert/utils';
import { Sprite, Text, TextStyle, Texture } from 'pixi.js';
import EventLayer from '../eventlayer';
import * as font from '../../font'
import type { floorPositionEvent, Event, ValueEvent } from '../anim/type';
import { type PhiAssets, ResourceManager } from '../../resource';
import type { SizerData } from '../../types/params';
import { chart_log } from '../convert';
import type { jsonEventLayer, jsonJudgeLineData } from '../types/json/judgeLine';
import { AnimatedGIF } from '@pixi/gif';
import { conimgsize } from '../utils';

const blackJudgeLine = (() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 1920
    canvas.height = 3
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, 1920, 3);
    const result = Texture.from(canvas);
    return result;
})();
export var TEXT_RESOLUTION = 1


export default class Judgeline {
    id: number;
    texture: any;
    textureName?: string;
    isText: boolean;
    parentLine: Judgeline;
    zIndex: number;
    isCover: boolean;
    useOfficialScale: boolean;
    text?: string
    eventLayers: EventLayer[];
    floorPositions: floorPositionEvent[];
    extendEvent: {
        color: ValueEvent[],
        scaleX: Event[],
        scaleY: Event[],
        text: ValueEvent[],
        incline: Event[]
    };
    noteControls: {
        alpha: Event[],
        scale: Event[],
        x: Event[],
        y: Event[]
    };


    sprite: Sprite | Text | AnimatedGIF;
    speed = 1;
    x = 0.5;
    y = 0.5;
    alpha = 1;
    deg = 0;
    sinr = 0;
    cosr = 1;

    floorPosition = 0;

    baseScaleX = 3;
    baseScaleY = 2.88;
    scaleX = 1
    scaleY = 1
    inclineSinr = NaN;
    color = NaN;
    spriteStyle?: TextStyle
    attachUI?: string
    wasBlack: boolean = false
    constructor(params: any) {
        this.id = verify.number(params.id, -1, 0);
        this.texture = params.texture ? params.texture : null;
        this.textureName = params.texture
        this.parentLine = params.parentLine || params.parentLine === 0 ? params.parentLine : null;
        this.zIndex = verify.number(params.zIndex, 0);
        this.isCover = verify.bool(params.isCover, true);
        this.useOfficialScale = false;

        this.eventLayers = [];
        this.floorPositions = [];
        this.extendEvent = {
            color: [],
            scaleX: [],
            scaleY: [],
            text: [],
            incline: []
        };
        this.noteControls = {
            alpha: [],
            scale: [],
            x: [],
            y: []
        };
        this.isText = false;

        this.sprite = new Sprite();

        this.reset();
    }

    reset() {
        this.speed = 1;
        this.x = 0.5;
        this.y = 0.5;
        this.alpha = 1;
        this.deg = 0;
        this.sinr = 0;
        this.cosr = 1;

        this.floorPosition = 0;

        this.baseScaleX = 3;
        this.baseScaleY = 2.88;

        if (this.extendEvent.scaleX.length > 0 && this.extendEvent.scaleX[0].startTime <= 0) this.scaleX = this.extendEvent.scaleX[0].start;
        else this.scaleX = 1;
        if (this.extendEvent.scaleY.length > 0 && this.extendEvent.scaleY[0].startTime <= 0) this.scaleY = this.extendEvent.scaleY[0].start;
        else this.scaleY = 1;

        this.inclineSinr = NaN;
        this.color = NaN;

        if (this.sprite) {
            this.sprite.alpha = 1;
            this.sprite.angle = 0;
            this.sprite.scale.set(1);

            if (this.isText) {
                this.text = '';
            }
        }
    }

    sortEvent(_withEndTime = false) {
        this.eventLayers.forEach((eventLayer) => {
            eventLayer.sort();
        });

        for (const name in this.extendEvent) {
            (this.extendEvent as any)[name].sort((a: any, b: any) => a.startTime - b.startTime);
        }

        for (const name in this.eventLayers[0]) {
            if (name == 'speed' || !(((this.eventLayers[0]) as any)[name] instanceof Array)) continue;
            if (((this.eventLayers[0]) as any)[name].length <= 0) continue;
            if (((this.eventLayers[0]) as any)[name][0].startTime <= 0) continue;
            ((this.eventLayers[0]) as any)[name].unshift({
                startTime: 1 - 100,
                endTime: ((this.eventLayers[0]) as any)[name][0].startTime,
                start: 0,
                end: 0
            });
        }

        for (const name in this.noteControls) {
            (this.noteControls as any)[name].sort((a: any, b: any) => b.y - a.y);
        }
    }

    calcFloorPosition() {
        if (this.eventLayers.length <= 0) throw new Error('No event layer in this judgeline');

        let noSpeedEventsLayerCount = 0;
        this.eventLayers.forEach((eventLayer) => {
            eventLayer.speed.events = utils.arrangeSameSingleValueEvent(eventLayer.speed.events);
            if (eventLayer.speed.events.length < 1) noSpeedEventsLayerCount++;
        });

        if (noSpeedEventsLayerCount == this.eventLayers.length) {
            console.warn('Line ' + this.id + ' don\'t have any speed event, use default speed.');
            this.eventLayers[0].speed.push({
                startTime: 0,
                endTime: 1e4,
                value: 1
            });
            console.log(this)
        }

        let sameTimeSpeedEventAlreadyExist: any = {};
        let currentFloorPosition = 0;
        let floorPositions: floorPositionEvent[] = [];

        this.floorPositions = [];

        this.eventLayers.forEach((eventLayer, eventLayerIndex) => {
            eventLayer.speed.events.forEach((event, eventIndex) => {
                event.endTime = eventLayer.speed.events[eventIndex + 1] ? eventLayer.speed.events[eventIndex + 1].startTime : 1e4;

                let eventTime = (event.startTime).toFixed(3);

                if (!sameTimeSpeedEventAlreadyExist[eventTime]) {
                    floorPositions.push({
                        startTime: event.startTime,
                        endTime: NaN,
                        floorPosition: NaN
                    });
                }

                sameTimeSpeedEventAlreadyExist[eventTime] = true;
            });

            if (eventLayerIndex === 0 && eventLayer.speed.events[0].startTime > 0) {
                eventLayer.speed.events.unshift({
                    startTime: 1 - 100,
                    endTime: eventLayer.speed.events[0] ? eventLayer.speed.events[0].startTime : 1e4,
                    value: eventLayer.speed.events[0] ? eventLayer.speed.events[0].value : 1
                });
            }
        });

        floorPositions.sort((a, b) => a.startTime - b.startTime);

        floorPositions.unshift({
            startTime: 1 - 1000,
            endTime: floorPositions[0] ? floorPositions[0].startTime : 1e4,
            floorPosition: 1 - 1000
        });
        currentFloorPosition += floorPositions[0].endTime;

        for (let floorPositionIndex = 1; floorPositionIndex < floorPositions.length; floorPositionIndex++) {
            let currentEvent = floorPositions[floorPositionIndex];
            let nextEvent = floorPositionIndex < floorPositions.length - 1 ? floorPositions[floorPositionIndex + 1] : { startTime: 1e4 };
            let currentTime = currentEvent.startTime;

            floorPositions[floorPositionIndex].floorPosition = currentFloorPosition;
            floorPositions[floorPositionIndex].endTime = nextEvent.startTime;

            currentFloorPosition += (nextEvent.startTime - currentEvent.startTime) * this._calcSpeedValue(currentTime);
        }

        this.floorPositions = floorPositions;
    }

    getFloorPosition(time: number) {
        if (this.floorPositions.length <= 0) throw new Error('No floorPosition created, please call calcFloorPosition() first');

        let result: any = {};

        for (const floorPosition of this.floorPositions) {
            if (floorPosition.endTime < time) continue;
            if (floorPosition.startTime > time) break;

            result.startTime = floorPosition.startTime;
            result.endTime = floorPosition.endTime;
            result.floorPosition = floorPosition.floorPosition;
        }

        result.value = this._calcSpeedValue(time);

        return result;
    }

    _calcSpeedValue(time: number) {
        let result = 0;

        this.eventLayers.forEach((eventLayer) => {
            let currentValue = 0;

            for (const event of eventLayer.speed.events) {
                if (event.endTime < time) continue;
                if (event.startTime > time) break;
                currentValue = event.value!;
            }

            result += currentValue;
        });

        return result;
    }

    async createSprite(texture: PhiAssets, zipFiles: ResourceManager, rp = "") {
        this.textureName = undefined
        if (!this.isText) {
            this.textureName = this.texture
            let tex
            if (this.texture) {

                tex = zipFiles.get(rp + "/" + this.texture) as Texture
                if (tex) {
                    if ((this.texture as string).endsWith("gif")) {
                        this.sprite = AnimatedGIF.fromBuffer(await zipFiles.srcFiles[rp + "/" + this.texture]!.async("arraybuffer"));
                        (this.sprite as AnimatedGIF).play();
                    } else {
                        this.sprite = new Sprite(tex);
                    }
                } else {
                    chart_log.warn(`ID为${this.id}的判定线的材质获取失败，名称 ${this.texture} 完整路径 ${rp + "/" + this.texture}`)
                    tex = texture.judgeLine
                    this.sprite = new Sprite(tex);
                }
            } else {
                tex = texture.judgeLine
                this.sprite = new Sprite(tex);
            }


            if (this.texture) {
                this.baseScaleX = this.baseScaleY = 1;
            }
        }
        else {
            this.spriteStyle = new TextStyle({
                fontFamily: font.InGameFontName,
                align: 'center',
                fill: 0xFFFFFF
            })
            this.sprite = new Text({
                text: "", style: this.spriteStyle
            });
            (this.sprite as Text).resolution = TEXT_RESOLUTION
        }

        this.sprite.anchor.set(0.5);
        this.sprite.alpha = 1;

        if (this.extendEvent.scaleX.length > 0 && this.extendEvent.scaleX[0].startTime <= 0) {
            this.scaleX = this.extendEvent.scaleX[0].start;
        }
        if (this.extendEvent.scaleY.length > 0 && this.extendEvent.scaleY[0].startTime <= 0) {
            this.scaleY = this.extendEvent.scaleY[0].start;
        }
        return this.sprite;
    }

    calcTime(currentTime: number, size: SizerData) {
        this.speed = 0;
        this.x = 0;
        this.y = 0;
        this.alpha = 0;
        this.deg = 0;
        let calcTextureSize = false
        let __: {
            alpha: boolean;
            x: boolean;
            y: boolean;
            rotate: boolean;
        }[] = []
        for (let i = 0, length = this.eventLayers.length; i < length; i++) {
            let eventLayer = this.eventLayers[i];
            __.push(eventLayer.calcTime(currentTime))
        }
        for (let i = 0, length = this.eventLayers.length; i < length; i++) {
            let eventLayer = this.eventLayers[i];
            eventLayer.calcTime(currentTime);

            this.speed += eventLayer._speed;
            if (__[i].x) this.x += eventLayer._posX;
            if (__[i].y) this.y += eventLayer._posY;
            if (__[i].alpha) this.alpha += eventLayer._alpha;
            if (__[i].rotate) this.deg += eventLayer._rotate;
        }


        for (let i = 0, length = this.floorPositions.length; i < length; i++) {
            let event = this.floorPositions[i];
            if (event.endTime < currentTime) continue;
            if (event.startTime > currentTime) break;

            this.floorPosition = (currentTime - event.startTime) * this.speed + event.floorPosition;
        };

        for (let i = 0, length = this.extendEvent.scaleX.length; i < length; i++) {
            let event = this.extendEvent.scaleX[i];
            if (event.endTime < currentTime) continue;
            if (event.startTime > currentTime) break;

            let timePercentEnd = (currentTime - event.startTime) / (event.endTime - event.startTime);
            let timePercentStart = 1 - timePercentEnd;

            this.scaleX = event.start * timePercentStart + event.end * timePercentEnd;
            calcTextureSize = true
        }

        for (let i = 0, length = this.extendEvent.scaleY.length; i < length; i++) {
            let event = this.extendEvent.scaleY[i];
            if (event.endTime < currentTime) continue;
            if (event.startTime > currentTime) break;

            let timePercentEnd = (currentTime - event.startTime) / (event.endTime - event.startTime);
            let timePercentStart = 1 - timePercentEnd;

            this.scaleY = event.start * timePercentStart + event.end * timePercentEnd;
            calcTextureSize = true
        }

        for (let i = 0, length = this.extendEvent.text.length; i < length; i++) {
            let event = this.extendEvent.text[i];
            if (event.endTime < currentTime) continue;
            if (event.startTime > currentTime) break;

            this.text = event.value;
            (this.sprite as Text).text = event.value
        }

        for (let i = 0, length = this.extendEvent.color.length; i < length; i++) {
            let event = this.extendEvent.color[i];
            if (event.endTime < currentTime) continue;
            if (event.startTime > currentTime) break;
            //if (!this.wasBlack && !this.isText && calcGray(event.value) >= 0.98) {
            //    this.sprite.tint = 0xFFFFFF
            //    this.toBlack()
            //    break
            //}
            this.color = event.value
            this.sprite.tint = event.value;
        }

        for (let i = 0, length = this.extendEvent.incline.length; i < length; i++) {
            let event = this.extendEvent.incline[i];
            if (event.endTime < currentTime) continue;
            if (event.startTime > currentTime) break;

            let timePercentEnd = (currentTime - event.startTime) / (event.endTime - event.startTime);
            let timePercentStart = 1 - timePercentEnd;

            this.inclineSinr = Math.sin(event.start * timePercentStart + event.end * timePercentEnd);
        }

        if (this.textureName != null) {
            if (!(this.sprite instanceof Text)) {
                let texsize = conimgsize(
                    this.sprite.texture.width,
                    this.sprite.texture.height,
                    size.width,
                    size.height
                );
                this.sprite.scale.set(
                    (texsize[0] / this.sprite.texture.width) * this.scaleX,
                    (texsize[1] / this.sprite.texture.height) * this.scaleY
                )
            }
        } else if (this.isText) {
            this.spriteStyle!.fontSize = (size.width + size.height) / 75 * 1.35
            this.sprite.scale.x = this.scaleX * this.baseScaleX;
            this.sprite.scale.y = this.scaleY * this.baseScaleY;
        } else {
            this.sprite.scale.x = this.scaleX * this.baseScaleX;
            this.sprite.scale.y = this.scaleY * this.baseScaleY;
        }

        this.cosr = Math.cos(this.deg);
        this.sinr = Math.sin(this.deg);

        if (this.parentLine) {
            let newPosX = (this.x * this.parentLine.cosr + this.y * this.parentLine.sinr) * 0.918554 + this.parentLine.x,
                newPosY = (this.y * this.parentLine.cosr - this.x * this.parentLine.sinr) * 1.088662 + this.parentLine.y;

            this.x = newPosX;
            this.y = newPosY;
        }

        this.sprite.position.x = (this.x + 0.5) * size.width;
        this.sprite.position.y = (0.5 - this.y) * size.height;
        this.sprite.alpha = this.alpha >= 0 ? this.alpha : 0;
        this.sprite.rotation = this.deg;
        this.sprite.visible = (this.alpha > 0);
    }

    calcNoteControl(y: number, valueType: string, defaultValue: number) {
        for (let i = 0, length = (this.noteControls as any)[valueType].length; i < length; i++) {
            if ((this.noteControls as any)[valueType][i].y < y) return (this.noteControls as any)[valueType][i - 1].value;
        }
        return defaultValue;
    }
    setColor(color: number, judge: boolean = true) {
        if (!judge) {
            this.sprite.tint = color
        } else if (this.extendEvent.color.length == 0 && !this.isText && this.textureName == undefined) {
            this.sprite.tint = color
        }
    }

    exportToJson() {
        let eventlayers: jsonEventLayer[] = []
        for (let el of this.eventLayers) {
            eventlayers.push(el.exportToJson())
        }
        let judgeLine: jsonJudgeLineData = {
            id: this.id,
            texture: this.textureName!,
            isText: this.isText,
            parentLine: this.parentLine != null ? this.parentLine.id : undefined!,
            zIndex: this.zIndex,
            isCover: this.isCover,
            useOfficialScale: this.useOfficialScale,
            text: this.text!,
            eventLayers: eventlayers,
            floorPositions: this.floorPositions,
            extendEvent: this.extendEvent,
            noteControls: this.noteControls,
            attachUI: this.attachUI!
        }
        return judgeLine
    }

    static from(data: jsonJudgeLineData) {
        let jl = new Judgeline(data)
        jl.id = data.id
        jl.texture = data.texture
        jl.isText = data.isText
        jl.parentLine = data.parentLine as any
        jl.zIndex = data.zIndex
        jl.isCover = data.isCover
        jl.useOfficialScale = data.useOfficialScale
        jl.text = data.text
        let evls = []
        for (let d of data.eventLayers) {
            evls.push(EventLayer.from(d))
        }
        jl.eventLayers = evls
        jl.floorPositions = data.floorPositions
        jl.extendEvent = data.extendEvent
        jl.noteControls = data.noteControls
        jl.attachUI = data.attachUI
        jl.reset()
        return jl
    }

}

function calcGray(v: number[]) {
    const R = v[0]
    const G = v[1]
    const B = v[2]
    let g1 = R * 0.3 + G * 0.59 + B * 0.11
    let g2 = (R * 30 + G * 59 + B * 11) / 100
    let g3 = (R * 28 + G * 151 + B * 77) >> 8;
    let g4 = (R + G + B) / 3;
    return (g1 + g2 + g3 + g4) / 4 / 255
}