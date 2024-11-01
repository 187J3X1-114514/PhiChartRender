import * as verify from '../verify';
import Judgement from '../judgement';
import { PhiAssets } from "../resource"
import { Application, Container, Sprite, Graphics, Text, TextStyle, Ticker, RenderTarget } from 'pixi.js';
import * as font from '../font'
import Chart from '../chart';
import { GameParams, GameSettings, SizerData } from '../types/params';
import Audio from '../audio';
import { ResourceManager } from '../resource/resource_manager';
import { printImage } from '../utils';
import UIManager from '../ui';
import { PrprExtra } from '../prpr/prpr';
import { Antialiasing } from '../antialiasing';
import { DefaultShader } from '../prpr/effect/shader';

const uk = (undefined as unknown) as any
const ukObj = ({} as unknown) as any
export default class PhiGame {
    sprites: {
        progressBar: Graphics,
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
        fpsText: Text
        sizer: SizerData,
        bg: Sprite,
        fpsTextStyle: TextStyle,
        videoContainer: Container
    } = {
            ...ukObj, ...{
                mainContainer: new Container(),
                parentNode: document.documentElement,
                gameContainer: new Container(),
                UIContainer: new Container(),
                mainContainerMask: new Graphics(),
                mainContainerCover: new Sprite(),
                fpsText: new Text(),
                sizer: ({} as any),
                bg: new Sprite(),
                pauseButton: new Sprite(),
                videoContainer: new Container()
            }
        }
    app: Application = uk
    judgement: Judgement = uk
    private functions: any
    private processors: any
    assets: PhiAssets = uk
    private lastFPS: number = 0
    private isFirst = true
    public musicStartTime: number = 0
    ui: UIManager = uk
    public rootContainer = new Container()
    private _params: GameParams = uk
    private antialiasing: Antialiasing = uk
    public renderTarget: RenderTarget = uk
    private async init(_params: GameParams) {
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


        this.effects = params.settings.shader ? chart!.prpr as PrprExtra : PrprExtra.none;
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

        this.renders.videoContainer = new Container();
        this.renders.videoContainer.zIndex = -4;
        this.renders.gameContainer.addChild(this.renders.videoContainer);



        // 创建舞台主渲染区可见范围
        this.renders.mainContainerMask = new Graphics();

        /* ===== 创建判定 ===== */
        this.judgement = new Judgement({
            chart: this.chart,
            stage: this.renders.gameContainer,
            canvas: this.app.canvas,
            assets: {
                textures: { normal: this.assets.hitFx, bad: this.assets.hitFx },
                sounds: this.assets.sound,
            },
            hitsound: verify.bool(params.settings.hitsound, true),
            hitsoundVolume: verify.number(params.settings.hitsoundVolume, 1, 0, 1),
            showAPStatus: verify.bool(params.settings.showAPStatus, true),
            challengeMode: verify.bool(params.settings.challengeMode, false),
            autoPlay: verify.bool(params.settings.autoPlay, false)
        });

        this.functions = {
            start: [],
            tick: [],
            pause: [],
            end: []
        };
        this.processors = {
            judgeline: [],
            note: []
        };


        /* ===== 用户设置暂存 ===== */
        this._settings = {
            resolution: verify.number(params.render.resolution, window.devicePixelRatio, 1),
            noteScale: verify.number(params.settings.noteScale, 8000),
            bgDim: verify.number(params.settings.bgDim, 0.5, 0, 1),
            offset: verify.number(params.settings.audioOffset, 0),
            speed: verify.number(params.settings.speed, 1, 0, 2),
            showFPS: verify.bool(params.settings.showFPS, true),
            showInputPoint: verify.bool(params.settings.showInputPoint, true),
            multiNoteHL: verify.bool(params.settings.multiNoteHL, true),
            showAPStatus: verify.bool(params.settings.showAPStatus, true),
            challengeMode: verify.bool(params.settings.challengeMode, false),
            autoPlay: verify.bool(params.settings.autoPlay, false),
            shader: verify.bool(params.settings.shader, true)
        };
        this.renderTarget = new RenderTarget()
        this.antialiasing = new Antialiasing(this.app)
        this.ui = new UIManager(this)
        this.ui.createSprites()
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
        if (_params.render.resizeTo) _params.render.resizeTo.append(this.app.canvas as HTMLCanvasElement)
        this.initRender()
    }

