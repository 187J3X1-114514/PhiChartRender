import * as verify from '../verify';
import Input from './input';
import Score from './score';
import JudgePoint from './point';
import { Container, AnimatedSprite, Texture, Sprite } from 'pixi.js';
import Chart from '../chart';
import type { SizerData } from '../types/params';
import Note from '../chart/note';
import Audio from '../audio';
import { CONST } from '../types/const';
import { PhiNoteSound } from '../resource/resource_pack';
import PhiGame from '../game';
import { GlobalSettings } from '../global_setting';
const particleCountPerClickAnim = 4;

const AllJudgeTimes = {
    bad: 180,
    good: 160,
    perfect: 80,

    badChallenge: 90,
    goodChallenge: 75,
    perfectChallenge: 40
};

var ClickAnimatePointRect = true

var ClickAnimatePointCache: Texture;
(async () => {
    const pointSize = 16;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: true })!;

    canvas.width = canvas.height = pointSize * 2;
    ctx.clearRect(0, 0, pointSize * 2, pointSize * 2);
    ctx.beginPath();
    ctx.arc(pointSize, pointSize, pointSize, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    const result = Texture.from(await createImageBitmap(canvas));
    //result.defaultAnchor={x:0.5,y:0.5};

    //Texture.addToCache(result, 'clickAnimatePoint');

    ClickAnimatePointCache = result;
})();
(async () => {
    const pointSize = 16;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: true })!;

    canvas.width = canvas.height = pointSize * 2;
    ctx.clearRect(0, 0, pointSize * 2, pointSize * 2);
    ctx.beginPath();
    ctx.rect(0, 0, pointSize * 2, pointSize * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    const result = Texture.from(await createImageBitmap(canvas));
    //result.defaultAnchor={x:0.5,y:0.5};


    //Texture.addToCache(result, 'clickAnimatePoint');

    if (ClickAnimatePointRect) ClickAnimatePointCache = result;
})();

export default class Judgement {
    private chart: Chart;
    public stage: Container;
    private textures: any;
    public sounds: PhiNoteSound;
    private _autoPlay: boolean;
    private _hitsound: boolean;
    public _hitsoundVolume: number;
    public score: Score;
    public input: Input;
    private judgeTimes: any;
    private judgePoints: JudgePoint[] = [];
    public clickParticleContainer: Container = new Container();
    private badNoteContainer: Container<BadNoteSprite> = new Container<BadNoteSprite>();
    private renderSize: SizerData = undefined as any;
    private _clickAnimBaseScale: any;
    public holdBetween: number = 0;
    private currentTime: number = 0
    private anims: AnimatedSprite[] = []
    private game: PhiGame
    private playing_hitsound = 0
    private particleCount = 0
    private hitAnimationCount = 0
    constructor(params: any = {}) {
        this.chart = params.chart;
        this.stage = params.stage;
        this.game = params.game;
        this.textures = params.assets.textures;
        this.sounds = params.assets.sounds;
        this._autoPlay = verify.bool(params.autoPlay, false);
        this._hitsound = verify.bool(params.hitsound, true);
        this._hitsoundVolume = verify.number(params.hitsoundVolume, 1, 0, 1);

        this.score = new Score(this.chart.totalRealNotes, verify.bool(params.showAPStatus, true), verify.bool(params.challangeMode, false), this._autoPlay);
        this.input = new Input({ canvas: params.canvas, autoPlay: this._autoPlay, record: this.game.settings.recordMode });
        this.input.onchange = () => this.calcInput
        /* ===== 判定用时间计算 ===== */
        this.judgeTimes = {
            perfect: (!params.challangeMode ? AllJudgeTimes.perfect : AllJudgeTimes.perfectChallenge) / 1000,
            good: (!params.challangeMode ? AllJudgeTimes.good : AllJudgeTimes.goodChallenge) / 1000,
            bad: (!params.challangeMode ? AllJudgeTimes.bad : AllJudgeTimes.badChallenge) / 1000
        };

        this.reset();
    }

    reset() {
        this.playing_hitsound = 0
        this.particleCount = 0
        this.hitAnimationCount = 0
        this.judgePoints = [];
        this.score.reset();
        this.input.reset();

        this.holdBetween = 0.15;

        if (this.clickParticleContainer) this.clickParticleContainer.removeChildren();
    }

    createSprites(showInputPoint = true) {
        this.clickParticleContainer.zIndex = 99999;
        this.stage.addChild(this.clickParticleContainer);
        this.badNoteContainer.zIndex = 99998;
        this.stage.addChild(this.badNoteContainer);

        this.score.createSprites(this.stage);
        this.input.createSprite(this.stage, showInputPoint);

        this._clickAnimBaseScale = {
            normal: 256 / this.textures.normal[0].width
        };
    }

