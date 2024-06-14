import { bool as verifyBool } from '../verify';
import * as Reader from './reader';
import Shader from './shader';

interface EffectJson {
    shader: any;
    startTime: number;
    endTime: number;
    isGlobal?: boolean;
    vars?: Record<string, any>;
}

export default class Effect {
    shader: Shader|string;
    startTime: number;
    endTime: number;
    isGlobal: boolean;
    vars: Record<string, any>;

    private _currentValue?: Record<string, any>;

    constructor(params: EffectJson) {
        this.shader = params.shader;
        this.startTime = params.startTime;
        this.endTime = params.endTime;
        this.isGlobal = verifyBool(params.isGlobal!, false);
        this.vars = params.vars || {};

        this.reset();
    }

    reset() {
        this._currentValue = (this.shader !== null && typeof this.shader !== 'string') ? this.shader.uniforms2 : {};
    }

    static from(json: any): Effect[] {
        let result: Effect[] = [];

        if (typeof json === 'object') {
            const effects = Reader.PrprEffectReader(json);
            console.log(effects)
            if (effects && effects.length > 0) {
                result = effects;
            } else {
                throw new Error('Unsupported file format');
            }
        }

        return result;
    }

    calcTime(currentTime: number, screenSize: number[]) {
        if (this.shader === null) return;

        const { vars, shader, _currentValue } = this;

        for (const name in vars) {
            const values = vars[name];
            if (typeof values === 'object') {
                _currentValue![name] = valueCalculator(values, currentTime, (shader as Shader).uniforms2[name]);
            } else {
                _currentValue![name] = values;
            }
        }

        (shader as Shader).update({ ..._currentValue, time: currentTime, screenSize: screenSize });
    }
}

function valueCalculator(values: any[], currentTime: number, defaultValue: any): any {
    for (let i = 0, length = values.length; i < length; i++) {
        const value = values[i];
        if (value.endTime < currentTime) continue;
        if (value.startTime > currentTime) break;
        if (value.start === value.end) return value.start;

        let timePercentEnd = (currentTime - value.startTime) / (value.endTime - value.startTime);
        let timePercentStart = 1 - timePercentEnd;

        return value.start * timePercentStart + value.end * timePercentEnd;
    }

    return defaultValue;
}
