import { number as verifyNum } from '../verify';
import * as Convert from './convert';
import md5Hash from 'md5-js';
import { Sprite, Graphics, Text, Texture, BlurFilter } from 'pixi.js';
import Judgeline from './judgeline';
import Note from './note';
import { bpmEvent } from './baseEvents';
import WAudio from '../audio';
import * as font from '../font'
import { PhiAssets, ResourceManger } from '../resource';

export default class Chart {
    judgelines: Judgeline[]
    notes: Note[]
    bpmList: bpmEvent[]
    offset: number
    isLineTextureReaded: boolean
    music: WAudio
    info: any
    sprites: any
    bg: Texture
    holdBetween: number = 0
    bgCover?: Graphics
    renderSize: any
    public rootPath:string = ""
    noteJudgeCallback?: (currentTime: any, note: any) => void
    constructor(params: any = {}) {
        this.judgelines = [];
        this.notes = [];
        this.bpmList = [];
        this.offset = verifyNum(params.offset, 0);
        this.isLineTextureReaded = false;

        this.music = params.music ? params.music : null;
        this.bg = params.bg ? params.bg : null;

        this.info = {
            name: params.name,
            artist: params.artist,
            author: params.author,
            bgAuthor: params.bgAuthor,
            difficult: params.difficult,
            md5: params.md5
        };

        this.sprites = {};
    }

    static from(rawChart: any, music?: WAudio, _chartInfo = {}, _chartLineTexture = []) {
        let chart: Chart = null as unknown as Chart;
        let chartInfo: any = _chartInfo;
        let chartMD5;

        if (typeof rawChart == 'object') {
            if (!isNaN(Number(rawChart.formatVersion))) {
                chart = Convert.Official(rawChart);
            }
            else if (rawChart.META && !isNaN(Number(rawChart.META.RPEVersion))) {
                chart = Convert.RePhiEdit(rawChart);
                chartInfo = chart.info;
            }

            try {
                chartMD5 = md5Hash(JSON.stringify(rawChart));
            } catch (e) {
                console.warn('Failed to calculate chart MD5.');
                console.error(e);
                chartMD5 = null
            }
        }
        else if (typeof rawChart == 'string') {
            chart = Convert.PhiEdit(rawChart)!;
            try {
                chartMD5 = md5Hash(rawChart);
            } catch (e) {
                console.warn('Failed to calculate chart MD5.');
                console.error(e);
                chartMD5 = null
            }
        }

        if (!chart) throw new Error('Unsupported chart format');

        chart.info = {
            name: chartInfo.name,
            artist: chartInfo.artist,
            author: chartInfo.author,
            bgAuthor: chartInfo.bgAuthor,
            difficult: chartInfo.difficult,
            md5: chartMD5
        };

        chart.judgelines.forEach((judgeline) => {
            judgeline.eventLayers.forEach((eventLayer) => {
                /* eventLayer.speed = utils.arrangeSameSingleValueEvent(eventLayer.speed); */
                eventLayer.moveX = arrangeLineEvents(eventLayer.moveX);
                eventLayer.moveY = arrangeLineEvents(eventLayer.moveY);
                eventLayer.rotate = arrangeLineEvents(eventLayer.rotate);
                eventLayer.alpha = arrangeLineEvents(eventLayer.alpha);
            });

            for (const name in judgeline.extendEvent) {
                if (name !== 'color' && name !== 'text')
                    (judgeline.extendEvent as any)[name] = arrangeLineEvents((judgeline.extendEvent as any)[name]);
                else
                    judgeline.extendEvent[name] = arrangeSingleValueLineEvents(judgeline.extendEvent[name]);
            }

            judgeline.sortEvent();
        });

        chart.readLineTextureInfo(_chartLineTexture);

        chart.judgelines.sort((a, b) => {
            if (a.parentLine && b.parentLine) {
                return a.parentLine.id - b.parentLine.id;
            }
            else if (a.parentLine) {
                return 1;
            }
            else if (b.parentLine) {
                return -1;
            }
            else {
                return a.id - b.id;
            }
        });

        // console.log(chart);
        if (music) chart.music = music
        return chart;
    }

