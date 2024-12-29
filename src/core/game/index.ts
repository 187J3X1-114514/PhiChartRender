import * as verify from '../verify';
import Judgement from '../judgement';
import type { PhiAssets } from "../resource";
import { Container, Sprite, Graphics, Text, TextStyle, RenderTarget } from 'pixi.js';
import * as font from '../font'
import Chart from '../chart';
import type { GameParams, GameSettings, SizerData } from '../types/params';
import Audio from '../audio';
import { ResourceManager } from '../resource/resource_manager';
import { printImage } from '../utils';
import UIManager from '../ui';
import { PrprExtra } from '../prpr/prpr';
import { Antialiasing } from '../antialiasing';
import { DefaultShader } from '../prpr/effect/shader';
import { WebGLApplication } from '@/gl/WebGLApplication';
import { PixiGlRenderTarget } from '@/gl/PixiGlRenderTarget';

const uk = (undefined as unknown) as any
const ukObj = ({} as unknown) as any
export default class PhiGame {
    private fakeJudgeline: Sprite = new Sprite()
    chart: Chart = uk
    prprExtra: PrprExtra = uk
    resource: ResourceManager = uk
    private _animateStatus = NaN;
    private _gameStartTime = NaN;
    private _gameEndTime = NaN;
    public isPaused = false;
    public isEnded = false;
    public settings: GameSettings = uk
    public container = {
        mainContainer: new Container(),
        gameContainer: new Container(),
        UIContainer: new Container(),
        mainContainerCover: new Container(),
        videoContainer: new Container()
    }
    renders: {
        //mainContainer: Container
        //gameContainer: Container
        //UIContainer: Container
        mainContainerMask: Graphics
        //mainContainerCover: Container
        performanceInfoText: Text
        sizer: SizerData,
        bg: Sprite,
        performanceInfoTextStyle: TextStyle,
        //videoContainer: Container
    } = {
            ...ukObj, ...{
                mainContainer: new Container(),
                gameContainer: new Container(),
                UIContainer: new Container(),
                mainContainerMask: new Graphics(),
                mainContainerCover: new Sprite(),
                performanceInfoText: uk,
                sizer: ({} as any),
                bg: new Sprite(),
                pauseButton: new Sprite(),
                videoContainer: new Container()
            }
        }
    public app: WebGLApplication<HTMLCanvasElement> = uk
    public judgement: Judgement = uk
    private functions: any
    public assets: PhiAssets = uk
    private isFirst = true
    public musicStartTime: number = 0
    public ui: UIManager = uk
    public rootContainer = new Container()
    private _params: GameParams = uk
    private antialiasing: Antialiasing = uk
    public renderTarget: RenderTarget = uk
    public glRenderTarget: PixiGlRenderTarget = uk
    private CPUFrameTime: number = 0
    private JudgeLineFrameTime: number = 0
    private NoteFrameTime: number = 0
    private JudgeFrameTime: number = 0
    private OtherFrameTime: number = 0
    private GPUFrameTime: number = 0
    private FrameTime: number = 0
    private _currentTime: number = 0
    private async init(_params: GameParams) {
        if (_params.settings.noteScale) _params.settings.noteScale = 8080 / _params.settings.noteScale;
        (window as any).curPhiGame = this
        this._params = _params
        let params = { ..._params };
        if (!params.render) params.render = {};
        if (!params.settings) params.settings = {};
        this.settings = {
            resolution: verify.number(params.render.resolution, window.devicePixelRatio, 1),
            noteScale: verify.number(params.settings.noteScale, 8080),
            bgDim: verify.number(params.settings.bgDim, 0.5, 0, 1),
            offset: verify.number(params.settings.audioOffset, 0),
            speed: verify.number(params.settings.speed, 1, 0, 2),
            showPerformanceInfo: verify.bool(params.settings.showPerformanceInfo, true),
            showInputPoint: verify.bool(params.settings.showInputPoint, true),
            multiNoteHL: verify.bool(params.settings.multiNoteHL, true),
            showAPStatus: verify.bool(params.settings.showAPStatus, true),
            challengeMode: verify.bool(params.settings.challengeMode, false),
            autoPlay: verify.bool(params.settings.autoPlay, false),
            shader: verify.bool(params.settings.prprExtra, true),
            ...params.settings
        };
        this.assets = params.assets;
        this.resource = params.zipFiles || new ResourceManager();
        let chart
        try {
            chart = params.chart
            this.chart = chart.chart;
            this.chart.bg = chart.illustration
            this.chart.music = chart.music
        } catch (e) {
            if (!this.chart) {
                printImage(0.5, () => { throw new Error('不是哥们，你这铺有问题，' + e) })
            }
        }
        this.prprExtra = params.settings.prprExtra ? chart!.prpr as PrprExtra : PrprExtra.none;
        if (!this.chart) {
            printImage(0.5, () => { throw new Error('不是哥们，铺呢？') })
        }
        if (!this.assets) {
            printImage(0.5, () => { throw new Error('不是哥们，资源呢？') })
        }

        this.app = params.app
        this.container.mainContainer.zIndex = 10;
        this.rootContainer.addChild(this.container.mainContainer);
        this.container.gameContainer = new Container();
        this.container.gameContainer.zIndex = 20;
        this.container.mainContainer.addChild(this.container.gameContainer);
        this.container.UIContainer = new Container();
        this.container.UIContainer.zIndex = 30;
        this.container.mainContainer.addChild(this.container.UIContainer);
        this.container.UIContainer.visible = false
        this.container.videoContainer = new Container();
        this.container.videoContainer.zIndex = -1;
        this.container.gameContainer.addChild(this.container.videoContainer);
        this.renders.mainContainerMask = new Graphics();
        this.judgement = new Judgement({
            chart: this.chart,
            stage: this.container.gameContainer,
            canvas: this.app.canvas,
            assets: {
                textures: { normal: this.assets.hitFx, bad: this.assets.note.bad },
                sounds: this.assets.sound,

            },
            hitsound: verify.bool(params.settings.hitsound, true),
            hitsoundVolume: verify.number(params.settings.hitsoundVolume, 1, 0, 1),
            showAPStatus: verify.bool(params.settings.showAPStatus, true),
            challengeMode: verify.bool(params.settings.challengeMode, false),
            autoPlay: verify.bool(params.settings.autoPlay, false),
            game: this
        });
        this.functions = {
            start: [],
            tick: [],
            pause: [],
            end: []
        };
        this.renderTarget = new RenderTarget()
        this.antialiasing = new Antialiasing(this.app)
        await this.initRender()
        this.ui = new UIManager(this)
        this.ui.createSprites()
        this.ui.backgroundContainer.zIndex = 9999999
        this.prprExtra.setGame(this)
        this.prprExtra.init()
        this.chart.music.reset();
        this.chart.reset();
        this.judgement.reset();
        this.prprExtra.reset()
        this.resize = this.resize.bind(this);
        if (this.settings.speed < 0.25) throw new Error('Speed too slow');
        else if (this.settings.speed > 2) throw new Error('Speed too fast');
        this.resize(false);
        if (_params.render.resizeTo) _params.render.resizeTo.append(this.app.canvas as HTMLCanvasElement);
        (window as any).__PIXI_DEVTOOLS__ = {
            renderer: this.app.renderer,
            stage: this.rootContainer
        };

    }

