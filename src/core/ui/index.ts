import { SizerData } from '../types/params';
import Chart from '../chart';
import { UIElement, attachUI } from './element';
import Game from '../game';
import { Container, Graphics, Sprite } from 'pixi.js';

export default class UIManger {
    private chart: Chart
    public element: {
        Pause: UIElement,
        ComboNumber: UIElement,
        Combo: UIElement,
        Score: UIElement,
        Name: UIElement,
        Level: UIElement,
    }
    private game: Game
    private size?: SizerData
    private PauseBtnLastClickCount: number = 0
    private PauseBtnLastClickTime: number = 0
    public backgroundContainer: Container = new Container()
    public backgrounds: {
        big: Sprite, small: Sprite, bigCover: Graphics, smallCover: Graphics
    } = {
            big: new Sprite(), small: new Sprite(), bigCover: new Graphics(), smallCover: new Graphics()
        }
    constructor(game: Game) {
        let chart = game.chart
        this.chart = game.chart
        this.game = game
        this.reset();
        this.chart
        let hasAttachUIJL: { [key: string]: UIElement } = {}
        chart.othersJudgeLine.forEach((judgeline) => {
            hasAttachUIJL[judgeline.attachUI!] = UIElement.from(judgeline, this)
        });
        this.element = {
            Pause: hasAttachUIJL['pause'] ? hasAttachUIJL['pause'] : UIElement.from(attachUI.Pause, this),
            ComboNumber: hasAttachUIJL['combonumber'] ? hasAttachUIJL['combonumber'] : UIElement.from(attachUI.ComboNumber, this),
            Combo: hasAttachUIJL['combo'] ? hasAttachUIJL['combo'] : UIElement.from(attachUI.Combo, this),
            Score: hasAttachUIJL['score'] ? hasAttachUIJL['score'] : UIElement.from(attachUI.Score, this),
            Name: hasAttachUIJL['name'] ? hasAttachUIJL['name'] : UIElement.from(attachUI.Name, this),
            Level: hasAttachUIJL['level'] ? hasAttachUIJL['level'] : UIElement.from(attachUI.Level, this)
        }
        this.backgrounds.big.texture = game.chart.bg
        this.backgrounds.small.texture = game.chart.bg
        this.backgrounds.bigCover.rect(0, 0, this.backgrounds.small.texture.width, this.backgrounds.small.texture.height).fill({ color: 0x000 })
        this.backgrounds.smallCover.rect(0, 0, this.backgrounds.small.texture.width, this.backgrounds.small.texture.height).fill({ color: 0x000 })
    }
    reset() { }
    createSprites() {
        let stage = this.game.renders.UIContainer
        this.element.Combo.create()
        this.element.ComboNumber.create()
        this.element.Score.create()
        this.element.Name.create()
        this.element.Level.create()
        this.element.Pause.create()
        stage.addChild(this.element.Combo.sprite)
        stage.addChild(this.element.ComboNumber.sprite)
        stage.addChild(this.element.Score.sprite)
        stage.addChild(this.element.Name.sprite)
        stage.addChild(this.element.Level.sprite)
        stage.addChild(this.element.Pause.sprite)
        this.element.Pause.sprite.on("pointerdown", () => {
            this.pauseBtnClickCallBack()
        })
        this.backgrounds.big.zIndex = -8
        this.backgrounds.bigCover.zIndex = -7
        this.backgrounds.small.zIndex = -6
        this.backgrounds.smallCover.zIndex = -5
        this.game.render.stage.addChild(this.backgroundContainer)
        this.backgroundContainer.addChild(this.backgrounds.big)
        this.game.renders.gameContainer.addChild(this.backgrounds.small)
        this.backgroundContainer.addChild(this.backgrounds.bigCover)
        this.game.renders.gameContainer.addChild(this.backgrounds.smallCover)
        this.backgrounds.smallCover.alpha = 1 - this.game._settings.bgDim
        this.backgrounds.bigCover.alpha = 0.6
    }
    resizeSprites(size: SizerData, _isEnded: boolean) {
        this.size = size
        this.element.Combo.resize(size)
        this.element.ComboNumber.resize(size)
        this.element.Score.resize(size)
        this.element.Name.resize(size)
        this.element.Level.resize(size)
        this.element.Pause.resize(size)
        this.backgroundContainer.x = 0
        this.backgroundContainer.y = 0
        this.backgrounds.big.position.set(0, 0)
        this.backgrounds.small.position.set(0, 0)
        this.backgrounds.smallCover.position.set(0, 0)
        if (this.game.chart.bg) {
            let bgScaleWidth = size.width / this.backgrounds.small.texture.width;
            let bgScaleHeight = size.height / this.backgrounds.small.texture.height;
            let bgScale = bgScaleWidth > bgScaleHeight ? bgScaleWidth : bgScaleHeight;
            this.backgrounds.small.scale.set(bgScale);
            this.backgrounds.smallCover.scale.set(bgScale);
            this.backgrounds.small.visible = true
            this.backgrounds.smallCover.visible = true
            if (size.widerScreen) {
                let bgScaleWidth = this.game.render.screen.width / this.backgrounds.small.texture.width;
                let bgScaleHeight = this.game.render.screen.height / this.backgrounds.small.texture.height;
                let bgScale = bgScaleWidth > bgScaleHeight ? bgScaleWidth : bgScaleHeight;

                this.backgrounds.big.scale.set(bgScale);
                this.backgrounds.bigCover.scale.set(bgScale);
                this.backgrounds.big.visible = true
                this.backgrounds.bigCover.visible = true
            }
            else {
                this.backgrounds.big.visible = false
                this.backgrounds.bigCover.visible = false
            }
        }else{
            this.backgrounds.small.visible = false
            this.backgrounds.smallCover.visible = false
            this.backgrounds.big.visible = false
            this.backgrounds.bigCover.visible = false

        }
    }
    destroySprites() { }
    calcTime(currentTime:number) {
        if (!this.game._isPaused) {
            this.element.Combo.calcTime(currentTime, this.size!)
            this.element.ComboNumber.calcTime(currentTime, this.size!)
            this.element.Score.calcTime(currentTime, this.size!)
            this.element.Name.calcTime(currentTime, this.size!)
            this.element.Level.calcTime(currentTime, this.size!)
            this.element.Pause.calcTime(currentTime, this.size!)
            {
                if ((+this.game.judgement.score.text.combo) > 2) {
                    this.element.ComboNumber.setText(this.game.judgement.score.text.combo)
                    this.element.Combo.setText(this.game._settings.autoPlay ? "AUTOPLAY" : "COMBO")
                } else {
                    this.element.ComboNumber.setText(' ')
                    this.element.Combo.setText(' ')
                }


            }

            this.element.Score.setText(this.game.judgement.score.text.score)
            this.element.Name.setText(this.chart.info.name)
            this.element.Level.setText(this.chart.info.difficult)
        }
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
    calcAni(size: SizerData,isStart:boolean,progress:number){
        this.element.Combo.calcAni(size,isStart,progress)
        this.element.ComboNumber.calcAni(size,isStart,progress)
        this.element.Level.calcAni(size,isStart,progress)
        this.element.Name.calcAni(size,isStart,progress)
        this.element.Pause.calcAni(size,isStart,progress)
        this.element.Score.calcAni(size,isStart,progress)
    }
}