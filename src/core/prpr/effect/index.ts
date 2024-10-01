import Shader from './shader';

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
    vars: Record<string, any>;

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
        this._currentValue = (this.shader !== null && typeof this.shader !== 'string') ? this.shader.uniforms2 : {};
    }

    calcTime(currentTime: number, screenSize: number[]) {
        if (this.shader === null) return;

        const { vars, shader, _currentValue } = this;
        let array_var: any = {}
        for (const name in vars) {
            if (name.includes("@#$%&___")) {
                array_var[name.split("@#$%&___")[0]] = []
            }
        }
        for (const name in vars) {
            const values = vars[name];
            if (name.includes("@#$%&___")) {
                array_var[name.split("@#$%&___")[0]][parseInt(name.split("@#$%&___").pop()!)] = valueCalculator(values, currentTime, ((shader as Shader).uniforms2[name.split("@#$%&___")[0]] as any)[parseInt(name.split("@#$%&___").pop()!)])
                continue
            }
            _currentValue![name] = valueCalculator(values, currentTime, (shader as Shader).uniforms2[name]);
        }
        (shader as Shader).update({ ..._currentValue, ...array_var, time: currentTime, screenSize: screenSize });
    }
}

function valueCalculator(values: any[], currentTime: number, defaultValue: any): any {
    for (let i = 0, length = values.length; i < length; i++) {
        const value = values[i];
        if (value.endTime < currentTime) continue;
        if (value.startTime > currentTime) break;
        if (value.start === value.end) return value.start;

        if (typeof value.start == "object" || typeof value.end == "object") {
            return value.end
        }

        let timePercentEnd = (currentTime - value.startTime) / (value.endTime - value.startTime);
        let timePercentStart = 1 - timePercentEnd;

        return value.start * timePercentStart + value.end * timePercentEnd;


    }

    return defaultValue;
}
