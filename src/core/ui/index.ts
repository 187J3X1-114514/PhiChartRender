import type { SizerData } from '../types/params';
import Chart from '../chart';
import { UIElement } from './element';
import PhiGame from '../game';
import { Container, Graphics, Sprite } from 'pixi.js';
import { defaultUISettings } from './settings';
import { attachUI, type UISettings, type UIElementSettings, baseUIManager } from "../types/ui"
import { pauseButton } from './tex';
export default class UIManager implements baseUIManager {
    private chart: Chart
    public element: {
        Pause: UIElement,
        ComboNumber: UIElement,
        Combo: UIElement,
        Score: UIElement,
        Name: UIElement,
        Level: UIElement,
        Bar: UIElement
    }
    private game: PhiGame
    private size?: SizerData
    private PauseBtnLastClickCount: number = 0
    private PauseBtnLastClickTime: number = 0
    private PauseBtnOutLine: Graphics = new Graphics()
    private settings: UISettings
    public backgroundContainer: Container = new Container()
    public backgrounds: {
        big: Sprite, small: Sprite, bigCover: Graphics, smallCover: Graphics
    } = {
            big: new Sprite(), small: new Sprite(), bigCover: new Graphics(), smallCover: new Graphics()
        }
    constructor(game: PhiGame, settings: UISettings = defaultUISettings) {
        let chart = game.chart
        this.chart = game.chart
        this.game = game
        this.reset();
        this.settings = settings
        let hasAttachUIJL: { [key: string]: UIElement } = {}
        chart.uiControls.forEach((judgeline) => {
            hasAttachUIJL[judgeline.attachUI!] = UIElement.from(judgeline, this)
        });
        this.element = {
            Pause: hasAttachUIJL['pause'] ? hasAttachUIJL['pause'] : UIElement.from(attachUI.Pause, this),
            ComboNumber: hasAttachUIJL['combonumber'] ? hasAttachUIJL['combonumber'] : UIElement.from(attachUI.ComboNumber, this),
            Combo: hasAttachUIJL['combo'] ? hasAttachUIJL['combo'] : UIElement.from(attachUI.Combo, this),
            Score: hasAttachUIJL['score'] ? hasAttachUIJL['score'] : UIElement.from(attachUI.Score, this),
            Name: hasAttachUIJL['name'] ? hasAttachUIJL['name'] : UIElement.from(attachUI.Name, this),
            Level: hasAttachUIJL['level'] ? hasAttachUIJL['level'] : UIElement.from(attachUI.Level, this),
            Bar: hasAttachUIJL['bar'] ? hasAttachUIJL['bar'] : UIElement.from(attachUI.Bar, this)
        }
        this.backgrounds.big.texture = game.chart.bg
        this.backgrounds.small.texture = game.chart.bg
        this.backgrounds.bigCover.rect(0, 0, this.backgrounds.small.texture.width, this.backgrounds.small.texture.height).fill({ color: 0x000 })
        this.backgrounds.smallCover.rect(0, 0, this.backgrounds.small.texture.width, this.backgrounds.small.texture.height).fill({ color: 0x000 })
    }
    reset() {
        //this.element?.Combo?.setText(' ',true)
        //this.element?.ComboNumber?.setText(' ',true)
        //this.element?.Score?.setText(' ',true)
    }
    createElement() {
        this.element.Combo.create()
        this.element.ComboNumber.create()
        this.element.Score.create()
        this.element.Name.create()
        this.element.Level.create()
        this.element.Pause.create()
        this.element.Bar.create()
        this.game.app.canvas.addEventListener("pointerdown", (e: any) => {
            if (e.clientX - this.size!.widthOffset < 70) {
                if (e.clientY < 70) {
                    this.pauseBtnClickCallBack()
                }
            }
        })
    }
    addToScreen() {
        let stage = this.game.container.UIContainer
        stage.addChild(this.element.Combo.sprite)
        stage.addChild(this.element.ComboNumber.sprite)
        stage.addChild(this.element.Score.sprite)
        stage.addChild(this.element.Name.sprite)
        stage.addChild(this.element.Level.sprite)
        stage.addChild(this.element.Pause.sprite)
        stage.addChild(this.element.Bar.sprite)
        stage.addChild(this.PauseBtnOutLine)
    }
    createSprites() {
        this.createElement()
        this.addToScreen()
        this.backgrounds.big.zIndex = -8
        this.backgrounds.bigCover.zIndex = -7
        this.backgrounds.small.zIndex = -6
        this.backgrounds.smallCover.zIndex = -5
        this.game.rootContainer.addChild(this.backgroundContainer)
        this.backgroundContainer.addChild(this.backgrounds.big)
        this.game.container.gameContainer.addChild(this.backgrounds.small)
        this.backgroundContainer.addChild(this.backgrounds.bigCover)
        this.game.container.gameContainer.addChild(this.backgrounds.smallCover)
        this.backgrounds.smallCover.alpha = 1 - this.game.settings.bgDim
        this.backgrounds.bigCover.alpha = 0.6
        if (this.game.getAntialiasing().FXAA) this.PauseBtnOutLine.filters = this.game.getAntialiasing().FXAA!
    }
    resizeElement() {
        this.element.Combo.resize(this.size!)
        this.element.ComboNumber.resize(this.size!)
        this.element.Score.resize(this.size!)
        this.element.Name.resize(this.size!)
        this.element.Level.resize(this.size!)
        this.element.Pause.resize(this.size!)
        this.element.Bar.resize(this.size!)
    }
    resizeSprites(size: SizerData, _isEnded: boolean) {
        this.size = size
        this.resizeElement()

        this.backgroundContainer.x = 0
        this.backgroundContainer.y = 0
        this.backgrounds.big.position.set(0, 0)
        this.backgrounds.small.position.set(0, 0)
        this.backgrounds.smallCover.position.set(0, 0)
        if (this.game.chart.bg) {
            /*
            let bgScaleWidth = size.width / this.backgrounds.small.texture.width;
            let bgScaleHeight = size.height / this.backgrounds.small.texture.height;
            let bgScale = bgScaleWidth > bgScaleHeight ? bgScaleWidth : bgScaleHeight;
            this.backgrounds.small.scale.set(bgScale);
            this.backgrounds.smallCover.scale.set(bgScale);
            this.backgrounds.small.visible = true
            this.backgrounds.smallCover.visible = true
            */

            let bgScaleWidth = this.game.app.renderer.screen.width / this.backgrounds.small.texture.width;
            let bgScaleHeight = this.game.app.renderer.screen.height / this.backgrounds.small.texture.height;
            let bgScale = bgScaleWidth > bgScaleHeight ? bgScaleWidth : bgScaleHeight;

            this.backgrounds.big.scale.set(bgScale);
            this.backgrounds.bigCover.scale.set(bgScale);
            this.backgrounds.big.visible = true
            this.backgrounds.bigCover.visible = true
            this.backgrounds.small.scale.set(bgScale);
            this.backgrounds.smallCover.scale.set(bgScale);
            this.backgrounds.small.visible = true
            this.backgrounds.smallCover.visible = true
            this.backgrounds.small.position.set(-size.widthOffset, 0)
            this.backgrounds.smallCover.position.set(-size.widthOffset, 0)

        } else {
            this.backgrounds.small.visible = false
            this.backgrounds.smallCover.visible = false
            this.backgrounds.big.visible = false
            this.backgrounds.bigCover.visible = false

        }
    }
    destroy() {
        this.element.Combo.destroy()
        this.element.ComboNumber.destroy()
        this.element.Score.destroy()
        this.element.Name.destroy()
        this.element.Level.destroy()
        this.element.Pause.destroy()
        this.element.Bar.destroy()
    }
    calcTime(currentTime: number) {
        this.calcOtherAni()
        this.drawPauseBtnOutLine()
        this.element.Combo.calcTime(currentTime, this.size!)
        this.element.ComboNumber.calcTime(currentTime, this.size!)
        this.element.Score.calcTime(currentTime, this.size!)
        this.element.Name.calcTime(currentTime, this.size!)
        this.element.Level.calcTime(currentTime, this.size!)
        this.element.Pause.calcTime(currentTime, this.size!)
        this.element.Bar.calcTime(currentTime, this.size!)
        {
            if ((+this.game.judgement.score.text.combo) > 2) {
                this.element.ComboNumber.setText(this.game.judgement.score.text.combo)
                this.element.Combo.setText(this.game.settings.autoPlay ? "AUTOPLAY" : "COMBO")
            } else {
                this.element.ComboNumber.setText(' ')
                this.element.Combo.setText(' ')
            }
        }

        this.element.Score.setText(this.game.judgement.score.text.score)
        this.element.Name.setText(this.chart.info.name)
        this.element.Level.setText(this.chart.info.difficult)
    }
    private drawPauseBtnOutLine() {
        this.PauseBtnOutLine.clear()
        this.PauseBtnOutLine.x = this.element.Pause.sprite.x
        this.PauseBtnOutLine.y = this.element.Pause.sprite.y
        let p = 0
        if ((performance.now() - this.PauseBtnLastClickTime) <= 700) {
            p = 1 - ((performance.now() - this.PauseBtnLastClickTime) / 700)
        }
        if (p < 0) p = 0
        let alpha = 0.85 * p
        this.PauseBtnOutLine.circle(0, 0, this.element.Pause.sprite.width * 1.05)
        this.PauseBtnOutLine.fill({
            color: 0, alpha: 0.0
        })
        alpha *= this.element.Pause.alpha
        this.PauseBtnOutLine.stroke({ width: this.size!.lineHeightScale * 3 * 0.6, color: 0xA9A9A9, alpha: alpha });


    }
    private pauseBtnClickCallBack() {

        if (performance.now() - this.PauseBtnLastClickTime <= 300) {
            this.PauseBtnLastClickCount++
        } else {
            this.PauseBtnLastClickCount = 0
        }
        this.PauseBtnLastClickTime = performance.now()
        if (this.PauseBtnLastClickCount >= 1) {
            this.PauseBtnLastClickCount = 0
            this.game.pause()
        }

    }
    calcAni(size: SizerData, isStart: boolean, progress: number) {
        this.element.Combo.calcTime(0, size)
        this.element.Score.calcTime(0, size)
        this.element.Pause.calcTime(0, size)
        this.element.Name.calcTime(0, size)
        this.element.Level.calcTime(0, size)
        this.element.ComboNumber.calcTime(0, size)
        this.element.Bar.calcTime(0, size)
        if (isStart) {
            this.setUIAniOffsetY(-((uiFadeInFn(progress * 1.1) * 120) - 120))
        } else {
            this.setUIAniOffsetY(((uiFadeOutFn(progress * 1.1) * 120)))
        }
    }

    setUIAniOffsetY(offset: number) {
        this.element.Combo.sprite.y = this.element.Combo.y - offset
        this.element.ComboNumber.sprite.y = this.element.ComboNumber.y - offset
        this.element.Score.sprite.y = this.element.Score.y - offset
        this.element.Pause.sprite.y = this.element.Pause.y - offset

        this.element.Name.sprite.y = this.element.Name.y + offset
        this.element.Level.sprite.y = this.element.Level.y + offset
        this.element.Bar.sprite.y = this.element.Bar.y - offset
    }

    calcOtherAni() {

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
            case attachUI.Bar:
                ox = 0
                oy = 0
                sx = 1
                sy = 1
                x = 0
                y = 0
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
    getGameProgress(): number {
        return this.game.currentTime / this.game.chart.music.duration
    }
}

function uiFadeInFn(x: number) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function uiFadeOutFn(x: number): number {
    return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
}