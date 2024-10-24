import * as presetsGL from './presets/gl/index';
import * as presetsWebGPU from './presets/webgpu/index';
import { Filter } from 'pixi.js';
import defaultShaderGL from './default.vert?raw'
import defaultShaderGLFrag from './default.frag?raw'
import defaultShaderGPU from './default.wgsl?raw'
const defaultValueReg = /uniform\s+(\w+)\s+(\w+);.*/g;

interface uniData {
    value: any, type: string
}


export default class Shader {
    public name: string
    public filter: Filter
    public uniforms: { [key: string]: uniData } = {}
    public uniforms2: { [key: string]: uniData } = {}
    public uniformsAll: { [key: string]: uniData } = {}
    constructor(_shaderText: string, name: string, vars?: any, gpu_shaderText: string = defaultShaderGPU) {
        var shaderText = ""
        this.name = name
        let shaderTextList = _shaderText.split("\n")
        shaderText = shaderTextList.join("\n");
        [...shaderText.matchAll(defaultValueReg)].map((uniform) => {
            const type = uniform[1];
            const name = uniform[2];
            const value = toArray(("%" + uniform[0].split("//").pop()?.split("%")[1] + "%").replace(" ", ""));
            if (name == "uv" || name == "screenSize" || name == "screenTexture" || name == "time" || name == "uTexture" || name == "vTextureCoord") {
                return
            }
            switch (type) {
                case 'float':
                    this.uniforms2[name] = { value: value != undefined ? value : vars ? (vars[name] ? vars[name][0].start : 0) : 0, type: "f32" };
                    break;
                case 'vec2':
                    this.uniforms2[name] = { value: value != undefined ? value : vars ? (vars[name] ? vars[name][0].start : [0, 0]) : [0, 0], type: "vec2<f32>" };
                    break;
                case 'vec4':
                    this.uniforms2[name] = { value: value != undefined ? value : vars ? (vars[name] ? vars[name][0].start : [0, 0, 0, 1]) : [0, 0, 0, 1], type: "vec4<f32>" };
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
                vertex: defaultShaderGL,
                fragment: shaderText
            },
            gpu: {
                vertex: {
                    source: gpu_shaderText,
                    entryPoint: "mainVertex"
                },
                fragment: {
                    source: gpu_shaderText,
                    entryPoint: "mainFragment"
                }
            }
        })
        for (const name in this.filter.resources.my.uniforms) {
            let uni = this.filter.resources.my.uniforms[name]
            if (Number.isNaN(uni)) uni = 0
            if (uni == undefined) {
                uni = this.uniformsAll[name].value
            }
        }
    }
    static from(shaderText: string, name: string, vars?: any, gpu_shaderText: string = defaultShaderGPU) {
        return new Shader(shaderText, name, vars,gpu_shaderText);
    }

    static get presetsGL() {
        return presetsGL;
    }
    static get presetsWebGPU() {
        return presetsWebGPU;
    }
    //有些铺子的事件不规范/我写的代码太粪所以就面向结果编程了
    update(uniforms: { [key: string]: any[] | number | any }) {
        try {
            for (const name in uniforms) {

                if (uniforms[name].value) {
                    this.filter.resources.my.uniforms[name] = uniforms[name].value
                } else {
                    this.filter.resources.my.uniforms[name] = uniforms[name]
                }
            }

        } catch {
        }

    }

}
export const DefaultShader = new Shader(defaultShaderGLFrag, "default",undefined,defaultShaderGPU)
function toArray(text?: string) {
    if (!text) return undefined
    text = text.slice(1, text.length - 1)
    if (!text.includes(",")) return parseFloat(text)
    let list = text.split(",")
    if (list.length == 2) return [parseFloat(list[0]), parseFloat(list[1])]
    if (list.length == 4) return [parseFloat(list[0]), parseFloat(list[1]), parseFloat(list[2]), parseFloat(list[3])]
}