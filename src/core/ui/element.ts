import EventLayer from '../chart/eventlayer';
import * as font from '../font'
import { Event, valueEvent } from '../chart/baseEvents';
import { Sprite, Text, TextStyle } from 'pixi.js';
import { SizerData } from '../types/params';
import { pauseButton } from './tex';
import Judgeline from '../chart/judgeline';
import UIManger from '.';

export enum attachUI {
    Pause,
    ComboNumber,
    Combo,
    Score,
    Name,
    Level,
}

export class UIElement {
    private eventLayers: EventLayer[];
    public sprite: Text | Sprite = new Sprite()
    private textStyle?: TextStyle
    private extendEvent: {
        color: valueEvent[],
        scaleX: Event[],
        scaleY: Event[],
        text: valueEvent[],
        incline: Event[]
    };
    private testCtx: CanvasRenderingContext2D
    public x: number = 0
    public y: number = 0
    public alpha: number = 1
    public deg: number = 0
    public scaleX: number = 1
    public scaleY: number = 1
    public size: number = 0
    public text?: string = undefined
    public isText: boolean = false
    public type: attachUI
    public baseScaleX: number = 1
    public baseScaleY: number = 1
    public hasEvent: boolean = false
    public offsetX: number = 0
    public offsetY: number = 0
    public baseAlpha: number = 1
    private uiManger: UIManger
    private constructor(type: attachUI, ui: UIManger) {
        this.eventLayers = []
        this.uiManger = ui
        this.extendEvent = {
            color: [],
            scaleX: [],
            scaleY: [],
            text: [],
            incline: []
        }
        this.type = type
        this.testCtx = (() => {
            let c = document.createElement("canvas")
            c.width = 4096
            c.height = 4096
            return c.getContext("2d")!
        })()
        this.isText = this.type == attachUI.Pause ? false : true
    }
    static from(opt: Judgeline | attachUI, ui: UIManger): UIElement {
        let e
        if (!(opt instanceof Judgeline)) {
            e = new this(opt, ui)
            e.hasEvent = false
        } else {
            let judgeLine = opt
            let type = attachUI.Pause
            switch (judgeLine.attachUI!) {
                case 'pause':
                    type = attachUI.Pause
                    break
                case 'combo':
                    type = attachUI.Combo
                    break
                case 'combonumber':
                    type = attachUI.ComboNumber
                    break
                case 'score':
                    type = attachUI.Score
                    break
                case 'name':
                    type = attachUI.Name
                    break
                case 'level':
                    type = attachUI.Level
                    break
            }
            e = new this(type, ui)
            e.hasEvent = true
            e.eventLayers = judgeLine.eventLayers
            e.extendEvent = { ...judgeLine.extendEvent }
            e.eventLayers.forEach((v) => {
                v.moveXOriginValue = 0
                v.moveYOriginValue = 0
                v.alphaOriginValue = 0
                v.rotateOriginValue = 0
            })
        }
        return e

    }
    create() {
        if (!this.isText) {
            this.sprite = new Sprite(pauseButton)
            this.sprite.eventMode = 'static';
            this.sprite.cursor = 'pointer';
        } else {
            let textAlign = "center"
            switch (this.type) {
                case attachUI.Score:
                    textAlign = "right"
                    break
                case attachUI.Name:
                    textAlign = "left"
                    break
                case attachUI.Level:
                    textAlign = "right"
                    break
            }
            this.textStyle = new TextStyle({
                fontFamily: font.InGameFontName,
                fill: 0xFFFFFF,
                align: textAlign as any
            })
            this.sprite = new Text({
                style: this.textStyle,
                text: ""
            })
        }
        this.sprite.zIndex = 114514
        this.sprite.anchor.set(0.5, 0.5)
    }