    createSprites() {
        this.rootContainer.eventMode = "static"
        this.container.gameContainer.eventMode = "static"
        this.container.mainContainer.eventMode = "static"
        this.container.UIContainer.eventMode = "static"
        this.chart.createSprites(
            this.container.gameContainer,
            this.renders.sizer,
            this.assets,
            this.container.UIContainer,
            this.resource,
            this.settings.speed,
            this.settings.bgDim,
            this.settings.multiNoteHL
        );

        if (this.settings.showAPStatus) {
            for (const judgeline of this.chart.judgelines) {
                if (!judgeline.sprite) continue;
                judgeline.setColor(0xFFECA0, true)
            };
        }

        this.judgement.stage = this.container.UIContainer;
        this.judgement.createSprites(this.settings.showInputPoint);

        // 假判定线，过场动画用
        this.fakeJudgeline = new Sprite(this.assets.judgeLine);
        this.fakeJudgeline.visible = false
        this.fakeJudgeline.anchor.set(0.5);
        this.fakeJudgeline.zIndex = 999;
        this.fakeJudgeline.scale.y = this.renders.sizer.lineHeightScale
        if (this.settings.showAPStatus) this.fakeJudgeline.tint = 0xFFECA0;
        this.container.UIContainer.addChild(this.fakeJudgeline);

        if (this.settings.showPerformanceInfo) {
            this.renders.performanceInfoTextStyle = new TextStyle({
                fontFamily: font.InGameFontName,
                align: 'right',
                fill: 0xFFFFFF,
                fontSize: 4
            });
            this.renders.performanceInfoText = new Text({
                text: "PerformanceInfo",
                style: this.renders.performanceInfoTextStyle
            });

            this.renders.performanceInfoText.anchor.x = 1;
            this.renders.performanceInfoText.zIndex = 999999;
            this.renders.performanceInfoText.scale.set(0.7)

            this.rootContainer.addChild(this.renders.performanceInfoText);
        }
        this.container.gameContainer.sortChildren();
        this.container.UIContainer.sortChildren();
        this.container.mainContainer.sortChildren();
        this.rootContainer.sortChildren();
        this.resize();
        this.container.gameContainer.visible = false
        this.ui.backgroundContainer.visible = true
        this.ui.backgroundContainer.zIndex = 9999999999

    }
    updatePerformanceInfo() {
        if (!this.settings.showPerformanceInfo) return
        this.renders.performanceInfoText.text =
            `FPS:${(1000 / this.FrameTime).toFixed(1)}` + "\n" +
            `Frame:${(this.FrameTime).toFixed(3)}ms` + "\n" +
            `GPUFrame:${(this.GPUFrameTime).toFixed(3)}ms` + "\n" +
            `CPUFrame:${(this.CPUFrameTime).toFixed(3)}ms` + "\n" +
            `JudgeLine:${(this.JudgeLineFrameTime).toFixed(3)}ms` + "\n" +
            `Note:${(this.NoteFrameTime).toFixed(3)}ms` + "\n" +
            `Judgement:${(this.JudgeFrameTime).toFixed(3)}ms` + "\n" +
            `Other:${(this.OtherFrameTime).toFixed(3)}ms`
    }
    start() {
        if (!this.isFirst) { this.restart(); return }
        if (!this.app) return;
        if (!this.chart.music) throw new Error('歌呢？');
        this.prprExtra.cleanShader()
        this.container.UIContainer.interactive = true
        this.container.mainContainer.interactive = true
        this.resize();
        this.prprExtra.reset()

        this.chart.music.speed = this.settings.speed;
        this.chart.music.reset();
        this.chart.reset();
        this.judgement.reset();
        this._animateStatus = 0;
        this._gameStartTime = Date.now();
        this.chart.noteJudgeCallback = this.judgement.calcNote;
        this.fakeJudgeline.visible = true
        this.container.UIContainer.visible = true
        this.container.gameContainer.visible = true
        this.ui.backgroundContainer.zIndex = 0

        for (const judgeline of this.chart.judgelines) {
            if (!judgeline.sprite) continue;
            judgeline.sprite.alpha = 0;
        };
        for (const note of this.chart.notes) {
            if (!note.sprite) continue;

            note.sprite.alpha = 0;
            if (note.hitsound) (note.hitsound as Audio).volume = this.judgement._hitsoundVolume;
        };

        for (const name in this.judgement.sounds) {
            (this.judgement.sounds as any)[name].volume = this.judgement._hitsoundVolume;
        }
        this.isFirst = false
        window.onblur = () => { this.autoPause() }
        (window as any).curGameSeekTime = (a: number) => {
            this.chart.music.seek(a)
        }
        (window as any).curGameMusic = this.chart.music
        this.app.setTick(() => this.gameTick());
    }

