import * as verify from '../verify';
import { Container, Sprite, Texture } from 'pixi.js';
import Judgeline from './judgeline';
import Audio from '../audio';
import { type PhiAssets, ResourceManager } from '../resource';
import type { jsonNoteData, NoteParam } from './types/note';
import { CONST } from '../types/const';


export default class Note {
    public id: number;
    public type: number;
    public time: number;
    public holdTime: number;
    public holdTimeLength: number;
    public speed: number;
    public floorPosition: number;
    public holdLength: number;
    public endPosition: number;
    public positionX: number;
    public basicAlpha: number;
    public visibleTime: number;
    public yOffset: number;
    public xScale: number;
    public isAbove: boolean;
    public isFake: boolean;
    public isMulti: boolean;
    public useOfficialSpeed: boolean;
    public texture: string | null;
    public hitsound: Audio | string | null;
    public judgeline: Judgeline;
    public isScored?: boolean;
    public isScoreAnimated?: boolean;
    public isHolding?: boolean;
    public lastHoldTime?: number;
    public score?: number;
    public scoreTime?: number;
    public outScreen?: boolean
    public baseScale: number = 1
    public judgelineX?: number
    public judgelineY?: number
    public sprite: Sprite | Container;
    public params: NoteParam
    public notCalc: boolean = false
    constructor(params: NoteParam) {
        this.params = params
        this.id = verify.number(params.id, -1, 0);
        this.type = verify.number(params.type, 1, 1, 4);
        this.time = verify.number(params.time, -1); // Note 开始时间
        this.holdTime = this.type === 3 ? verify.number(params.holdTime, 0) : 0; // Note 按住需要经过的时间，仅 Hold
        this.holdTimeLength = this.type === 3 ? parseFloat((this.time + this.holdTime).toFixed(20)) : 0; // Note 按完的时间，自动计算，仅 Hold
        this.speed = verify.number(params.speed, 1);
        this.floorPosition = verify.number(params.floorPosition, this.time);
        this.holdLength = this.type === 3 ? verify.number(params.holdLength, 0) : 0;
        this.endPosition = parseFloat((this.floorPosition + this.holdLength).toFixed(20));
        this.positionX = verify.number(params.positionX, 0);
        this.basicAlpha = verify.number(params.basicAlpha, 1, 0, 1);
        this.visibleTime = verify.number(params.visibleTime, NaN, 0, 999998);
        this.yOffset = verify.number(params.yOffset, 0);
        this.xScale = verify.number(params.xScale, 1, 0);
        this.isAbove = verify.bool(params.isAbove, true);
        this.isFake = verify.bool(params.isFake, false);
        this.isMulti = verify.bool(params.isMulti, false);
        this.useOfficialSpeed = verify.bool(params.useOfficialSpeed, false);
        this.texture = (params.texture && params.texture != '') ? params.texture : null;
        this.hitsound = (params.hitsound && params.hitsound != '') ? params.hitsound : null;
        this.judgeline = params.judgeline!;

        this.sprite = new Sprite();

        this.reset();
    }

    reset() {
        this.isScored = false;
        this.isScoreAnimated = false;
        this.isHolding = false;
        this.lastHoldTime = NaN;
        this.score = 0;
        this.scoreTime = 0;

        if (this.sprite) this.sprite.alpha = this.basicAlpha;
    }