    resizeSprites(size: SizerData, isEnded: boolean) {
        this.input.setRenderSize(size)
        this.renderSize = size;
        this.score.resizeSprites(size, isEnded);
        this.input.resizeSprites(size);
    }

    calcTick(currentTime: number) {
        this.currentTime = currentTime * 1000
        this.createJudgePoints();
        this.updateAnimations()
        this.input.calcTick();

        for (let i = 0, length = this.clickParticleContainer.children.length; i < length; i++) {
            const particle: any = this.clickParticleContainer.children[i];
            if (!particle) break;
            const currentTimeProgress = (this.currentTime - particle.startTime) / 500;

            if (currentTimeProgress >= 1) {
                this.clickParticleContainer.removeChild(particle);
                this.particleCount = this.particleCount - 1
                particle.destroy(false);
                continue;
            }

            particle.alpha = 1 - currentTimeProgress;

            particle.scale.set((((0.2078 * currentTimeProgress - 1.6524) * currentTimeProgress + 1.6399) * currentTimeProgress + 0.4988) * particle.baseScale);
            particle.distance = particle._distance * (9 * currentTimeProgress / (8 * currentTimeProgress + 1)) * 0.6 * particle.baseScale;

            particle.position.x = particle.distance * particle.cosr - particle.distance * particle.sinr + particle.basePos.x;
            particle.position.y = particle.distance * particle.cosr + particle.distance * particle.sinr + particle.basePos.y;
            particle.visible = true
        }
        for (let i = 0, length = this.badNoteContainer.children.length; i < length; i++) {
            const sprite: BadNoteSprite = this.badNoteContainer.children[i]
            if (!sprite) break;
            const currentTimeProgress = (this.currentTime - sprite.startTime) / 500;
            if (currentTimeProgress >= 1) {
                sprite.destroy(false)
                continue;
            }
            sprite.alpha = 1 - currentTimeProgress

        }
    }

    updateAnimations() {
        let animations = this.anims.slice(0, this.anims.length);
        animations.forEach((animation) => {
            let startTime = (animation as any).startTime;
            let totalFrames = animation.totalFrames;
            let currentFrame = Math.round(((this.currentTime - startTime) / 1000) / ((totalFrames / 60) / totalFrames));
            if (currentFrame >= totalFrames) {
                this.hitAnimationCount--
                animation.destroy();
                this.anims.splice(this.anims.indexOf(animation), 1);
            } else {
                animation.currentFrame = currentFrame;
            }
            animation.alpha = 1 - (animation.currentFrame / animation.totalFrames);
        });
    }

    createJudgePoints() {
        this.judgePoints.length = 0;

        if (!this._autoPlay) {
            for (let i = 0, length = this.input.inputs.length; i < length; i++) {
                let inputPoint = this.input.inputs[i];

                if (!inputPoint.isTapped) this.judgePoints.push(new JudgePoint(inputPoint, 1));
                if (inputPoint.isActive) this.judgePoints.push(new JudgePoint(inputPoint, 3));
                if (inputPoint.isFlickable) this.judgePoints.push(new JudgePoint(inputPoint, 2));
            }
        }
    }

    pushNoteJudge(note: Note) {
        this.score.pushJudge(note.score, this.chart.judgelines);
        if (note.score! >= 2) {
            this.createClickAnimate(note);
            if (note.score! >= 3) this.playHitsound(note);
        }
    }

    createClickAnimate(note: Note) {
        if (note.score! >= 3) {
            if (this.anims.length < GlobalSettings.maxHitAnimationCount!) {
                let anim = new AnimatedSprite(this.textures.normal, false),
                    baseScale = this.renderSize.noteScale * 5.6;
                (anim as any).startTime = this.currentTime
                this.anims.push(anim)
                if (note.score! >= 3 && note.type != CONST.NoteType.Hold) anim.position.set(note.judgelineX, note.judgelineY);
                else anim.position.copyFrom(note.sprite.position);

                anim.scale.set((this._clickAnimBaseScale.normal) * baseScale);
                anim.tint = note.score === 4 ? 0xFFECA0 : note.score === 3 ? 0xB4E1FF : 0x6c4343;
                anim.anchor.set(0.5, 0.5)
                anim.loop = false;

                if (note.score! >= 3) {
                    let currentParticleCount = 0;
                    while (currentParticleCount < particleCountPerClickAnim) {
                        if (GlobalSettings.maxHitParticleCount! < this.particleCount) break;
                        let particle: any = new Sprite(ClickAnimatePointCache);
                        (particle as Sprite).anchor.set(0.5, 0.5)
                        particle.tint = note.score === 4 ? 0xFFECA0 : 0xB4E1FF;

                        particle.startTime = this.currentTime;
                        particle.basePos = anim.position;
                        particle.baseScale = baseScale;

                        particle.distance = particle._distance = Math.random() * 100 + 250;
                        particle.direction = Math.floor(Math.random() * 360);
                        particle.sinr = Math.sin(particle.direction);
                        particle.cosr = Math.cos(particle.direction);
                        (particle as Sprite).visible = false
                        this.clickParticleContainer.addChild(particle);

                        currentParticleCount++;
                        this.particleCount++
                    }
                }
                else {
                    anim.angle = note.sprite.angle;
                }
                this.stage.addChild(anim);
                return
            }
        }
        if (note.type == CONST.NoteType.Tap) {
            let sprite = new BadNoteSprite(this.textures.bad)
            sprite.scale.copyFrom(note.sprite.scale)
            sprite.position.copyFrom(note.sprite.position)
            sprite.anchor.copyFrom((note.sprite as Sprite).anchor)
            sprite.angle = note.sprite.angle
            sprite.startTime = (note.time - note.scoreTime!) * 1000
            this.badNoteContainer.addChild(sprite);
        }
    }

