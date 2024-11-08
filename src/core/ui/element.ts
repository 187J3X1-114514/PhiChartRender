import EventLayer from '../chart/eventlayer';
import * as font from '../font'
import type { Event, ValueEvent } from '../chart/anim/type';
import { Sprite, Text, TextStyle } from 'pixi.js';
import { type SizerData } from '../types/params';
import { pauseButton } from './tex';
import Judgeline from '../chart/judgeline';
import { attachUI, type UIElementSettings, baseUIManager } from "../types/ui"

export class UIElement {
    private eventLayers: EventLayer[];
    public sprite: Text | Sprite = new Sprite()
    private textStyle?: TextStyle
    private extendEvent: {
        color: ValueEvent[],
        scaleX: Event[],
        scaleY: Event[],
        text: ValueEvent[],
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
    public settings: UIElementSettings = undefined as any
    private uiManager: baseUIManager
    private constructor(type: attachUI, ui: baseUIManager) {
        this.eventLayers = []
        this.uiManager = ui
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
    static from(opt: Judgeline | attachUI, ui: baseUIManager): UIElement {
        let e
        if (!(opt instanceof Judgeline)) {
            e = new this(opt, ui)
            e.settings = ui.getUIElementSettings(opt)
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
            e.settings = ui.getUIElementSettings(type)
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
        this.updataSettings()
        let x = 0
        let y = 0
        this.text = undefined
        this.alpha = 1
        this.deg = 0
        this.scaleX = 1
        this.scaleY = 1
        if (this.hasEvent) {
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

            //__ = __.reverse()
            for (let i = 0, length = __.length; i < length; i++) {
                let eventLayer = this.eventLayers[i];
                if (__[i].x) x = (eventLayer._posX) * size.width;
                if (__[i].y) y = (eventLayer._posY) * size.height;
                if (__[i].alpha) this.alpha = eventLayer._alpha;
                if (__[i].rotate) this.deg = eventLayer._rotate;
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
        if (this.hasEvent) {
            if (this.isText && this.hasEvent) this.setText(this.text, true);
            this.sprite.scale.x = this.scaleX * this.baseScaleX
            this.sprite.scale.y = this.scaleY * this.baseScaleY
            this.sprite.position.x = this.x - x + this.offsetX
            this.sprite.position.y = this.y - y + this.offsetY
            this.sprite.alpha = this.text == undefined ? (this.alpha * this.baseAlpha) : 0
            this.sprite.rotation = this.deg
        } else {
            this.sprite.scale.x = this.baseScaleX
            this.sprite.scale.y = this.baseScaleY
            this.sprite.position.x = this.x + this.offsetX
            this.sprite.position.y = this.y + this.offsetY
            this.sprite.alpha = this.baseAlpha
            this.sprite.rotation = 0
        }


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
        this.updataSettings()
        switch (this.type) {
            case attachUI.ComboNumber:
                this.offsetX = 0
                this.offsetY = 0//-this.sprite.height / 2.2
                break
            case attachUI.Combo:
                this.offsetX = 0
                this.offsetY = 0//this.uiManger.element.ComboNumber.offsetY
                this.baseAlpha = 0.8
                break
            case attachUI.Score:
                this.offsetX = -this.sprite.width / 2
                this.offsetY = 0//this.uiManger.element.ComboNumber.offsetY
                break
            case attachUI.Name:
                this.offsetX = this.sprite.width / 2
                break
            case attachUI.Level:
                this.offsetX = -this.sprite.width / 2
                break
            case attachUI.Pause:
                this.offsetX = 0
                break
        }
        if (this.isText) {
            let sp = this.sprite as Text
            this.size = size.lineScale * 0.63 * this.settings.scaleX
            let maxSize = size.width / 2 - size.lineScale
            this.testCtx.font = `${this.size} ${font.InGameFontName}`
            let dx = this.testCtx.measureText(sp.text).width
            if (dx > maxSize) this.size = this.size / dx * maxSize

            switch (this.type) {
                case attachUI.ComboNumber:
                    this.x = size.width * this.settings.X
                    this.y = size.height * this.settings.Y
                    this.textStyle!.fontSize = size.baseFontSize * 1.1 * this.settings.scaleX + "px"
                    break
                case attachUI.Combo:
                    this.x = size.width * this.settings.X
                    this.y = size.height * this.settings.Y
                    this.textStyle!.fontSize = size.baseFontSize * 0.40 * this.settings.scaleX + "px"
                    break
                case attachUI.Score:
                    this.x = size.width - (size.width * this.settings.X)
                    this.y = size.height * this.settings.Y
                    this.textStyle!.fontSize = size.baseFontSize * 0.95 * this.settings.scaleX + "px"
                    break
                case attachUI.Name:
                    this.x = size.width * this.settings.X
                    this.y = size.height - (size.height * this.settings.Y)
                    this.textStyle!.fontSize = size.baseFontSize * 0.55 * this.settings.scaleX + "px"
                    break
                case attachUI.Level:
                    this.x = size.width - (size.width * this.settings.X)
                    this.y = size.height - (size.height * this.settings.Y)
                    this.textStyle!.fontSize = size.baseFontSize * 0.55 * this.settings.scaleX + "px"
                    break
            }
            this.baseScaleX = size.heightPercent
            this.baseScaleY = size.heightPercent
        } else {
            this.baseScaleX = size.heightPercent * this.settings.scaleX
            this.baseScaleY = size.heightPercent * this.settings.scaleY
            this.x = size.width * this.settings.X
            this.y = size.height * this.settings.Y
        }

    }
    /*
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
    }*/
    updataSettings() {
        this.settings = this.uiManager.getUIElementSettings(this.type)
    }
}
/*
function easeInOutCubic(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
function easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3);
}*/