    createSprite(texture: PhiAssets, zipFiles: ResourceManager, multiHL = true, _debug = false) {

        switch (this.type) {
            case 1:
                {
                    this.sprite = new Sprite(
                        this.texture && this.texture != '' ?
                            (zipFiles.get(this.texture) as Texture)! :
                            (this.isMulti && multiHL ? texture.note.tapMH : texture.note.tap)
                    );
                    break;
                }
            case 2:
                {
                    this.sprite = new Sprite(
                        this.texture && this.texture != '' ?
                            (zipFiles.get(this.texture) as Texture)! :
                            (this.isMulti && multiHL ? texture.note.dragMH : texture.note.drag)
                    );
                    break;
                }
            case 3:
                {
                    if (this.texture && this.texture != '') {
                        this.sprite = new Sprite((zipFiles.get(this.texture) as Texture)!);
                        (this.sprite as Sprite).anchor.set(0.5, 1);
                        this.sprite.height = this.holdLength;
                    }
                    else {
                        this.sprite = new Container();

                        let head = new Sprite((this.isMulti && multiHL ? texture.note.holdMH.head : texture.note.hold.head));
                        let body = new Sprite((this.isMulti && multiHL ? texture.note.holdMH.body : texture.note.hold.body));
                        let end = new Sprite((this.isMulti && multiHL ? texture.note.holdMH.end : texture.note.hold.end));

                        head.anchor.set(0.5);
                        body.anchor.set(0.5, 1);
                        end.anchor.set(0.5, 1);

                        body.height = this.holdLength;

                        head.position.set(0, head.height / 2);
                        body.position.set(0, 0);
                        end.position.set(0, -body.height);

                        this.sprite.addChild(head);
                        this.sprite.addChild(body);
                        this.sprite.addChild(end);
                    }
                    break;
                }
            case 4:
                {
                    this.sprite = new Sprite(
                        this.texture && this.texture != '' ?
                            (zipFiles.get(this.texture) as Texture)! :
                            (this.isMulti && multiHL ? texture.note.flickMH : texture.note.flick)
                    );
                    break;
                }
            default:
                {
                    throw new Error('Unsupported note type: ' + this.type);
                }
        }

        if (this.type !== 3) (this.sprite as Sprite).anchor.set(0.5);
        if (!this.isAbove) this.sprite.angle = 180;
        this.sprite.alpha = this.basicAlpha;
        this.sprite.visible = false;
        this.outScreen = true;

        if (this.hitsound) {
            this.hitsound = (zipFiles.get(this.hitsound as string) as Audio)!;
        }

        return this.sprite;
    }