    playHitsound(note: Note) {
        if (!this._hitsound) return;
        if (note.hitsound) (note.hitsound as Audio).play();
        else {
            if (this.playing_hitsound <= GlobalSettings.maxHitSoundEffectCount!) {
                this.playing_hitsound++
                switch (note.type) {
                    case CONST.NoteType.Tap:
                        {
                            this.sounds.tap.play();
                            setInterval(() => { this.playing_hitsound-- }, this.sounds.tap.duration * 1000)
                            break;
                        }
                    case CONST.NoteType.Hold:
                        {
                            this.sounds.hold.play();
                            setInterval(() => { this.playing_hitsound-- }, this.sounds.hold.duration * 1000)
                            break;
                        }
                    case CONST.NoteType.Drag:
                        {
                            this.sounds.drag.play();
                            setInterval(() => { this.playing_hitsound-- }, this.sounds.drag.duration * 1000)
                            break;
                        }
                    case CONST.NoteType.Flick:
                        {
                            this.sounds.flick.play();
                            setInterval(() => { this.playing_hitsound-- }, this.sounds.flick.duration * 1000)
                            break;
                        }
                }
            }
        }
    }

    destroySprites() {
        this.reset();

        this.clickParticleContainer.destroy({ children: true, texture: false, textureSource: false });

        this.input.destroySprites();
        this.score.destroySprites();
    }

    calcInput() {
    }