    readLineTextureInfo(infos = []) {
        if (this.isLineTextureReaded) return;
        if (infos.length <= 0) return;

        let isReaded = false;

        infos.forEach((lineInfo: any) => {
            if (!this.judgelines[lineInfo.LineId]) return;

            this.judgelines[lineInfo.LineId].texture = lineInfo.Image;
            this.judgelines[lineInfo.LineId].useOfficialScale = true;
            this.judgelines[lineInfo.LineId].scaleX = !isNaN(lineInfo.Horz) ? parseFloat(lineInfo.Horz) : 1;
            this.judgelines[lineInfo.LineId].scaleY = !isNaN(lineInfo.Vert) ? parseFloat(lineInfo.Vert) : 1;

            this.judgelines[lineInfo.LineId].extendEvent.scaleX.push({
                startTime: 1 - 1000,
                endTime: 1000,
                start: this.judgelines[lineInfo.LineId].scaleX,
                end: this.judgelines[lineInfo.LineId].scaleX
            });

            this.judgelines[lineInfo.LineId].extendEvent.scaleY.push({
                startTime: 1 - 1000,
                endTime: 1000,
                start: this.judgelines[lineInfo.LineId].scaleY,
                end: this.judgelines[lineInfo.LineId].scaleY
            });

            isReaded = true;
        });

        if (isReaded) this.isLineTextureReaded = true;
    }

    createSprites(stage: any, size: any, textures: PhiAssets, uiStage: any = null, zipFiles = new ResourceManger(), speed = 1, bgDim = 0.5, multiNoteHL = true, debug = false) {
        console.log(0)

        if (this.bg) {
            this.sprites.bg = new Sprite(this.bg);

            this.bgCover = new Graphics();
            this.bgCover.rect(0, 0, this.sprites.bg.texture.width, this.sprites.bg.texture.height).fill({
                color:0x000000
            })

            this.bgCover.position.x = -this.sprites.bg.width / 2;
            this.bgCover.position.y = -this.sprites.bg.height / 2;
            this.sprites.bg.alpha = bgDim;
            this.bgCover.zIndex = -1
            this.sprites.bg.anchor.set(0.5);
            this.sprites.bg.blendMode = "none"
            this.sprites.bg.filters = [new BlurFilter({
                strength:15,quality:10
            })]
            stage.addChild(this.sprites.bg);
        }

        this.judgelines.forEach((judgeline, _index) => {
            judgeline.createSprite(textures, zipFiles, this.rootPath);

            judgeline.sprite.position.x = size.width / 2;
            judgeline.sprite.position.y = size.height / 2;
            judgeline.sprite.zIndex = 10 + judgeline.zIndex;

            stage.addChild(judgeline.sprite);

            if (judgeline.texture && judgeline.useOfficialScale) {
                let oldScaleY = judgeline.extendEvent.scaleY[0].start;

                judgeline.extendEvent.scaleY[0].start = judgeline.extendEvent.scaleY[0].end = (1080 / (judgeline.sprite as Sprite).texture.height) * (oldScaleY * (oldScaleY < 0 ? -1 : 1));
                judgeline.extendEvent.scaleX[0].start = judgeline.extendEvent.scaleX[0].end = judgeline.extendEvent.scaleY[0].start * judgeline.extendEvent.scaleX[0].start;

                judgeline.useOfficialScale = false;
            }
        });

        this.notes.forEach((note, _index) => {
            note.createSprite(textures, zipFiles, multiNoteHL, debug);

            note.sprite.zIndex = 10 + note.judgeline.id + 1 + (note.type === 3 ? 0 : 10);

            stage.addChild(note.sprite);
        });

        this.sprites.info = {};

        this.sprites.info.songName = new Text((this.info.name || 'Untitled') + ((Math.round(speed * 100) !== 100) ? ' (x' + speed.toFixed(2) + ')' : ''), {
            fontFamily: font.fontName,
            fill: 0xFFFFFF
        });
        this.sprites.info.songName.anchor.set(0, 1);
        this.sprites.info.songName.zIndex = 99999;

        if (uiStage) uiStage.addChild(this.sprites.info.songName);
        else stage.addChild(this.sprites.info.songName);


        this.sprites.info.songDiff = new Text((this.info.difficult || 'SP Lv.?'), {
            fontFamily: font.fontName,
            fill: 0xFFFFFF
        });
        this.sprites.info.songDiff.anchor.set(0, 1);
        this.sprites.info.songDiff.zIndex = 99999;

        if (uiStage) uiStage.addChild(this.sprites.info.songDiff);
        else stage.addChild(this.sprites.info.songDiff);
    }