    calcTime(currentTime: number, size: any) {
        if (this.notCalc) return
        if (this.isScoreAnimated && this.isScored && !this.isFake && this.type != CONST.NoteType.Hold) {
            this.notCalc = true
            this.sprite.destroy({
                texture: false,
                textureSource: false
            })
            return
        }
        let _yOffset = size.height * this.yOffset,
            yOffset = _yOffset * (this.isAbove ? -1 : 1),
            originX = size.widthPercent * this.positionX,
            _originY = (this.floorPosition - this.judgeline.floorPosition) * (this.type === 3 && this.useOfficialSpeed ? 1 : this.speed) * size.noteSpeed + _yOffset,
            originY = _originY * (this.isAbove ? -1 : 1),
            realX = originY * this.judgeline.sinr * -1,
            realY = originY * this.judgeline.cosr,
            _holdLength = this.type === 3 ? (this.useOfficialSpeed ? (this.holdTimeLength - currentTime) : (this.endPosition - this.judgeline.floorPosition)) * this.speed * size.noteSpeed : _originY,
            holdLength = this.type === 3 ? _holdLength * (this.isAbove ? -1 : 1) : originY;

        if (!isNaN(this.judgeline.inclineSinr) && this.type !== 3) {
            let inclineValue = 1 - ((this.judgeline.inclineSinr * _originY) / 360);
            this.sprite.scale.set(inclineValue * this.baseScale * this.xScale, inclineValue * this.baseScale);
            originX *= inclineValue;
        }
        if (this.type !== 3) {
            originX *= this.judgeline.calcNoteControl(_originY, 'x', 1);
        }
        if (this.type === 3) {
            if (this.time <= currentTime && this.holdTimeLength > currentTime) {
                realX = realY = 0;
                this.sprite.children[0].visible = false;
                (this.sprite.children[1] as Sprite).height = _holdLength / size.noteScale;
                this.sprite.children[2].position.y = (this.sprite.children[1] as Sprite).height * -1;
            }
            else {
                this.sprite.children[0].visible = true;
            }
        }
        this.judgelineX = originX * this.judgeline.cosr + this.judgeline.sprite.position.x;
        this.judgelineY = originX * this.judgeline.sinr + this.judgeline.sprite.position.y;
        realX += this.judgelineX!;
        realY += this.judgelineY!;
        this.judgelineX! += yOffset * this.judgeline.sinr * -1;
        this.judgelineY! += yOffset * this.judgeline.cosr;
        this.outScreen = !isInArea({
            startX: realX,
            endX: originX * this.judgeline.cosr - holdLength * this.judgeline.sinr + this.judgeline.sprite.position.x,
            startY: realY,
            endY: holdLength * this.judgeline.cosr + originX * this.judgeline.sinr + this.judgeline.sprite.position.y
        }, size);

        // 推送计算结果到精灵
        this.sprite.visible = !this.outScreen;
        if (this.outScreen) return

        this.sprite.position.x = realX;
        this.sprite.position.y = realY;
        this.sprite.angle = this.judgeline.sprite.angle + (this.isAbove ? 0 : 180);

        // Note 在舞台可视范围之内时做进一步计算
        if (!this.outScreen) {
            if (this.type !== 3) {
                let noteCtrlScale = this.judgeline.calcNoteControl(_originY, 'scale', 1);
                this.sprite.scale.set(this.baseScale * this.xScale * noteCtrlScale, this.baseScale * noteCtrlScale);
                this.sprite.alpha = this.isScoreAnimated ? 0 : this.basicAlpha * this.judgeline.calcNoteControl(_originY, 'alpha', 1);
            }
            else {
                this.sprite.alpha = this.isScored && this.score! <= 1 ? 0.5 : this.basicAlpha * this.judgeline.calcNoteControl(_originY, 'alpha', 1);
            }

            this.sprite.visible = (this.sprite.alpha > 0);

            // Note 特殊位置是否可视控制
            if (this.type !== 3 && this.time > currentTime && _originY < 0 && this.judgeline.isCover) this.sprite.visible = false;
            if (this.type !== 3 && this.isFake && this.time <= currentTime) this.sprite.visible = false;
            if (
                this.type === 3 &&
                (
                    (this.time > currentTime && _originY < 0 && this.judgeline.isCover) || // 时间未开始时 Hold 在判定线对面
                    (this.holdTimeLength <= currentTime) // Hold 已经被按完
                )
            ) this.sprite.visible = false;

            if (!isNaN(this.visibleTime) && this.time - currentTime > this.visibleTime) this.sprite.visible = false;

            if (this.judgeline.alpha < 0) {
                if (this.judgeline.alpha >= -1) this.sprite.visible = false;
                else if (this.judgeline.alpha >= -2) {
                    if (originY > 0) this.sprite.visible = false;
                    else if (originY < 0) this.sprite.visible = true;
                }
            }
        }
    }
    exportToJson() {
        return { ...this.params, judgeline: this.judgeline.id } as jsonNoteData
    }
    static from(data: jsonNoteData) {
        let note = new Note(data as any);
        note.judgelineX = undefined
        note.judgelineY = undefined
        note.outScreen = undefined
        return note
    }
};


function isInArea(sprite: any, area: any) {
    let startX = sprite.startX <= sprite.endX ? sprite.startX : sprite.endX,
        endX = sprite.startX <= sprite.endX ? sprite.endX : sprite.startX,
        startY = sprite.startY <= sprite.endY ? sprite.startY : sprite.endY,
        endY = sprite.startY <= sprite.endY ? sprite.endY : sprite.startY;

    if (
        (
            startX >= area.startX && startY >= area.startY &&
            endX <= area.endX && endY <= area.endY
        ) ||
        (
            endX >= area.startX && endY >= area.startY &&
            startX <= area.endX && startY <= area.endY
        )
    ) {
        return true;
    }
    else {
        return false;
    }
}