    createSprites() {
        this.app.stage.eventMode = "static"
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
                judgeline.setColor(0xFFECA0)
            };
        }

        this.judgement.stage = this.renders.UIContainer;
        this.judgement.createSprites(this._settings.showInputPoint);

        // 进度条
        this.sprites.progressBar = new Graphics();
        this.sprites.progressBar.alpha = 0.75;
        this.sprites.progressBar.zIndex = 99999;

        this.renders.UIContainer.addChild(this.sprites.progressBar);

        // 假判定线，过场动画用
        this.sprites.fakeJudgeline = new Sprite(this.assets.judgeLine);
        this.sprites.fakeJudgeline.anchor.set(0.5);
        this.sprites.fakeJudgeline.zIndex = 99999;
        this.sprites.fakeJudgeline.scale.y = this.renders.sizer.lineHeightScale
        if (this._settings.showAPStatus) this.sprites.fakeJudgeline.tint = 0xFFECA0;
        this.renders.UIContainer.addChild(this.sprites.fakeJudgeline);

        if (this._settings.showFPS) {
            this.renders.fpsTextStyle = new TextStyle({
                fontFamily: font.InGameFontName,
                align: 'right',
                fill: 0xFFFFFF
            });
            this.renders.fpsText = new Text({
                text: "FPS: 0",
                style: this.renders.fpsTextStyle
            });

            this.renders.fpsText.anchor.x = 1;
            this.renders.fpsText.alpha = 0.5;
            this.renders.fpsText.zIndex = 999999;

            this.renders.UIContainer.addChild(this.renders.fpsText);
        }
        this.renders.gameContainer.sortChildren();
        this.renders.UIContainer.sortChildren();
        this.renders.mainContainer.sortChildren();
        this.rootContainer.sortChildren();
        this.resize();
        this.ui.backgroundContainer.zIndex = 9999999
        this.sprites.progressBar.x = this.sprites.progressBar.width

    }
    upFPS(d: Ticker) {
        this.renders.fpsText.text = 'FPS: ' + ((this.lastFPS + d.FPS) / 2).toFixed(1)
        this.lastFPS = d.FPS
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
        this.ui.backgroundContainer.zIndex = 0
        if (this.renders.fpsText) {
            this.app.ticker.remove((d) => {
                this.upFPS(d)
            })
            this.app.ticker.add((d) => {
                this.upFPS(d)
            })
        }

        this.chart.music.speed = this._settings.speed;
        this.app.ticker.remove(() => this.gameTick());
        this.chart.music.reset();
        this.chart.reset();
        this.judgement.reset();
        this._animateStatus = 0;
        this._gameStartTime = Date.now();
        this.chart.noteJudgeCallback = this.judgement.calcNote;
        this.app.ticker.add(() => this.gameTick());

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
            this.judgement.sounds[name].volume = this.judgement._hitsoundVolume;
        }
        this.isFirst = false
        window.onblur = () => { this.autoPause() }
        (window as any).curGameSeekTime = (a:number)=>{
            this.chart.music.seek(a)
        }
        (window as any).curGameMusic = this.chart.music
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
        this.app.ticker.remove(() => this.gameTick());
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

        this.app.ticker.add(() => this.gameTick());
        if (this._settings.showAPStatus) this.sprites.fakeJudgeline.tint = 0xFFECA0;
        this.sprites.fakeJudgeline.visible = true;
        for (const judgeline of this.chart.judgelines) {
            if (!judgeline.sprite) continue;

            judgeline.sprite.alpha = 0;
            if (this._settings.showAPStatus) judgeline.setColor(0xFFECA0)
        };
        for (const note of this.chart.notes) {
            if (!note.sprite) continue;

            note.sprite.alpha = 0;
        };
    }

    destroy(removeCanvas = false) {
        const canvas = this.app.canvas;

        this.app.ticker.remove(() => this.gameTick());
        this.chart.music.reset();

        if (this.renders.fpsText) this.app.ticker.remove((d) => {
            this.upFPS(d)
        })

        this.chart.reset();
        this.judgement.destroySprites();

        this.judgement.input.removeListenerFromCanvas(canvas as HTMLCanvasElement);

        window.removeEventListener('resize', () => this.resize);

        canvas.width = canvas.height = 0;

        this.app.destroy(removeCanvas, { children: false, texture: false, textureSource: false });
        window.onblur = null
    }

    on(type: string, callback: () => any) {
        if (!this.functions[type]) return;
        if (!(callback instanceof Function)) return;
        this.functions[type].push(callback);
    }

    addProcessor(type: string, callback: () => any) {
        if (!this.processors[type]) return;
        if (!(callback instanceof Function)) return;
        this.processors[type].push(callback);
    }



    resize(withChartSprites = true, shouldResetFakeJudgeLine = true) {
        if (!this.app) return;
        // 计算新尺寸相关数据

        this.renderTarget.resize(this.app.screen.width, this.app.screen.height, this._settings.resolution)
        this.renders.sizer = this.calcResizer(this.app.screen.width, this.app.screen.height, this._settings.noteScale, this._settings.resolution);
        this.antialiasing.updata(
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
            let bgScaleWidth = this.app.screen.width / this.renders.bg.texture.width;
            let bgScaleHeight = this.app.screen.height / this.renders.bg.texture.height;
            let bgScale = bgScaleWidth > bgScaleHeight ? bgScaleWidth : bgScaleHeight;

            this.renders.mainContainerCover.scale.set(bgScale);
            this.renders.mainContainerCover.position.set(this.app.screen.width / 2, this.app.screen.height / 2);

            this.renders.mainContainerCover.visible = true;
        }
        else if (this.renders.mainContainerCover) {
            this.renders.mainContainerCover.visible = false;
        }

        if (!this._isEnded && this.sprites) {
            if (this.sprites.progressBar) {
                let PBarW = this.renders.sizer.width
                let PBarH = 12
                let PBarWW = 3
                this.sprites.progressBar.clear()
                this.sprites.progressBar.rect(0, 0, PBarW - PBarWW, PBarH).fill({ color: "#919191" })
                this.sprites.progressBar.rect(PBarW - PBarWW, 0, PBarWW, PBarH).fill({ color: "#FFFFFF" })
                this.sprites.progressBar.scale.y = this.renders.sizer.heightPercent * 0.85
            }

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
        if (this.renders.fpsText) {
            this.renders.fpsText.position.x = this.renders.sizer.width;
            this.renders.fpsText.position.y = 0;
            this.renders.fpsText.style.fontSize = this.renders.sizer.heightPercent * 32;
            this.renders.fpsText.style.padding = this.renders.sizer.heightPercent * 8;
        }

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
        this.render()
        let currentTime = this.chart.music.currentTime - (this.chart.offset + this._settings.offset);
        this.calcTickByCurrentTime(currentTime, force)
    }
    calcTickByCurrentTime(currentTime: number, force: boolean = false) {
        let { chart, judgement, functions, processors, sprites, renders } = this;
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
                    this.effects.calcTime(currentTime)
                    if (!this._isPaused || force) {
                        for (let i = 0, length = chart.bpmList.length; i < length; i++) {
                            let bpm = chart.bpmList[i];

                            if (bpm.endTime < currentTime) continue;
                            if (bpm.startTime > currentTime) break;

                            judgement._holdBetween = bpm.holdBetween;
                        };

                        for (let i = 0, length = chart.judgelines.length; i < length; i++) {
                            const judgeline = chart.judgelines[i];
                            judgeline.calcTime(currentTime, renders.sizer);
                            for (let x = 0, length = processors.judgeline.length; x < length; x++) processors.judgeline[x](judgeline, currentTime);
                        };
                        for (let i = 0, length = chart.notes.length; i < length; i++) {
                            const note = chart.notes[i];
                            note.calcTime(currentTime, renders.sizer);
                            for (let x = 0, length = processors.note.length; x < length; x++) processors.note[x](note, currentTime);
                            judgement.calcNote(currentTime, note);
                        };
                        judgement.calcTick(currentTime);
                        for (let x = 0, length = functions.tick.length; x < length; x++) functions.tick[x](this, currentTime);
                    }
                    sprites.progressBar.x = -(sprites.progressBar as Graphics).width * (1 - (currentTime / chart.music.duration))
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

    calcGameAnimateTick(isStart = true) {
        let _progress = (Date.now() - (isStart ? this._gameStartTime : this._gameEndTime)) / 1000,
            progress = (isStart ? 1 - Math.pow(1 - _progress, 4) : Math.pow(1 - _progress, 4));
        this.sprites.progressBar.position.y = -(this.renders.sizer.heightPercent * 12) * (1 - progress);
        this.sprites.fakeJudgeline.width = this.renders.sizer.width * progress;

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
                this.renders.fpsText.alpha = 0
                this.renders.mainContainer.alpha = 0
                this.app.ticker.remove(() => this.gameTick());
                window.onblur = null
            }

        }
        this.ui.calcAni(this.renders.sizer, isStart, _progress)
    }
    calcResizer(width: number, height: number, noteScale = 8000, resolution = window.devicePixelRatio): SizerData {
        let result: SizerData = {} as any;



        result.width = height / 9 * 16 < width ? height / 9 * 16 : width;
        result.height = height;
        result.shaderScreenSize = [width * resolution, height * resolution];
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
        result.lineWidthScale = result.height * 5.76 / this.assets.judgeLine.width
        return result;
    }

    render() {

    }

    getDefaultShader() {
        return [DefaultShader.filter]
            .concat(
                this._params.settings.antialias && this._params.settings.antialiasType == 1 ? [this.antialiasing.FXAA!] : []
            )
    }

    private initRender() {
        if (this._params.settings.antialias && this._params.settings.antialiasType == 1) {
            this.antialiasing.initFXAA()
        }
        this.app.stage.addChild(this.rootContainer)
        console.log(this.app)
    }

    static async create(params: GameParams) {
        const game = new this()
        await game.init(params)
        return game
    }
}