    resizeSprites(size: any, isEnded: any) {
        this.renderSize = size;

        if (this.sprites.bg) {
            let bgScaleWidth = this.renderSize.width / this.sprites.bg.texture.width;
            let bgScaleHeight = this.renderSize.height / this.sprites.bg.texture.height;
            let bgScale = bgScaleWidth > bgScaleHeight ? bgScaleWidth : bgScaleHeight;

            this.sprites.bg.scale.set(bgScale);
            this.sprites.bg.position.set(this.renderSize.width / 2, this.renderSize.height / 2);
        }

        if (this.judgelines && this.judgelines.length > 0) {
            this.judgelines.forEach((judgeline) => {
                if (!judgeline.sprite) return;

                if (judgeline.isText) {
                    (judgeline.sprite as Text).style.fontSize = 68 * this.renderSize.heightPercent;
                    judgeline.baseScaleX = judgeline.baseScaleY = 1;
                }
                else if (judgeline.texture) {
                    judgeline.baseScaleX = judgeline.baseScaleY = this.renderSize.heightPercent;
                }
                else {
                    judgeline.baseScaleX = (4000 / (judgeline.sprite as Sprite).texture.width) * (this.renderSize.width / 1350);
                    judgeline.baseScaleY = ((this.renderSize.lineScale * 18.75 * 0.008) / (judgeline.sprite as Sprite).texture.height);
                }

                judgeline.sprite.scale.set(judgeline.scaleX * judgeline.baseScaleX, judgeline.scaleY * judgeline.baseScaleY);

                judgeline.sprite.position.x = judgeline.x * this.renderSize.width;
                judgeline.sprite.position.y = judgeline.y * this.renderSize.height;

                for (const name in judgeline.noteControls) {
                    for (const control of (judgeline.noteControls as any)[name]) {
                        control.y = control._y * size.height
                    }
                }

                if (isEnded) judgeline.sprite.alpha = 0;

            });
        }

        if (this.notes && this.notes.length > 0) {
            this.notes.forEach((note) => {

                if (note.type === 3) {
                    let holdLength = note.holdLength * (note.useOfficialSpeed ? 1 : note.speed) * this.renderSize.noteSpeed / this.renderSize.noteScale;
                    (note.sprite.children[1] as Sprite).height = holdLength;
                    note.sprite.children[2].position.y = -holdLength;
                }

                note.baseScale = this.renderSize.noteScale;
                note.sprite.scale.set(this.renderSize.noteScale * note.xScale, this.renderSize.noteScale);
                if (isEnded) note.sprite.alpha = 0;
            });
        }

        this.sprites.info.songName.style.fontSize = size.heightPercent * 27;
        this.sprites.info.songName.position.x = size.heightPercent * 57;
        this.sprites.info.songName.position.y = size.height - size.heightPercent * 66;

        this.sprites.info.songDiff.style.fontSize = size.heightPercent * 20;
        this.sprites.info.songDiff.position.x = size.heightPercent * 57;
        this.sprites.info.songDiff.position.y = size.height - size.heightPercent * 42;
    }

    reset() {
        this.holdBetween = this.bpmList[0].holdBetween;

        this.judgelines.forEach((judgeline) => {
            judgeline.reset();
        });
        this.notes.forEach((note) => {
            note.reset();
        });
    }

    destroySprites() {
        this.judgelines.forEach((judgeline) => {
            if (!judgeline.sprite) return;
            judgeline.reset();
            judgeline.sprite.destroy();
            judgeline.sprite = undefined as unknown as Sprite;

        });
        this.notes.forEach((note) => {
            if (!note.sprite) return;
            note.reset();
            note.sprite.destroy();
            note.sprite = undefined as unknown as Sprite
        });

        if (this.sprites.bg) {
            this.sprites.bg.destroy();
            this.sprites.bg = undefined;
        }

        this.sprites.info.songName.destroy();
        this.sprites.info.songName = undefined;

        this.sprites.info.songDiff.destroy();
        this.sprites.info.songDiff = undefined;

        this.sprites.info = undefined;
    }

    get totalNotes() {
        return this.notes.length;
    }

