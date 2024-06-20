import * as verify from '../verify';
import Judgement from '../judgement';
import { PhiAssets } from "../resource"
import Shader from '../effect/shader/index'
import { Application, Container, Texture, Sprite, Graphics, Text, Rectangle, Filter } from 'pixi.js';
import * as font from '../font'
import Chart from '../chart';
import Effect from '../effect';
import { GameParams, GameSettings, SizerData } from '../types/params';
import WAudio from '../audio';
import { ResourceManger } from '../resource/resource_manger';
import { printImage } from '../utils';


const ProgressBarCache = (() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = 1920;
    canvas.height = 12;
    ctx.clearRect(0, 0, 1920, 12);
    ctx.fillStyle = '#919191';
    ctx.fillRect(0, 0, 1917, 12);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(1917, 0, 3, 12);

    const result = Texture.from(canvas);

    return result;
})();
const pauseButton = (() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const buttonWidth = 11
    const width = 33
    const height = 39
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, buttonWidth, height);
    ctx.fillRect(width - buttonWidth, 0, buttonWidth, height);

    const result = Texture.from(canvas);

    return result;
})();

const uk = (undefined as unknown) as any
export default class Game {
    sprites: any//{ [key: string]: Sprite }
    chart: Chart = uk
    effects: Effect[] = uk
    zipFiles: ResourceManger = uk
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
        pauseButton:Sprite
    } = {
            mainContainer: new Container(),
            parentNode: document.documentElement,
            gameContainer: new Container(),
            UIContainer: new Container(),
            mainContainerMask: new Graphics(),
            mainContainerCover: new Sprite(),
            fpsText: new Text(),
            sizer: ({} as any),
            bg: new Sprite(),
            pauseButton: new Sprite()
        }
    render: Application = uk
    judgement: Judgement = uk
    private functions: any
    private processors: any
    assets: PhiAssets = uk
    //private _params: GameParams = uk

    constructor() { }
    async init(_params: GameParams) {

        let params = { ..._params };

        if (!params.render) params.render = {};
        if (!params.settings) params.settings = {};

        /* ===== 加载谱面基本信息 ===== */

        this.assets = params.assets;
        this.zipFiles = params.zipFiles || new ResourceManger();
        let chart
        chart = params.chart.get(this.zipFiles)
        this.chart = chart.chart;
        this.chart.bg = chart.illustration
        this.chart.music = chart.music

        this.effects = (!!params.settings.shader && chart.prpr instanceof Array && chart.prpr.length > 0) ? chart.prpr : [];
        if (!this.chart) {
            printImage(0.5, () => { throw new Error('不是哥们，铺呢？') })
        }
        if (!this.assets) {
            printImage(0.5, () => { throw new Error('不是哥们，资源呢？') })
        }

        /* ===== 创建 render ===== */
        this.render = params.app
        this.renders.parentNode = (params.render.resizeTo ? params.render.resizeTo : (params.render.view ? params.render.view.parentNode : this.render.view.parentNode))! as HTMLElement;
        this.render.stage.width
        // 创建舞台主渲染区
        this.renders.mainContainer.zIndex = 10;
        this.render.stage.addChild(this.renders.mainContainer);

        // 创建游戏精灵容器
        this.renders.gameContainer = new Container();
        this.renders.gameContainer.zIndex = 20;
        this.renders.mainContainer.addChild(this.renders.gameContainer);

        // 创建 UI 容器
        this.renders.UIContainer = new Container();
        this.renders.UIContainer.zIndex = 30;
        this.renders.mainContainer.addChild(this.renders.UIContainer);

        // 创建舞台主渲染区可见范围
        this.renders.mainContainerMask = new Graphics();
        //this.renders.mainContainerMask.cacheAsBitmap = true;

        /* ===== 创建判定 ===== */
        this.judgement = new Judgement({
            chart: this.chart,
            stage: this.renders.UIContainer,
            canvas: this.render.canvas,
            assets: {
                textures: { normal: this.assets.hitFx, bad: this.assets.hitFx },
                sounds: {
                    tap: this.assets.sound.tap,
                    drag: this.assets.sound.drag,
                    flick: this.assets.sound.flick
                },
            },
            hitsound: verify.bool(params.settings.hitsound, true),
            hitsoundVolume: verify.number(params.settings.hitsoundVolume, 1, 0, 1),
            showAPStatus: verify.bool(params.settings.showAPStatus, true),
            challengeMode: verify.bool(params.settings.challengeMode, false),
            autoPlay: verify.bool(params.settings.autoPlay, false)
        });

        this.sprites = {};
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
        this.resize = this.resize.bind(this);

        if (this._settings.speed < 0.25) throw new Error('Speed too slow');
        else if (this._settings.speed > 2) throw new Error('Speed too fast');

        this.resize(false);
        //window.addEventListener('resize', () => this.resize);
        //this.renders.parentNode.addEventListener('resize', () => this.resize);
        //(this.render.view as HTMLCanvasElement).addEventListener('resize', () => this.resize);
        if (this._settings.autoPlay) window.addEventListener('keydown', () => this.onKeyPressCallback);
        if (_params.render.resizeTo) _params.render.resizeTo.append(this.render.view as HTMLCanvasElement)
        let tempEffects = this.effects.slice()
        tempEffects.forEach((e) => {
            let effect = this.effects[this.effects.indexOf(e)]
            if (effect.shader instanceof Shader) return;
            effect.shader = effect.shader as string
            let shaderName = (effect.shader.startsWith("/")) ? this.chart.rootPath + effect.shader : effect.shader
            let shaderRaw = this.zipFiles.get(shaderName) ? this.zipFiles.get(shaderName) : (Shader.presets as any)[shaderName]
            if (shaderRaw) { effect.shader = Shader.from(shaderRaw, shaderName) } else { this.effects.splice(this.effects.indexOf(effect), 1) }

        });

    }

    createSprites() {
        this.render.stage.eventMode = "static"
        this.renders.gameContainer.eventMode = "static"
        this.renders.mainContainer.eventMode = "static"
        this.renders.UIContainer.eventMode = "static"
        if (this.chart.bg) { // 创建超宽屏舞台覆盖
            this.renders.mainContainerCover = new Container();
            this.renders.bg = new Sprite(this.chart.bg)
            this.renders.mainContainerCover.zIndex = 1;
            this.renders.bg.anchor.set(0.5);
            this.renders.mainContainerCover.addChild(this.renders.bg)
            this.renders.mainContainerCover.blendMode = "none"
            this.renders.bg.alpha = this._settings.bgDim
            this.render.stage.addChild(this.renders.mainContainerCover);
        }

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
        this.sprites.progressBar = new Sprite(ProgressBarCache);
        this.sprites.progressBar.width = 0;
        this.sprites.progressBar.alpha = 0.75;
        this.sprites.progressBar.zIndex = 99999;
        this.renders.UIContainer.addChild(this.sprites.progressBar);

        // 暂停按钮
        this.renders.pauseButton = new Sprite(pauseButton);
        this.renders.pauseButton.eventMode = 'static';
        this.renders.pauseButton.cursor = 'pointer';
        this.renders.pauseButton.addEventListener('pointerdown', () => { console.log(114511); this.pauseBtnClickCallback });
        console.log(this.renders.pauseButton.isInteractive());
        //this.render.canvas.addEventListener("click", (e) => {
        //    let x = e.clientX - this.renders.sizer.widthOffset
        //    let y = e.clientY
        //    let sx = this.sprites.pauseButton.x - (this.sprites.pauseButton.texture.width * 1.5)
        //    let sy = this.sprites.pauseButton.y - (this.sprites.pauseButton.texture.height / 2)
        //    let ex = sx + this.sprites.pauseButton.texture.width * 2
        //    let ey = sy + this.sprites.pauseButton.texture.height * 2
        //    if (x >= sx && y >= sy) {
        //        if (x <= ex && y <= ey) {
        //            console.log(114511)
        //            this.pauseBtnClickCallback()
        //        }
        //    }
//
//
        //})
        //this.renders.fpsText.addEventListener("p")
        //this.sprites.pauseButton.hitArea = new Rectangle(
        //    -(this.sprites.pauseButton.texture.width * 1.5),
        //    -(this.sprites.pauseButton.texture.height / 2),
        //    this.sprites.pauseButton.texture.width * 2,
        //    this.sprites.pauseButton.texture.height * 2
        //);
        (this.renders.pauseButton as any).clickCount = 0;
        (this.renders.pauseButton as any).lastClickTime = Date.now();
        (this.renders.pauseButton as any).isEndRendering = false;
        (this.renders.pauseButton as any).lastRenderTime = Date.now();

        this.renders.pauseButton.anchor.set(1, 0);
        this.renders.pauseButton.alpha = 0.5;
        this.renders.pauseButton.zIndex = 99999;
        this.renders.UIContainer.addChild(this.renders.pauseButton);

        // 假判定线，过场动画用
        this.sprites.fakeJudgeline = new Sprite(this.assets.judgeLine);
        this.sprites.fakeJudgeline.anchor.set(0.5);
        this.sprites.fakeJudgeline.zIndex = 99999;
        if (this._settings.showAPStatus) this.sprites.fakeJudgeline.tint = 0xFFECA0;
        this.renders.UIContainer.addChild(this.sprites.fakeJudgeline);

        if (this._settings.showFPS) {
            this.renders.fpsText = new Text('FPS: 0', {
                fontFamily: font.fontName,
                align: 'right',
                fill: 0xFFFFFF
            });
            this.renders.fpsText = new Text({

            });
            this.renders.fpsText.anchor.x = 1;
            this.renders.fpsText.alpha = 0.5;
            this.renders.fpsText.zIndex = 999999;

            this.renders.UIContainer.addChild(this.renders.fpsText);
        }


        this.renders.gameContainer.sortChildren();
        this.renders.UIContainer.sortChildren();
        this.renders.mainContainer.sortChildren();
        this.render.stage.sortChildren();

    }

    start() {
        if (!this.render) return;
        if (!this.chart.music) throw new Error('You must have a music to play');
        this.renders.gameContainer.filters = []
        this.render.stage.filters = []
        this.renders.UIContainer.interactive = true
        this.renders.mainContainer.interactive = true
        //const newFilters = (this.renders.gameContainer.filters as Filter[]).slice()
        //newFilters.push(Shader.defaultFrag.filter)
        //this.renders.gameContainer.filters = newFilters
        this.resize();
        for (const effect of this.effects) effect.reset();

        if (this.renders.fpsText) {
            this.render.ticker.add(() => {
                this.renders.fpsText.text = 'FPS: ' + (this.render.ticker.FPS).toFixed(0)
            })
        }

        this.chart.music.speed = this._settings.speed;
        this.chart.music.onend = () => { console.log(114514); this.gameEndCallback() };

        this._animateStatus = 0;
        this._gameStartTime = Date.now();

        this.chart.noteJudgeCallback = this.judgement.calcNote;
        this.render.ticker.add(() => { this.calcTick() });

        for (const judgeline of this.chart.judgelines) {
            if (!judgeline.sprite) continue;

            judgeline.sprite.alpha = 0;
        };
        for (const note of this.chart.notes) {
            if (!note.sprite) continue;

            note.sprite.alpha = 0;
            if (note.hitsound) (note.hitsound as WAudio).volume = this.judgement._hitsoundVolume;
        };

        for (const name in this.judgement.sounds) {
            this.judgement.sounds[name].volume = this.judgement._hitsoundVolume;
        }
    }

    pause() {
        this._isPaused = !this._isPaused;
        this.judgement.input._isPaused = this._isPaused;
        
        if (!this._isPaused) {
            this._animateStatus = 1
            this.chart.music.pause();
            this.runCallback('pause');
        }
        else {
            this._animateStatus = 1
            this.chart.music.play();
        }
    }

    restart() {
        this.render.ticker.remove(() => { this.calcTick() });
        this.chart.music.reset();

        this.chart.reset();
        this.judgement.reset();

        this.resize();
        for (const effect of this.effects) effect.reset();

        this._isPaused = false;
        this._isEnded = false;

        this._animateStatus = 0;
        this._gameStartTime = Date.now();
        this._gameEndTime = NaN;

        this.render.ticker.add(() => { this.calcTick() });
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
        const canvas = this.render.view;

        this.render.ticker.remove(() => { this.calcTick() });
        this.chart.music.reset();

        if (this.renders.fpsText) this.render.ticker.remove(() => { this.renders.fpsText.text = 'FPS: ' + (this.render.ticker.FPS).toFixed(0) })

        this.chart.reset();
        this.chart.destroySprites();
        this.judgement.destroySprites();

        this.judgement.input.removeListenerFromCanvas(canvas as HTMLCanvasElement);

        window.removeEventListener('resize', () => this.resize);
        window.removeEventListener('keydown', () => this.onKeyPressCallback);

        canvas.width = canvas.height = 0;

        this.render.destroy(removeCanvas, { children: true, texture: false, textureSource: false });
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
        if (!this.render) return;

        this.render.renderer.resize(this.renders.parentNode.clientWidth, this.renders.parentNode.clientHeight);
        this.render.canvas.width = this.renders.parentNode.clientWidth
        this.render.canvas.height = this.renders.parentNode.clientHeight
        // 计算新尺寸相关数据
        this.renders.sizer = calcResizer(this.render.screen.width, this.render.screen.height, this._settings.noteScale, this._settings.resolution);

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
            let bgScaleWidth = this.render.screen.width / this.renders.bg.texture.width;
            let bgScaleHeight = this.render.screen.height / this.renders.bg.texture.height;
            let bgScale = bgScaleWidth > bgScaleHeight ? bgScaleWidth : bgScaleHeight;

            this.renders.mainContainerCover.scale.set(bgScale);
            this.renders.mainContainerCover.position.set(this.render.screen.width / 2, this.render.screen.height / 2);

            this.renders.mainContainerCover.visible = true;
        }
        else if (this.renders.mainContainerCover) {
            this.renders.mainContainerCover.visible = false;
        }

        if (!this._isEnded && this.sprites) {
            if (this.sprites.progressBar) {
                this.sprites.progressBar.position.set(0, 0);
                this.sprites.progressBar.scale.y = this.renders.sizer.heightPercent;
                this.sprites.progressBar.baseScaleX = this.renders.sizer.width / (this.sprites.progressBar as Sprite).texture.source.width;
            }

            if (this.renders.pauseButton) {
                this.renders.pauseButton.position.x = this.renders.sizer.width - this.renders.sizer.heightPercent * 72;
                this.renders.pauseButton.position.y = this.renders.sizer.heightPercent * (61 + 14);
                this.renders.pauseButton.scale.set(0.94 * this.renders.sizer.heightPercent);
            }

            if (this.sprites.fakeJudgeline) {
                this.sprites.fakeJudgeline.position.x = this.renders.sizer.width / 2;
                this.sprites.fakeJudgeline.position.y = this.renders.sizer.height / 2;

                this.sprites.fakeJudgeline.height = this.renders.sizer.lineScale * 18.75 * 0.008;
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
        }
    }

    gameTimeInSec() {
        return (Date.now() - this._gameStartTime) / 1000;
    }


    onKeyPressCallback(e: KeyboardEvent) {
        let keyCode = e.keyCode,
            isHoldCtrl = e.ctrlKey,
            isHoldShift = e.shiftKey,
            skipTime = 0;

        if (this._isPaused) return;
        if (!this._settings.autoPlay) return;
        if (this._animateStatus !== 1) return;

        switch (keyCode) {
            case 37: {
                skipTime = -2;
                break;
            }
            case 39: {
                skipTime = 2;
                break;
            }
            default: {
                return;
            }
        }

        if (isHoldCtrl && isHoldShift) skipTime *= 5;
        else if (isHoldCtrl) skipTime *= 2;
        else if (isHoldShift) skipTime *= 0.5;

        {
            let currentTime = this.chart.music.currentTime;
            let calcedNoteCount = 0;

            for (const note of this.chart.notes) {
                if (note.isFake) continue;
                if (note.score! <= 0) break;
                if (note.time < currentTime) {
                    calcedNoteCount++;
                    continue;
                }

                note.reset();
            }

            this.judgement.score.perfect = this.judgement.score.judgedNotes = this.judgement.score.combo = this.judgement.score.maxCombo = calcedNoteCount;
            this.judgement.score._score = (this.judgement.score.scorePerNote + this.judgement.score.scorePerCombo) * calcedNoteCount;

            if (this.judgement.score.sprites) {
                this.judgement.score.sprites.combo.number.text = this.judgement.score.combo;

                this.judgement.score.sprites.acc.text = 'ACCURACY ' + (this.judgement.score.acc * 100).toFixed(2) + '%';
                this.judgement.score.sprites.score.text = fillZero((this.judgement.score.score).toFixed(0), 7);

                this.judgement.score.sprites.combo.text.position.x = this.judgement.score.sprites.combo.number.width + this.renders.sizer.heightPercent * 6;
            }

            function fillZero(num: number | string, length = 3) {
                let result = num + '';
                while (result.length < length) {
                    result = '0' + result;
                }
                return result;
            }
        }

        this.chart.music.seek(skipTime);
    }

    pauseBtnClickCallback() {
        let pauseButton = this.renders.pauseButton as any;
        pauseButton.clickCount++;
        if (pauseButton.clickCount >= 2 && Date.now() - pauseButton.lastClickTime <= 2000) {
            this.pause();
            pauseButton.lastRenderTime = Date.now();
            pauseButton.isEndRendering = true;
            pauseButton.clickCount = 0;
        }
        pauseButton.lastClickTime = Date.now();
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
        this.render.stage.filters = []
        this.renders.gameContainer.filters = []
    }

    runCallback(type: string) {
        if (!this.functions[type]) return;
        this.functions[type].forEach((callback: (a: any) => any) => callback(this));
    }

    calcTick() {
        console.log(this.render.stage.filters, this.renders.gameContainer.filters)
        { // 为暂停按钮计算渐变
            let pauseButton = this.renders.pauseButton as any;
            if (pauseButton.clickCount === 1) {
                if (pauseButton.alpha < 1) { // 按钮刚被点击一次
                    pauseButton.alpha = 0.5 + (0.5 * ((Date.now() - pauseButton.lastClickTime) / 200));
                }
                else if (pauseButton.alpha >= 1 && Date.now() - pauseButton.lastClickTime >= 2000) { // 按钮刚被点击一次，且 2s 后没有进一步操作
                    pauseButton.clickCount = 0;
                    pauseButton.lastRenderTime = Date.now();
                    pauseButton.isEndRendering = true;
                }
                else if (pauseButton.alpha >= 1) { // 按钮被点击一次，且 200ms 后不透明度已到 1
                    pauseButton.alpha = 1;
                    pauseButton.lastRenderTime = Date.now();
                }
            }
            else if (pauseButton.clickCount === 0 && pauseButton.isEndRendering) {
                if (pauseButton.alpha > 0.5) {
                    pauseButton.alpha = 1 - (0.5 * ((Date.now() - pauseButton.lastRenderTime) / 200));
                }
                else if (pauseButton.alpha <= 0.5) {
                    pauseButton.alpha = 0.5;
                    pauseButton.lastRenderTime = Date.now();
                    pauseButton.isEndRendering = false;
                }
            }
        }

        switch (this._animateStatus) {
            case 0:
                {
                    this.calcGameAnimateTick(true);
                    break;
                }
            case 1:
                {

                    let { chart, effects, judgement, functions, processors, sprites, renders, _settings: settings, render } = this;
                    let currentTime = chart.music.currentTime - (chart.offset + settings.offset);
                    if (!this._isPaused) {
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


                        judgement.calcTick();
                        for (let x = 0, length = functions.tick.length; x < length; x++) functions.tick[x](this, currentTime);

                        if (settings.shader) {
                            renders.gameContainer.filters = [];
                            render.stage.filters = [];

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
                                if (!effect.isGlobal) {
                                    let temp:any = (render.stage.filters as Filter[]).slice()
                                    temp.push((effect.shader as Shader).filter)
                                    render.stage.filters = temp
                                } else {
                                    let temp = (renders.gameContainer.filters as Filter[]).slice()
                                    temp.push((effect.shader as Shader).filter)
                                    renders.gameContainer.filters = temp
                                }
                            }
                        }
                    }

                    sprites.progressBar.scale.x = chart.music.progress * sprites.progressBar.baseScaleX;

                    break;
                }
            case 2:
                {
                    this.calcGameAnimateTick(false);
                    break;
                }
            case 3:
                {
                    this.render.stage.filters = []
                    this.renders.gameContainer.filters = []
                    break;
                }
        }
    }

    calcGameAnimateTick(isStart = true) {
        let _progress = (Date.now() - (isStart ? this._gameStartTime : this._gameEndTime)) / 1500,
            progress = (isStart ? 1 - Math.pow(1 - _progress, 4) : Math.pow(1 - _progress, 4));
        let sprites = {
            score: this.judgement.score.sprites,
            chart: this.chart.sprites
        };

        // Combo、准度、分数、暂停按钮和进度条
        sprites.score.combo.container.position.y = -(sprites.score.combo.container.height + sprites.score.acc.height) + ((sprites.score.combo.container.height + sprites.score.acc.height + (this.renders.sizer.heightPercent * 41)) * progress);
        sprites.score.acc.position.y = sprites.score.combo.container.position.y + (this.renders.sizer.heightPercent * 72);
        sprites.score.score.position.y = -(sprites.score.score.height) + ((sprites.score.score.height + (this.renders.sizer.heightPercent * 61)) * progress);
        this.renders.pauseButton.position.y = -(this.renders.pauseButton.height) + ((this.renders.pauseButton.height + (this.renders.sizer.heightPercent * (61 + 14))) * progress);
        this.sprites.progressBar.position.y = -(this.renders.sizer.heightPercent * 12) * (1 - progress);

        // 谱面信息
        sprites.chart.info.songName.position.y = (this.renders.sizer.height + sprites.chart.info.songName.height) - ((sprites.chart.info.songName.height + (this.renders.sizer.heightPercent * 66)) * progress);
        sprites.chart.info.songDiff.position.y = sprites.chart.info.songName.position.y + (this.renders.sizer.heightPercent * 24);

        // 假判定线过场动画
        this.sprites.fakeJudgeline.width = this.renders.sizer.width * progress;

        // 背景图亮度
        if (this.chart.sprites.bg && this.chart.sprites.bg.cover) this.chart.sprites.bg.cover.alpha = this._settings.bgDim * progress;

        if (_progress >= 1) {
            if (isStart) {
                this._animateStatus = 1;
                this.resize(true, false);

                setTimeout(async () => {
                    this.chart.music.play(true);

                    for (const judgeline of this.chart.judgelines) {
                        if (!judgeline.sprite) continue;

                        judgeline.sprite.alpha = 1;
                    };
                    for (const note of this.chart.notes) {
                        if (note.sprite) note.sprite.alpha = note.basicAlpha;
                    };

                    this._isPaused = false;
                    this._isEnded = false;
                    this.sprites.fakeJudgeline.visible = false;

                    this.runCallback('start');
                }, 200);
            }
            else {
                this._animateStatus = 3;
                this._isPaused = true;
                this._isEnded = true;
                this.render.stage.filters = []
                this.renders.gameContainer.filters = []
                this.runCallback('end');
                this.renders.fpsText.alpha = 0
                //this.gameEndCallback()
            }
        }
    }
}

function calcResizer(width: number, height: number, noteScale = 8000, resolution = window.devicePixelRatio): SizerData {
    let result: any = {};

    result.shaderScreenSize = [width * resolution, height * resolution];

    result.width = height / 9 * 16 < width ? height / 9 * 16 : width;
    result.height = height;
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

    return result;
}
