import type { SizerData } from '../types/params';
import { UIElement } from './element';
import { defaultUISettings } from './settings';
import { Container } from 'pixi.js';
import { attachUI, type UISettings, type UIElementSettings, baseUIManager } from "../types/ui"

export default class debugUIManger implements baseUIManager {
    public element: {
        Pause: UIElement,
        ComboNumber: UIElement,
        Combo: UIElement,
        Score: UIElement,
        Name: UIElement,
        Level: UIElement,
    }
    private stage: Container
    private size: SizerData = undefined as any
    public settings: UISettings
    constructor(stage: Container, settings: UISettings = defaultUISettings) {
        this.stage = stage
        this.reset();
        this.settings = settings

        this.element = {
            Pause: UIElement.from(attachUI.Pause, this),
            ComboNumber: UIElement.from(attachUI.ComboNumber, this),
            Combo: UIElement.from(attachUI.Combo, this),
            Score: UIElement.from(attachUI.Score, this),
            Name: UIElement.from(attachUI.Name, this),
            Level: UIElement.from(attachUI.Level, this)
        }
    }
    getGameProgress(): number {
        return 0.5
    }
    reset() { }
    createSprites() {
        this.element.Combo.create()
        this.element.ComboNumber.create()
        this.element.Score.create()
        this.element.Name.create()
        this.element.Level.create()
        this.element.Pause.create()
        this.stage.addChild(this.element.Combo.sprite)
        this.stage.addChild(this.element.ComboNumber.sprite)
        this.stage.addChild(this.element.Score.sprite)
        this.stage.addChild(this.element.Name.sprite)
        this.stage.addChild(this.element.Level.sprite)
        this.stage.addChild(this.element.Pause.sprite)
    }
    resizeSprites(size: SizerData, _isEnded: boolean) {
        this.size = size
        this.element.Combo.resize(size)
        this.element.ComboNumber.resize(size)
        this.element.Score.resize(size)
        this.element.Name.resize(size)
        this.element.Level.resize(size)
        this.element.Pause.resize(size)
    }
    getUIElementSettings(type: attachUI) {
        let ox = 0
        let oy = 0
        let sx = 0
        let sy = 0
        let x = 0
        let y = 0
        switch (type) {
            case attachUI.Pause:
                ox = this.settings.offset.x.Pause
                oy = this.settings.offset.y.Pause
                sx = this.settings.scale.Pause
                sy = this.settings.scale.Pause
                x = this.settings.pos.x.Pause
                y = this.settings.pos.y.Pause
                break
            case attachUI.ComboNumber:
                ox = this.settings.offset.x.ComboNumber
                oy = this.settings.offset.y.ComboNumber
                sx = this.settings.scale.ComboNumber
                sy = this.settings.scale.ComboNumber
                x = this.settings.pos.x.ComboNumber
                y = this.settings.pos.y.ComboNumber
                break
            case attachUI.Combo:
                ox = this.settings.offset.x.Combo
                oy = this.settings.offset.y.Combo
                sx = this.settings.scale.Combo
                sy = this.settings.scale.Combo
                x = this.settings.pos.x.Combo
                y = this.settings.pos.y.Combo
                break
            case attachUI.Score:
                ox = this.settings.offset.x.Score
                oy = this.settings.offset.y.Score
                sx = this.settings.scale.Score
                sy = this.settings.scale.Score
                x = this.settings.pos.x.Score
                y = this.settings.pos.y.Score
                break
            case attachUI.Name:
                ox = this.settings.offset.x.Name
                oy = this.settings.offset.y.Name
                sx = this.settings.scale.Name
                sy = this.settings.scale.Name
                x = this.settings.pos.x.Name
                y = this.settings.pos.y.Name
                break
            case attachUI.Level:
                ox = this.settings.offset.x.Level
                oy = this.settings.offset.y.Level
                sx = this.settings.scale.Level
                sy = this.settings.scale.Level
                x = this.settings.pos.x.Level
                y = this.settings.pos.y.Level
                break
        }
        return {
            offsetX: ox,
            offsetY: oy,
            scaleX: sx,
            scaleY: sy,
            X: x,
            Y: y
        } as UIElementSettings
    }
    calcTime(currentTime: number = 10) {
        this.element.Combo.calcTime(currentTime, this.size!)
        this.element.ComboNumber.calcTime(currentTime, this.size!)
        this.element.Score.calcTime(currentTime, this.size!)
        this.element.Name.calcTime(currentTime, this.size!)
        this.element.Level.calcTime(currentTime, this.size!)
        this.element.Pause.calcTime(currentTime, this.size!)
    }
}