    get totalRealNotes() {
        let result = 0;
        this.notes.forEach((note) => {
            if (!note.isFake) result++;
        });
        return result;
    }

    get totalFakeNotes() {
        let result = 0;
        this.notes.forEach((note) => {
            if (note.isFake) result++;
        });
        return result;
    }
}


function arrangeLineEvents(events: any) {
    let oldEvents = events.slice();
    let newEvents2 = [];
    let newEvents = [{ // 以 -99 开始
        startTime: -99,
        endTime: 0,
        start: oldEvents[0] ? oldEvents[0].start : 0,
        end: oldEvents[0] ? oldEvents[0].start : 0
    }];

    if (events.length <= 0) return [];

    oldEvents.push({ // 以 1000 结束
        startTime: 0,
        endTime: 1e3,
        start: oldEvents[oldEvents.length - 1] ? oldEvents[oldEvents.length - 1].end : 0,
        end: oldEvents[oldEvents.length - 1] ? oldEvents[oldEvents.length - 1].end : 0
    });

    // 保证时间连续性
    for (let oldEvent of oldEvents) {
        let lastNewEvent = newEvents[newEvents.length - 1];

        if (oldEvent.endTime < oldEvent.startTime) {
            let newStartTime = oldEvent.endTime,
                newEndTime = oldEvent.startTime;

            oldEvent.startTime = newStartTime;
            oldEvent.endTime = newEndTime;
        }

        if (lastNewEvent.endTime < oldEvent.startTime) {
            newEvents.push({
                startTime: lastNewEvent.endTime,
                endTime: oldEvent.startTime,
                start: lastNewEvent.end,
                end: lastNewEvent.end
            }, oldEvent);
        }
        else if (lastNewEvent.endTime == oldEvent.startTime) {
            newEvents.push(oldEvent);
        }
        else if (lastNewEvent.endTime > oldEvent.startTime) {
            if (lastNewEvent.endTime < oldEvent.endTime) {
                newEvents.push({
                    startTime: lastNewEvent.endTime,
                    endTime: oldEvent.endTime,
                    start: oldEvent.start + (oldEvent.end - oldEvent.start) * ((lastNewEvent.endTime - oldEvent.startTime) / (oldEvent.endTime - oldEvent.startTime)) + (lastNewEvent.end - oldEvent.start),
                    end: oldEvent.end
                });
            }
        }
    }

    // 合并相同变化率事件
    newEvents2 = [newEvents.shift()];
    for (let newEvent of newEvents) {
        let lastNewEvent2 = newEvents2[newEvents2.length - 1]!;
        let duration1 = lastNewEvent2.endTime - lastNewEvent2.startTime;
        let duration2 = newEvent.endTime - newEvent.startTime;

        if (newEvent.startTime == newEvent.endTime) {
            // 忽略此分支    
        }
        else if (
            lastNewEvent2.end == newEvent.start &&
            (lastNewEvent2.end - lastNewEvent2.start) * duration2 == (newEvent.end - newEvent.start) * duration1
        ) {
            newEvents2[newEvents2.length - 1]!.endTime = newEvent.endTime;
            newEvents2[newEvents2.length - 1]!.end = newEvent.end;
        }
        else {
            newEvents2.push(newEvent);
        }
    }

    return newEvents.slice();
}


function arrangeSingleValueLineEvents(events: any) {
    let oldEvents = events.slice();
    let newEvents = [oldEvents.shift()];

    if (events.length <= 0) return [];

    // 保证时间连续性
    for (let oldEvent of oldEvents) {
        let lastNewEvent = newEvents[newEvents.length - 1];

        if (oldEvent.endTime < oldEvent.startTime) {
            let newStartTime = oldEvent.endTime,
                newEndTime = oldEvent.startTime;

            oldEvent.startTime = newStartTime;
            oldEvent.endTime = newEndTime;
        }

        if (lastNewEvent.value == oldEvent.value) {
            lastNewEvent.endTime = oldEvent.endTime;
        }
        else if (lastNewEvent.endTime < oldEvent.startTime || lastNewEvent.endTime > oldEvent.startTime) {
            lastNewEvent.endTime = oldEvent.startTime;
            newEvents.push(oldEvent);
        }
        else {
            newEvents.push(oldEvent);
        }
    }

    return newEvents.slice();
}
