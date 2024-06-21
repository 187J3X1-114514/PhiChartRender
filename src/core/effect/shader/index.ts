import * as presets from './presets/index';
import { Filter } from 'pixi.js';
import defaultShader from './default.vert?raw'
import defaultShaderFrag from './default.frag?raw'
const defaultValueReg = /uniform\s+(\w+)\s+(\w+);\s+\/\/\s+%([^%]+)%/g;

interface uniData {
    value: any, type: string
}

export default class Shader {
    public name: string
    public filter: Filter
    public uniforms: { [key: string]: uniData } = {}
    public uniforms2: { [key: string]: uniData } = {}
    public uniformsAll: { [key: string]: uniData } = {}
    constructor(_shaderText: string, name: string) {
        var shaderText = ""
        this.name = name;
        let shaderTextList: string[]
        if ((presets as any)[name]) {
            shaderTextList = _shaderText.split("\n")
        } else if (_shaderText.includes("screenTexture")) {
            shaderTextList = _shaderText.split("\n")
        } else {
            shaderTextList = (_shaderText as any).replaceAll('uv', 'vTextureCoord').replaceAll('screenTexture', 'uTexture').split("\n")
        }
        shaderText = shaderTextList.join("\n");
        [...shaderText.matchAll(defaultValueReg)].map((uniform) => {
            const type = uniform[1];
            const name = uniform[2];
            const value = uniform[3];
            switch (type) {
                case 'float':
                    this.uniforms2[name] = { value: parseFloat(value), type: "f32" };
                    break;
                case 'vec2':
                    this.uniforms2[name] = { value: value.split(',').map(v => parseFloat(v.trim())), type: "vec2<f32>" };
                    break;
                case 'vec4':
                    this.uniforms2[name] = { value: value.split(',').map(v => parseFloat(v.trim())), type: "vec4<f32>" };
                    break;

                default:
                    throw Error('Unknown type: ' + type);

            }
        }
        );
        this.uniforms = {
            time: { value: 0, type: "f32" },
            screenSize: { value: [0, 0], type: "vec2<f32>" },
            UVScale: { value: [0, 0], type: "vec2<f32>" }
        };
        this.uniformsAll = { ...this.uniforms, ...this.uniforms2 }
        this.filter = Filter.from({
            resources: { my: this.uniformsAll },
            gl: {
                vertex: defaultShader,
                fragment: shaderText
            },
        })
    }
    static from(shaderText: string, name: string) {
        return new Shader(shaderText, name);
    }

    static get presets() {
        return presets;
    }

    update(uniforms: { [key: string]: any[] | number }) {
        for (const name in uniforms) {
            if (typeof uniforms[name] == 'number' && Number.isNaN(uniforms[name]) && this.uniforms2[name]) {
                uniforms[name] = this.uniformsAll[name].value
            }
            this.filter.resources.my.uniforms[name] = uniforms[name]
        }
        for (const name in this.filter.resources.my.uniforms) {
            if (this.filter.resources.my.uniforms[name].value) {
                this.filter.resources.my.uniforms[name] = this.filter.resources.my.uniforms[name].value
            }
            if (Number.isNaN(this.filter.resources.my.uniforms[name])) {
                this.filter.resources.my.uniforms[name] = Number.isNaN(this.uniformsAll[name].value) ? (this.uniforms2[name]?this.uniforms2[name].value:NaN) : this.uniformsAll[name].value
            }
        }

    }

    static get defaultFrag() {
        return new Shader(defaultShaderFrag, "default")
    }

}