    pause() {
        this.isPaused = this.isPaused ? false : true;
        this.judgement.input._isPaused = this.isPaused;

        if (!this.isPaused) {
            this._animateStatus = 1
            this.chart.music.pause(false)
            this.runCallback('pause');
        }
        else {
            this._animateStatus = 1
            this.chart.music.pause(true)
        }
    }

    autoPause() {
        return
        if (!this.isPaused && this._animateStatus == 1) {
            this.pause()
        }

    }

    restart() {
        this.app.setTick(() => this.gameTick());
        window.onblur = () => { this.autoPause() }
        this.chart.music.reset();

        this.chart.reset();
        this.judgement.reset();

        this.resize();
        this.prprExtra.reset()

        this.isPaused = false;
        this.isEnded = false;

        this._animateStatus = 0;
        this._gameStartTime = Date.now();
        this._gameEndTime = NaN;
        if (this.settings.showAPStatus) this.fakeJudgeline.tint = 0xFFECA0;
        this.fakeJudgeline.visible = true;
        for (const judgeline of this.chart.judgelines) {
            if (!judgeline.sprite) continue;

            judgeline.sprite.alpha = 0;
            if (this.settings.showAPStatus) judgeline.setColor(0xFFECA0, true)
        };
        for (const note of this.chart.notes) {
            if (!note.sprite) continue;

            note.sprite.alpha = 0;
        };
    }

