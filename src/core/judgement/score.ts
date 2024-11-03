import type { SizerData } from '../types/params';
import Judgeline from '../chart/judgeline';
export default class Score {
    _notesCount: number;
    _showAPStatus: boolean;
    _autoPlay: boolean;

    scorePerNote: number;
    scorePerCombo: number;

    renderSize: any;
    _score: number;

    combo: number;
    maxCombo: number;
    judgedNotes: number;
    perfect: number;
    good: number;
    bad: number;
    miss: number;
    acc: number;
    judgeLevel: number;
    APType: number;
    levelPassed: boolean;
    score: number;

    text: {
        acc: string
        score: string
        combo: string
    } = {
            acc: "0%",
            score: "0000000",
            combo: "0"
        }
    constructor(notesCount = 0, showAPStatus = true, isChallengeMode = false, autoPlay = false) {
        this._notesCount = Number(notesCount);
        this._showAPStatus = !!showAPStatus;
        this._autoPlay = !!autoPlay;

        if (isNaN((this._notesCount)) || this._notesCount <= 0) {
            console.warn('Invaild note count, Won\'t calculate score.');
            this._notesCount = 0;
        }

        this.scorePerNote = isChallengeMode ? 1000000 / notesCount : 900000 / notesCount;
        this.scorePerCombo = isChallengeMode ? 0 : 100000 / notesCount;

        this.renderSize = {};
        this._score = 0;
        this.score = 0;
        this.acc = 0;
        this.combo = 0;
        this.maxCombo = 0;

        this.judgedNotes = 0;
        this.perfect = 0;
        this.good = 0;
        this.bad = 0;
        this.miss = 0;

        this.judgeLevel = -1;
        this.APType = 2;
        this.levelPassed = false;
        this.reset();
    }

    reset() {
        this._score = 0;
        this.score = 0;
        this.acc = 0;
        this.combo = 0;
        this.maxCombo = 0;

        this.judgedNotes = 0;
        this.perfect = 0;
        this.good = 0;
        this.bad = 0;
        this.miss = 0;

        this.judgeLevel = -1;
        this.APType = 2;
        this.levelPassed = false;
    }

    createSprites(_stage: any) { }

    resizeSprites(size: SizerData, _isEnded: boolean) { this.renderSize = size }

    pushJudge(type = 0, judgelines: Judgeline[] = []) {
        if (!this._autoPlay) {
            if (type > 2) {
                this.combo += 1;
                if (this.combo > this.maxCombo) this.maxCombo = this.combo;

                if (type === 4) this.perfect += 1;
                else {
                    this.good += 1;
                    if (this.APType >= 2) {
                        this.APType = 1;

                        if (this._showAPStatus) {
                            for (const judgeline of judgelines) {
                                if (!isNaN(judgeline.color)) return;
                                if (!judgeline.sprite) return;
                                judgeline.setColor(0xB4E1FF);
                            };
                        }
                    }
                }

                this._score += this.scorePerNote + (this.combo >= this.maxCombo ? this.scorePerCombo * (type === 4 ? 1 : 0.65) : 0);
            }
            else {
                if (type === 2) this.bad += 1;
                else this.miss += 1;

                if (this.APType >= 1) {
                    this.APType = 0;

                    if (this._showAPStatus) {
                        for (const judgeline of judgelines) {
                            if (!isNaN(judgeline.color)) return;
                            if (!judgeline.sprite) return;
                            judgeline.setColor(0xFFFFFF);
                        };
                    }
                }

                this.combo = 0;
            }
        }
        else {
            this.perfect += 1;
            this.combo += 1;
            this.maxCombo = this.combo;
            this._score += this.scorePerNote + this.scorePerCombo;
        }

        this.judgedNotes++;
        this.score = Math.round(this._score);
        this.acc = (this.perfect + this.good * 0.65) / this.judgedNotes;

        if (this.score >= 1000000) this.judgeLevel = 6;
        else if (this.score >= 960000) this.judgeLevel = 5;
        else if (this.score >= 920000) this.judgeLevel = 4;
        else if (this.score >= 880000) this.judgeLevel = 3;
        else if (this.score >= 820000) this.judgeLevel = 2;
        else if (this.score >= 700000) this.judgeLevel = 1;
        else this.judgeLevel = 0;

        if (this.judgeLevel >= 1) this.levelPassed = true;
        this.text.combo = this.combo.toFixed(0);
        this.text.acc = (this.acc * 100).toFixed(2) + '%';
        this.text.score = fillZero((this.score).toFixed(0), 7);
    }

    destroySprites() { }
}



function fillZero(num: number | string, length = 3) {
    let result = num + '';
    while (result.length < length) {
        result = '0' + result;
    }
    return result;
}