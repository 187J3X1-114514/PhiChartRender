import * as verify from '../verify';
import Judgement from '../judgement';
import type { PhiAssets } from "../resource";
import { Application, Container, Sprite, Graphics, Text, TextStyle, Ticker, RenderTarget } from 'pixi.js';
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
    sprites: {
        fakeJudgeline: Sprite
    } = ukObj
    chart: Chart = uk
    effects: PrprExtra = uk
    zipFiles: ResourceManager = uk
    _audioOffset = 0;
    _animateStatus = NaN;
    _gameStartTime = NaN;
    _gameEndTime = NaN;
    _isPaused = false;
    _isEnded = false;
    _currentEffects = [];
    _settings: GameSettings = uk
    renders: {
        mainContainer: Container
        parentNode: HTMLElement
        gameContainer: Container
        UIContainer: Container
        mainContainerMask: Graphics
        mainContainerCover: Container
        performanceInfoText: Text
        sizer: SizerData,
        bg: Sprite,
        performanceInfoTextStyle: TextStyle,
        videoContainer: Container
    } = {
            ...ukObj, ...{
                mainContainer: new Container(),
                parentNode: document.documentElement,
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
    app: WebGLApplication = uk
    judgement: Judgement = uk
    private functions: any
    assets: PhiAssets = uk
    private lastFPS: number = 0
    private isFirst = true
    public musicStartTime: number = 0
    ui: UIManager = uk
    public rootContainer = new Container()
    private _params: GameParams = uk
    private antialiasing: Antialiasing = uk
    public renderTarget: RenderTarget = uk
    public glRenderTarget: PixiGlRenderTarget = uk
    public currentTime: number = 0
    private CPUFrameTime: number = 0
    private JudgeLineFrameTime: number = 0
    private NoteFrameTime: number = 0
    private JudgeFrameTime: number = 0
    private OtherFrameTime: number = 0
    private GPUFrameTime: number = 0
    private FrameTime: number = 0
    private async init(_params: GameParams) {
        if (_params.settings.noteScale) _params.settings.noteScale = 8080 / _params.settings.noteScale;
        (window as any).curPhiGame = this
        this._params = _params
        let params = { ..._params };
        if (!params.render) params.render = {};
        if (!params.settings) params.settings = {};

        /* ===== 加载谱面基本信息 ===== */

        this.assets = params.assets;
        this.zipFiles = params.zipFiles || new ResourceManager();
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


        this.effects = params.settings.prprExtra ? chart!.prpr as PrprExtra : PrprExtra.none;
        if (!this.chart) {
            printImage(0.5, () => { throw new Error('不是哥们，铺呢？') })
        }
        if (!this.assets) {
            printImage(0.5, () => { throw new Error('不是哥们，资源呢？') })
        }

        /* ===== 创建 render ===== */
        this.app = params.app
        this.renders.parentNode = (params.render.resizeTo ? params.render.resizeTo : (params.render.view ? params.render.view.parentNode : this.app.canvas.parentNode))! as HTMLElement;
        // 创建舞台主渲染区
        this.renders.mainContainer.zIndex = 10;
        this.rootContainer.addChild(this.renders.mainContainer);

        // 创建游戏精灵容器
        this.renders.gameContainer = new Container();
        this.renders.gameContainer.zIndex = 20;
        this.renders.mainContainer.addChild(this.renders.gameContainer);

        // 创建 UI 容器
        this.renders.UIContainer = new Container();
        this.renders.UIContainer.zIndex = 30;
        this.renders.mainContainer.addChild(this.renders.UIContainer);
        this.renders.UIContainer.visible = false
        this.renders.videoContainer = new Container();
        this.renders.videoContainer.zIndex = -1;
        this.renders.gameContainer.addChild(this.renders.videoContainer);



        // 创建舞台主渲染区可见范围
        this.renders.mainContainerMask = new Graphics();

        /* ===== 创建判定 ===== */
        this.judgement = new Judgement({
            chart: this.chart,
            stage: this.renders.gameContainer,
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

        /* ===== 用户设置暂存 ===== */
        this._settings = {
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
            shader: verify.bool(params.settings.prprExtra, true)
        };
        this.renderTarget = new RenderTarget()
        this.antialiasing = new Antialiasing(this.app)
        await this.initRender()
        this.ui = new UIManager(this)
        this.ui.createSprites()
        this.ui.backgroundContainer.zIndex = 9999999
        this.effects.setGame(this)
        this.effects.init()
        this.chart.music.reset();
        this.chart.reset();
        this.judgement.reset();
        this.effects.reset()
        this.resize = this.resize.bind(this);

        if (this._settings.speed < 0.25) throw new Error('Speed too slow');
        else if (this._settings.speed > 2) throw new Error('Speed too fast');

        this.resize(false);
        if (_params.render.resizeTo) _params.render.resizeTo.append(this.app.canvas as HTMLCanvasElement);

        (window as any).__PIXI_DEVTOOLS__ = {
            renderer: this.app.renderer,
            stage: this.rootContainer
        };

    }

    createSprites() {
        this.rootContainer.eventMode = "static"
        this.renders.gameContainer.eventMode = "static"
        this.renders.mainContainer.eventMode = "static"
        this.renders.UIContainer.eventMode = "static"
        this.chart.createSprites(
            this.renders.gameContainer,
            this.renders.sizer,
            this.assets,
            this.renders.UIContainer,
            this.zipFiles,
            this._settings.speed,
            this._settings.bgDim,
            this._settings.multiNoteHL
        );

        if (this._settings.showAPStatus) {
            for (const judgeline of this.chart.judgelines) {
                if (!judgeline.sprite) continue;
                judgeline.setColor(0xFFECA0, true)
            };
        }

        this.judgement.stage = this.renders.UIContainer;
        this.judgement.createSprites(this._settings.showInputPoint);

        // 假判定线，过场动画用
        this.sprites.fakeJudgeline = new Sprite(this.assets.judgeLine);
        this.sprites.fakeJudgeline.visible = false
        this.sprites.fakeJudgeline.anchor.set(0.5);
        this.sprites.fakeJudgeline.zIndex = 999;
        this.sprites.fakeJudgeline.scale.y = this.renders.sizer.lineHeightScale
        if (this._settings.showAPStatus) this.sprites.fakeJudgeline.tint = 0xFFECA0;
        this.renders.UIContainer.addChild(this.sprites.fakeJudgeline);

        if (this._settings.showPerformanceInfo) {
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
        this.renders.gameContainer.sortChildren();
        this.renders.UIContainer.sortChildren();
        this.renders.mainContainer.sortChildren();
        this.rootContainer.sortChildren();
        this.resize();
        this.renders.gameContainer.visible = false
        this.ui.backgroundContainer.visible = true
        this.ui.backgroundContainer.zIndex = 9999999999

    }
    updatePerformanceInfo() {
        if (!this._settings.showPerformanceInfo) return
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
        this.effects.cleanShader()
        this.renders.UIContainer.interactive = true
        this.renders.mainContainer.interactive = true
        this.resize();
        this.effects.reset()

        this.chart.music.speed = this._settings.speed;
        this.chart.music.reset();
        this.chart.reset();
        this.judgement.reset();
        this._animateStatus = 0;
        this._gameStartTime = Date.now();
        this.chart.noteJudgeCallback = this.judgement.calcNote;
        this.sprites.fakeJudgeline.visible = true
        this.renders.UIContainer.visible = true
        this.renders.gameContainer.visible = true
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
        this._isPaused = this._isPaused ? false : true;
        this.judgement.input._isPaused = this._isPaused;

        if (!this._isPaused) {
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

        if (!this._isPaused && this._animateStatus == 1) {
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
        this.effects.reset()

        this._isPaused = false;
        this._isEnded = false;

        this._animateStatus = 0;
        this._gameStartTime = Date.now();
        this._gameEndTime = NaN;
        if (this._settings.showAPStatus) this.sprites.fakeJudgeline.tint = 0xFFECA0;
        this.sprites.fakeJudgeline.visible = true;
        for (const judgeline of this.chart.judgelines) {
            if (!judgeline.sprite) continue;

            judgeline.sprite.alpha = 0;
            if (this._settings.showAPStatus) judgeline.setColor(0xFFECA0, true)
        };
        for (const note of this.chart.notes) {
            if (!note.sprite) continue;

            note.sprite.alpha = 0;
        };
    }

    destroy(removeCanvas = false) {
        const canvas = this.app.canvas;

        this.app.setTick(() => { });
        this.chart.music.reset();

        this.chart.reset();
        this.judgement.destroySprites();

        this.judgement.input.removeListenerFromCanvas(canvas as HTMLCanvasElement);

        window.removeEventListener('resize', () => this.resize);

        canvas.width = canvas.height = 0;
        window.onblur = null
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
        this.renders.sizer = this.calcResizer(this.app.renderer.screen.width, this.app.renderer.screen.height, this._settings.noteScale);
        this.antialiasing.resize(
            this.renders.sizer.shaderScreenSize[0],
            this.renders.sizer.shaderScreenSize[1]
        )
        this.ui.resizeSprites(this.renders.sizer, this._isEnded)
        // 主舞台区位置重计算
        this.renders.mainContainer.position.x = this.renders.sizer.widthOffset;
        // 主舞台可视区域计算
        if (this.renders.sizer.widerScreen && this.renders.mainContainer) {
            this.renders.mainContainer.mask = this.renders.mainContainerMask;
            this.renders.mainContainerMask.visible = true;

            this.renders.mainContainerMask.clear()
                .rect(this.renders.sizer.widthOffset, 0, this.renders.sizer.width, this.renders.sizer.height)
                .fill({ color: 0xFFFFFF })
        }
        else {
            this.renders.mainContainer.mask = null;
            this.renders.mainContainerMask.visible = false;
        }
        // 主舞台超宽屏覆盖计算
        if (this.renders.sizer.widerScreen && this.renders.mainContainerCover) {
            let bgScaleWidth = this.app.renderer.screen.width / this.renders.bg.texture.width;
            let bgScaleHeight = this.app.renderer.screen.height / this.renders.bg.texture.height;
            let bgScale = bgScaleWidth > bgScaleHeight ? bgScaleWidth : bgScaleHeight;

            this.renders.mainContainerCover.scale.set(bgScale);
            this.renders.mainContainerCover.position.set(this.app.renderer.screen.width / 2, this.app.renderer.screen.height / 2);

            this.renders.mainContainerCover.visible = true;
        }
        else if (this.renders.mainContainerCover) {
            this.renders.mainContainerCover.visible = false;
        }

        if (!this._isEnded && this.sprites) {

            if (this.sprites.fakeJudgeline) {
                this.sprites.fakeJudgeline.position.x = this.renders.sizer.width / 2;
                this.sprites.fakeJudgeline.position.y = this.renders.sizer.height / 2;

                this.sprites.fakeJudgeline.scale.y = this.renders.sizer.lineHeightScale
                if (shouldResetFakeJudgeLine || this._isEnded) {
                    this.sprites.fakeJudgeline.width = 0;
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
            this.judgement.resizeSprites(this.renders.sizer, this._isEnded);
            this.chart.resizeSprites(this.renders.sizer, this._isEnded);
            this.effects.resize(this.renders.sizer)
            this.gameTick(true)
        }
    }

    gameTimeInSec() {
        return (Date.now() - this._gameStartTime) / 1000;
    }

    gameEndCallback() {
        this._animateStatus = 2;
        this._gameEndTime = Date.now();
        this.sprites.fakeJudgeline.visible = true;

        this.judgement.clickParticleContainer.removeChildren()

        if (this._settings.showAPStatus) {
            if (this.judgement.score.APType === 1) this.sprites.fakeJudgeline.tint = 0xB4E1FF;
            else if (this.judgement.score.APType === 0) this.sprites.fakeJudgeline.tint = 0xFFFFFF;
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
        this.effects.cleanShader()
    }

    runCallback(type: string) {
        if (!this.functions[type]) return;
        this.functions[type].forEach((callback: (a: any) => any) => callback(this));
    }
    gameTick(force: boolean = false) {
        let st = performance.now()
        this.currentTime = this.chart.music.currentTime - (this.chart.offset + this._settings.offset);
        this.calcTickByCurrentTime(this.currentTime, force)
        this.render()
        this.FrameTime = performance.now() - st
    }
    calcTickByCurrentTime(currentTime: number, force: boolean = false) {
        let { chart, judgement, renders } = this;
        if (currentTime + (this.chart.offset + this._settings.offset) >= this.chart.music.duration && this._animateStatus == 1) {
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

                    if (!this._isPaused || force) {
                        let st1 = performance.now()
                        this.effects.calcTime(currentTime)
                        for (let i = 0, length = chart.bpmList.length; i < length; i++) {
                            let bpm = chart.bpmList[i];
                            if (bpm.endTime < currentTime) continue;
                            if (bpm.startTime > currentTime) break;
                            judgement._holdBetween = bpm.holdBetween;
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
                    this.effects.cleanShader()
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
        this.sprites.fakeJudgeline.width = this.renders.sizer.width * this.easeInOutQuart(progress);
        if (isStart) {
            this.renders.mainContainer.alpha = _progress + 0.25
        } else {
            this.renders.mainContainer.alpha = 1 - _progress
        }
        if (_progress >= 1) {
            if (isStart) {
                this._animateStatus = 1;
                this.resize(true, false);
                this.chart.music.play(true);
                this.musicStartTime = Date.now() - this._gameStartTime
                this._isPaused = false;
                this._isEnded = false;
                this.sprites.fakeJudgeline.visible = false;
                this.renders.mainContainer.alpha = 1
                this.runCallback('start');
            }
            else {
                this._animateStatus = 3;
                this._isPaused = true;
                this._isEnded = true;
                this.effects.cleanShader()
                this.runCallback('end');
                this.renders.performanceInfoText.alpha = 0
                this.renders.mainContainer.alpha = 0
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

        result.note_max_size_half = (((((0.125 * result.width + 0.2 * result.height) / 2) * (noteScale / 8080)) ** 2 + (this.assets.note.holdMH.body.height * 1.1) ** 2) ** 0.5) / 2
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