    destroy() {
        const canvas = this.app.canvas;
        this.app.setTick(() => { });
        this.chart.music.reset();
        this.chart.reset();
        this.judgement.destroySprites();
        this.judgement.input.removeListenerFromCanvas(canvas as HTMLCanvasElement);
        window.removeEventListener('resize', () => this.resize);
        canvas.width = canvas.height = 0;
        window.onblur = null
        this.chart.destroySprites()
        this.renderTarget.destroy()
        this.ui.destroy()
        this.prprExtra.destroy();
        (window as any).__PIXI_DEVTOOLS__ = undefined
    }

    on(type: string, callback: () => any) {
        if (!this.functions[type]) return;
        if (!(callback instanceof Function)) return;
        this.functions[type].push(callback);
    }

    resize(withChartSprites = true, shouldResetFakeJudgeLine = true) {
        if (!this.app) return;
        // 计算新尺寸相关数据
        this.renderTarget.resize(this.app.renderer.screen.width, this.app.renderer.screen.height)
        this.renders.sizer = this.calcResizer(this.app.renderer.screen.width, this.app.renderer.screen.height, this.settings.noteScale);
        this.antialiasing.resize(
            this.renders.sizer.shaderScreenSize[0],
            this.renders.sizer.shaderScreenSize[1]
        )
        this.ui.resizeSprites(this.renders.sizer, this.isEnded)
        // 主舞台区位置重计算
        this.container.mainContainer.position.x = this.renders.sizer.widthOffset;
        // 主舞台可视区域计算
        if (this.renders.sizer.widerScreen && this.container.mainContainer) {
            this.container.mainContainer.mask = this.renders.mainContainerMask;
            this.renders.mainContainerMask.visible = true;

            this.renders.mainContainerMask.clear()
                .rect(this.renders.sizer.widthOffset, 0, this.renders.sizer.width, this.renders.sizer.height)
                .fill({ color: 0xFFFFFF })
        }
        else {
            this.container.mainContainer.mask = null;
            this.renders.mainContainerMask.visible = false;
        }
        // 主舞台超宽屏覆盖计算
        if (this.renders.sizer.widerScreen && this.container.mainContainerCover) {
            let bgScaleWidth = this.app.renderer.screen.width / this.renders.bg.texture.width;
            let bgScaleHeight = this.app.renderer.screen.height / this.renders.bg.texture.height;
            let bgScale = bgScaleWidth > bgScaleHeight ? bgScaleWidth : bgScaleHeight;

            this.container.mainContainerCover.scale.set(bgScale);
            this.container.mainContainerCover.position.set(this.app.renderer.screen.width / 2, this.app.renderer.screen.height / 2);

            this.container.mainContainerCover.visible = true;
        }
        else if (this.container.mainContainerCover) {
            this.container.mainContainerCover.visible = false;
        }

        if (!this.isEnded && this) {

            if (this.fakeJudgeline) {
                this.fakeJudgeline.position.x = this.renders.sizer.width / 2;
                this.fakeJudgeline.position.y = this.renders.sizer.height / 2;

                this.fakeJudgeline.scale.y = this.renders.sizer.lineHeightScale
                if (shouldResetFakeJudgeLine || this.isEnded) {
                    this.fakeJudgeline.width = 0;
                }
            }
        }

        // FPS 计数器尺寸计算
        if (this.renders.performanceInfoText) {
            this.renders.performanceInfoText.position.x = this.renders.sizer.shaderScreenSizeG[0];
            this.renders.performanceInfoText.position.y = 0;
            this.renders.performanceInfoText.style.fontSize = this.renders.sizer.heightPercent * 32;
            this.renders.performanceInfoText.style.padding = this.renders.sizer.heightPercent * 8;
        }
        this.glRenderTarget = this.app.getGlRenderTarget(this.renderTarget)
        if (withChartSprites) {
            this.judgement.resizeSprites(this.renders.sizer, this.isEnded);
            this.chart.resizeSprites(this.renders.sizer, this.isEnded);
            this.prprExtra.resize(this.renders.sizer)
            this.gameTick(true)
        }
    }

