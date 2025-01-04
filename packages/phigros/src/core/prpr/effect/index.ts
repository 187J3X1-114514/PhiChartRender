import { BaseAnim } from '@/core/chart/anim/base';
import Shader from './shader';
import { FloatAnim } from '@/core/chart/anim/float';
import { ValueAnim } from '@/core/chart/anim/value';

interface EffectJson {
    shader: any;
    startTime: number;
    endTime: number;
    isGlobal?: boolean;
    vars?: Record<string, any>;
}

export default class Effect {
    shader: Shader | string;
    startTime: number;
    endTime: number;
    isGlobal: boolean;
    vars: Record<string, BaseAnim>;

    private _currentValue?: Record<string, any>;

    constructor(params: EffectJson) {
        this.shader = params.shader;
        this.startTime = params.startTime;
        this.endTime = params.endTime;
        this.isGlobal = params.isGlobal != undefined ? params.isGlobal : false
        this.vars = params.vars || {};

        this.reset();
    }

    reset() {
        this._currentValue = {}
        if (this.shader instanceof Shader) {
            let ua = this.shader.getAllDefaultUniform()
            for (let u in ua) {
                this._currentValue[u] = ua[u].value
            }
        }
    }

    calcTime(currentTime: number, screenSize: number[], screenSizeG: number[]) {
        if (this.shader === null) return;

        const { vars, shader, _currentValue } = this;
        for (const name in vars) {
            const values = vars[name];
            if (values instanceof FloatAnim) {
                values.originValue = this._currentValue![name];
                _currentValue![name] = values.calculate(currentTime).value;
            } else if (values instanceof ValueAnim) {
                _currentValue![name] = values.calculate(currentTime).value
            }
        }
        (shader as Shader).update({ ..._currentValue, time: currentTime, screenSize: this.isGlobal ? screenSizeG : screenSize });
    }
}