    calcTime(currentTime: number, size: SizerData) {
        let x = 0
        let y = 0
        this.text = undefined
        this.alpha = 1
        this.deg = 0
        this.scaleX = 1
        this.scaleY = 1
        if (this.hasEvent) {
            for (let i = 0, length = this.eventLayers.length; i < length; i++) {
                let eventLayer = this.eventLayers[i];
                eventLayer.calcTime(currentTime);

                x = (eventLayer._posX) * size.width;
                y = (eventLayer._posY) * size.height;
                this.alpha = eventLayer._alpha;
                this.deg = eventLayer._rotate;
            }

            for (let i = 0, length = this.extendEvent.scaleX.length; i < length; i++) {
                let event = this.extendEvent.scaleX[i];
                if (event.endTime < currentTime) continue;
                if (event.startTime > currentTime) break;

                let timePercentEnd = (currentTime - event.startTime) / (event.endTime - event.startTime);
                let timePercentStart = 1 - timePercentEnd;
                this.scaleX = event.start * timePercentStart + event.end * timePercentEnd;
            }

            for (let i = 0, length = this.extendEvent.scaleY.length; i < length; i++) {
                let event = this.extendEvent.scaleY[i];
                if (event.endTime < currentTime) continue;
                if (event.startTime > currentTime) break;

                let timePercentEnd = (currentTime - event.startTime) / (event.endTime - event.startTime);
                let timePercentStart = 1 - timePercentEnd;
                this.scaleY = event.start * timePercentStart + event.end * timePercentEnd;
            }

            for (let i = 0, length = this.extendEvent.text.length; i < length; i++) {
                let event = this.extendEvent.text[i];
                if (event.endTime < currentTime) continue;
                if (event.startTime > currentTime) break;
                this.text = event.value
            }

            for (let i = 0, length = this.extendEvent.color.length; i < length; i++) {
                let event = this.extendEvent.color[i];
                if (event.endTime < currentTime) continue;
                if (event.startTime > currentTime) break;
                this.sprite.tint = event.value;
            }
        }

        switch (this.type) {
            case attachUI.ComboNumber:
                this.offsetX = 0
                this.offsetY = -this.sprite.height / 2.2
                break
            case attachUI.Combo:
                this.offsetX = 0
                this.offsetY = this.uiManger.element.ComboNumber.offsetY
                break
            case attachUI.Score:
                this.offsetX = -this.sprite.width / 2
                this.offsetY = this.uiManger.element.ComboNumber.offsetY
                break
            case attachUI.Name:
                this.offsetX = this.sprite.width / 2
                break
            case attachUI.Level:
                this.offsetX = -this.sprite.width / 2
                break
            case attachUI.Pause:
                this.offsetX = 0//-this.sprite.width / 2
                break
        }
        if (this.isText && this.hasEvent) this.setText(this.text, true);
        this.sprite.scale.x = this.scaleX * this.baseScaleX
        this.sprite.scale.y = this.scaleY * this.baseScaleY
        this.sprite.position.x = this.x - x + this.offsetX
        this.sprite.position.y = this.y - y + this.offsetY
        this.sprite.alpha = this.text == undefined ? (this.alpha * this.baseAlpha) : 0
        this.sprite.rotation = this.deg

    }
    setText(v?: string, f: boolean = false) {
        if (this.isText && v) {
            if (f) {
                (this.sprite as Text).text = v
            } else if (this.text == undefined) {
                (this.sprite as Text).text = v
            }
        }
    }
    resize(size: SizerData) {
        if (this.isText) {
            let sp = this.sprite as Text
            this.size = size.lineScale * 0.63
            let maxSize = size.width / 2 - size.lineScale
            this.testCtx.font = `${this.size} ${font.InGameFontName}`
            let dx = this.testCtx.measureText(sp.text).width
            if (dx > maxSize) this.size = this.size / dx * maxSize

            switch (this.type) {
                case attachUI.ComboNumber:
                    this.x = size.width / 2
                    this.y = size.lineScale * 1.375
                    this.textStyle!.fontSize = size.baseFontSize * 1.1 + "px"
                    break
                case attachUI.Combo:
                    this.x = size.width / 2
                    this.y = size.lineScale * 2.08
                    this.textStyle!.fontSize = size.baseFontSize * 0.40 + "px"
                    break
                case attachUI.Score:
                    this.x = size.width - size.lineScale * 0.65
                    this.y = size.lineScale * 1.375
                    this.textStyle!.fontSize = size.baseFontSize * 0.95 + "px"
                    break
                case attachUI.Name:
                    this.x = size.lineScale * 0.65
                    this.y = size.height - size.lineScale * 0.66
                    this.textStyle!.fontSize = size.baseFontSize * 0.55 + "px"
                    break
                case attachUI.Level:
                    this.x = size.width - size.lineScale * 0.65
                    this.y = size.height - size.lineScale * 0.66
                    this.textStyle!.fontSize = size.baseFontSize * 0.55 + "px"
                    break
            }
            this.baseScaleX = size.heightPercent
            this.baseScaleY = size.heightPercent
        } else {
            let x = size.lineScale * 0.65 * 0.9
            let y = size.height * 0.0375
            this.baseScaleX = size.heightPercent * 0.8
            this.baseScaleY = size.heightPercent * 0.75
            this.x = x
            this.y = y
        }

    }
    calcAni(size: SizerData, isStart: boolean, progress: number) {
        this.calcTime(0, size)
        let isTop = this.type == attachUI.Pause || this.type == attachUI.Score || this.type == attachUI.Combo || this.type == attachUI.ComboNumber
        progress = Math.min(Math.max(progress, 0), 1)
        if (isStart) {
            let y = this.y + this.offsetY
            let offsetY1 = this.sprite.height
            let offsetY2 = easeInOutCubic(1 - progress) * offsetY1 * (isTop ? -1 : 1)
            let minY = isTop ? y - offsetY1 : y
            let maxY = isTop ? y : y + offsetY1
            this.sprite.y = Math.min(Math.max(y + offsetY2, minY), maxY)
        } else {
            let y = this.y + this.offsetY
            let offsetY2 = easeOutCubic(progress) * y * (isTop ? -3 : 3)
            this.sprite.y = (y + offsetY2)
        }
    }
}
function easeInOutCubic(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
function easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3);
}