    calcNote(currentTime: number, note: Note) {
        if (note.isFake) return; // 忽略假 Note
        if (note.isScored && note.isScoreAnimated) return; // 已记分忽略
        if (note.time - this.judgeTimes.bad > currentTime) return; // 不在记分范围内忽略

        if (!note.isScored) {
            if (note.type !== 3 && note.time + this.judgeTimes.bad < currentTime) {
                note.isScored = true;
                note.score = 1;
                note.scoreTime = NaN;

                this.score.pushJudge(0, this.chart.judgelines);

                note.sprite.alpha = 0;
                note.isScoreAnimated = true;

                return;
            }
            else if (note.type === 3 && note.time + this.judgeTimes.good < currentTime) {
                note.isScored = true;
                note.score = 1;
                note.scoreTime = NaN;

                this.score.pushJudge(0, this.chart.judgelines);

                note.sprite.alpha = 0.5;
                note.isScoreAnimated = true;

                return;
            }
        }


        let timeBetween = note.time - currentTime,
            timeBetweenReal = timeBetween > 0 ? timeBetween : timeBetween * -1,
            judgeline = note.judgeline,
            notePosition = note.sprite.position;

        if (note.type !== 3 && !note.isScoreAnimated && note.time <= currentTime) {
            note.sprite.alpha = 1 + (timeBetween / this.judgeTimes.bad);
        }

        // 自动模式则自行添加判定点
        if (this._autoPlay) {
            let input = { x: notePosition.x, y: notePosition.y, isFlicked: false };

            if (note.type === 1) {
                if (timeBetween <= 0) this.judgePoints.push(new JudgePoint(input, 1));
            } else if (note.type === 2) {
                if (timeBetween <= this.judgeTimes.bad) this.judgePoints.push(new JudgePoint(input, 3));
            } else if (note.type === 3) {
                if (!note.isScored && timeBetween <= 0) this.judgePoints.push(new JudgePoint(input, 1));
                else if (note.isScored && currentTime - note.lastHoldTime! >= this.holdBetween) this.judgePoints.push(new JudgePoint(input, 3));
            } else if (note.type === 4) {
                if (timeBetween <= this.judgeTimes.bad) this.judgePoints.push(new JudgePoint(input, 2));
            }
        }

        switch (note.type) {
            case CONST.NoteType.Tap:
                {
                    for (let i = 0, length = this.judgePoints.length; i < length; i++) {
                        if (
                            this.judgePoints[i].type === 1 &&
                            this.judgePoints[i].isInArea(notePosition.x, notePosition.y, judgeline.cosr, judgeline.sinr, this.renderSize.noteWidth)
                        ) {
                            if (timeBetweenReal <= this.judgeTimes.bad) {
                                note.isScored = true;
                                note.scoreTime = timeBetween;

                                if (timeBetweenReal <= this.judgeTimes.perfect || this._autoPlay) note.score = 4;
                                else if (timeBetweenReal <= this.judgeTimes.good) note.score = 3;
                                else note.score = 2;
                            }

                            if (note.isScored) {
                                this.pushNoteJudge(note);
                                note.sprite.alpha = 0;
                                note.isScoreAnimated = true;

                                this.judgePoints.splice(i, 1);
                                break;
                            }
                        }
                    }

                    break;
                }
            case CONST.NoteType.Drag:
                {
                    if (note.isScored && !note.isScoreAnimated && timeBetween <= 0) {
                        this.pushNoteJudge(note);
                        note.sprite.alpha = 0;
                        note.isScoreAnimated = true;
                    }
                    else if (!note.isScored) {
                        for (let i = 0, length = this.judgePoints.length; i < length; i++) {
                            if (
                                this.judgePoints[i].isInArea(notePosition.x, notePosition.y, judgeline.cosr, judgeline.sinr, this.renderSize.noteWidth) &&
                                timeBetweenReal <= this.judgeTimes.good
                            ) {
                                note.isScored = true;
                                note.score = 4;
                                note.scoreTime = NaN;
                                break;
                            }
                        }
                    }

                    break;
                }
            case CONST.NoteType.Hold:
                {
                    if (note.isScored) {
                        if (currentTime - note.lastHoldTime! >= this.holdBetween) {
                            this.createClickAnimate(note);
                        }

                        if (note.holdTimeLength - currentTime <= this.judgeTimes.bad) {
                            this.score.pushJudge(note.score, this.chart.judgelines);
                            note.isScoreAnimated = true;
                            break;
                        }

                        if (currentTime - note.lastHoldTime! >= this.holdBetween) {
                            note.lastHoldTime = currentTime;
                            note.isHolding = false;
                        }
                    }

                    for (let i = 0, length = this.judgePoints.length; i < length; i++) {
                        if (
                            !note.isScored &&
                            this.judgePoints[i].type === 1 &&
                            this.judgePoints[i].isInArea(notePosition.x, notePosition.y, judgeline.cosr, judgeline.sinr, this.renderSize.noteWidth) &&
                            timeBetweenReal <= this.judgeTimes.good
                        ) {
                            note.isScored = true;
                            note.scoreTime = timeBetween;

                            if (timeBetweenReal <= this.judgeTimes.perfect || this._autoPlay) note.score = 4;
                            else note.score = 3;

                            this.createClickAnimate(note);
                            this.playHitsound(note);

                            note.isHolding = true;
                            note.lastHoldTime = currentTime;

                            this.judgePoints.splice(i, 1);
                            break;
                        }
                        else if (this.judgePoints[i].isInArea(notePosition.x, notePosition.y, judgeline.cosr, judgeline.sinr, this.renderSize.noteWidth)) {
                            note.isHolding = true;
                        }
                    }

                    if (!(this as any).paused && note.isScored && !note.isHolding) {
                        note.score = 1;
                        note.scoreTime = NaN;

                        this.score.pushJudge(1, this.chart.judgelines);

                        note.sprite.alpha = 0.5;
                        note.isScoreAnimated = true;
                    }

                    break;
                }
            case CONST.NoteType.Flick:
                {
                    if (note.isScored && !note.isScoreAnimated && timeBetween <= 0) {
                        this.pushNoteJudge(note);
                        note.sprite.alpha = 0;
                        note.isScoreAnimated = true;
                    }
                    else if (!note.isScored) {
                        for (let i = 0, length = this.judgePoints.length; i < length; i++) {
                            if (
                                this.judgePoints[i].type === 2 &&
                                this.judgePoints[i].isInArea(notePosition.x, notePosition.y, judgeline.cosr, judgeline.sinr, this.renderSize.noteWidth) &&
                                timeBetweenReal <= this.judgeTimes.good
                            ) {
                                note.isScored = true;
                                note.score = 4;
                                note.scoreTime = NaN;
                                this.judgePoints[i].input.isFlicked = true

                                break;
                            }
                        }
                    }

                    break;
                }
        }
    }
}

class BadNoteSprite extends Sprite {
    public startTime: number = NaN
}