    gameTimeInSec() {
        return (Date.now() - this._gameStartTime) / 1000;
    }

    gameEndCallback() {
        this._animateStatus = 2;
        this._gameEndTime = Date.now();
        this.fakeJudgeline.visible = true;

        this.judgement.clickParticleContainer.removeChildren()

        if (this.settings.showAPStatus) {
            if (this.judgement.score.APType === 1) this.fakeJudgeline.tint = 0xB4E1FF;
            else if (this.judgement.score.APType === 0) this.fakeJudgeline.tint = 0xFFFFFF;
        }

        for (const judgeline of this.chart.judgelines) {
            if (!judgeline.sprite) continue;

            judgeline.sprite.alpha = 0;
        };
        for (const note of this.chart.notes) {
            if (!note.sprite) continue;

            note.sprite.alpha = 0;
        };

        if (this.judgement.input.sprite) this.judgement.input.sprite.clear();
        this.prprExtra.cleanShader()
    }

    runCallback(type: string) {
        if (!this.functions[type]) return;
        this.functions[type].forEach((callback: (a: any) => any) => callback(this));
    }
    gameTick(force: boolean = false) {
        let st = performance.now()
        this.calcTickByCurrentTime(this.currentTime, force)
        this.render()
        this.FrameTime = performance.now() - st
    }

    get currentTime() {
        return this.settings.recordMode ? this._currentTime : this.chart.music.currentTime - (this.chart.offset + this.settings.offset)
    }

    calcTickByCurrentTime(currentTime: number, force: boolean = false) {
        this._currentTime = currentTime
        let { chart, judgement, renders } = this;
        if (currentTime + (this.chart.offset + this.settings.offset) >= this.chart.music.duration && this._animateStatus == 1) {
            this.gameEndCallback()
        }
        this.ui.calcTime(currentTime)
        switch (this._animateStatus) {
            case 0:
                {
                    this.calcGameAnimateTick(true);
                    break;
                }
            case 1:
                {

                    if (!this.isPaused || force) {
                        this.runCallback('tick');
                        let st1 = performance.now()
                        this.prprExtra.calcTime(currentTime)
                        for (let i = 0, length = chart.bpmList.length; i < length; i++) {
                            let bpm = chart.bpmList[i];
                            if (bpm.endTime < currentTime) continue;
                            if (bpm.startTime > currentTime) break;
                            judgement.holdBetween = bpm.holdBetween;
                        }
                        let st3 = performance.now()
                        this.OtherFrameTime = st3 - st1
                        for (const judgeline of chart.judgelines) {
                            judgeline.calcTime(currentTime, renders.sizer);
                        }
                        let st4 = performance.now()
                        this.JudgeLineFrameTime = st4 - st3
                        for (const note of chart.notes) {
                            note.calcTime(currentTime, renders.sizer);
                            if (note.notCalc) continue
                        }
                        let st5 = performance.now()
                        this.NoteFrameTime = st5 - st4
                        for (const note of chart.notes) {
                            if (note.notCalc) continue
                            judgement.calcNote(currentTime, note);
                        }
                        judgement.calcTick(currentTime);
                        let st6 = performance.now()
                        this.JudgeFrameTime = st6 - st5
                        this.CPUFrameTime = st6 - st1
                    }
                    break;
                }
            case 2:
                {
                    this.calcGameAnimateTick(false);
                    break;
                }
            case 3:
                {
                    this.prprExtra.cleanShader()
                    break;
                }
        }
    }
    easeInOutCubic(x: number): number {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }
    easeInOutQuart(x: number): number {
        return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
    }
    calcGameAnimateTick(isStart = true) {
        let _progress = (Date.now() - (isStart ? this._gameStartTime : this._gameEndTime)) / 1500,
            progress = (!isStart ? 1 - _progress : _progress);
        this.fakeJudgeline.width = this.renders.sizer.width * this.easeInOutQuart(progress);
        if (isStart) {
            this.container.mainContainer.alpha = _progress + 0.25
        } else {
            this.container.mainContainer.alpha = 1 - _progress
        }
        if (_progress >= 1) {
            if (isStart) {
                this._animateStatus = 1;
                this.resize(true, false);
                this.chart.music.play(true);
                this.musicStartTime = Date.now() - this._gameStartTime
                this.isPaused = false;
                this.isEnded = false;
                this.fakeJudgeline.visible = false;
                this.container.mainContainer.alpha = 1
                this.runCallback('start');
            }
            else {
                this._animateStatus = 3;
                this.isPaused = true;
                this.isEnded = true;
                this.prprExtra.cleanShader()
                this.runCallback('end');
                this.renders.performanceInfoText.alpha = 0
                this.container.mainContainer.alpha = 0
                this.app.setTick(() => { });
                window.onblur = null
            }

        }
        this.ui.calcAni(this.renders.sizer, isStart, _progress)
    }
    calcResizer(width: number, height: number, noteScale = 8000): SizerData {
        let result: SizerData = {} as any;

        result.width = height / 9 * 16 < width ? height / 9 * 16 : width;
        result.height = height;
        result.shaderScreenSize = [result.width, result.height];
        result.shaderScreenSizeG = [width, height]
        result.widthPercent = result.width * (9 / 160);
        result.widthOffset = (width - result.width) / 2;

        result.widerScreen = result.width < width ? true : false;

        result.startX = -result.width / 12;
        result.endX = result.width * (13 / 12);
        result.startY = -result.height / 12;
        result.endY = result.height * (13 / 12);

        result.noteSpeed = result.height * 0.6;
        result.noteScale = result.width / noteScale;
        result.noteWidth = result.width * 0.117775;
        result.lineScale = result.width > result.height * 0.75 ? result.height / 18.75 : result.width / 14.0625;
        result.heightPercent = result.height / 1080;
        result.textureScale = result.height / 750;
        result.baseFontSize = result.lineScale / result.heightPercent
        result.lineHeightScale = result.height * 0.0075 / this.assets.judgeLine.height
        result.lineWidthScale = result.height * 5.76 / this.assets.judgeLine.width;
        return result;
    }

    render() {
        let st = performance.now()
        this.updatePerformanceInfo()
        if (!this._params.settings.antialias) {
            this.app.renderer.render({
                container: this.rootContainer
            })
        } else {
            this.app.renderer.render({
                container: this.rootContainer,
                target: this.renderTarget
            })

            this.antialiasing.render()
            const output = this.antialiasing.output
            this.app.biltToScreen(output ? output : this.renderTarget)

        }
        this.GPUFrameTime = performance.now() - st
    }

    getDefaultShader() {
        return [DefaultShader.filter]
            .concat(
                this._params.settings.antialias && this._params.settings.antialiasType == 1 ? [this.antialiasing.FXAA!] : []
            )
    }

    private async initRender() {
        if (this._params.settings.antialias) {
            if (this._params.settings.antialiasType == 1) await this.antialiasing.initFXAA()
            if (this._params.settings.antialiasType == 2) await this.antialiasing.initSMAA()
        }
    }

    static async create(params: GameParams) {
        const game = new this()
        await game.init(params)
        return game
    }
    getAntialiasing() {
        return this.antialiasing
    }
}

