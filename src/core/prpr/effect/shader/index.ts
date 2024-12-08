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
    private uniforms2: { [key: string]: uniData } = {}
    private defaultUniform: { [key: string]: uniData } = {}
    public uniformsAll: { [key: string]: uniData } = {}
    public errorLog?: string
    constructor(_shaderText: string, name: string, vars?: any, gpu_shaderText: string = defaultShaderGPU) {
        var shaderText = ""
        this.name = name
        let shaderTextList = _shaderText.split("\n")
        shaderText = shaderTextList.join("\n");
        [...shaderText.matchAll(defaultValueReg)].map((uniform) => {
            const type = uniform[1];
            const name = uniform[2];
            const value = uniform[0].split("//")[1] != undefined ? toArray(uniform[0].split("//")[1].trim()) : undefined;
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
        this.defaultUniform = {...this.uniforms2}
        this.uniforms = {
            time: { value: 0, type: "f32" },
            screenSize: { value: [0, 0], type: "vec2<f32>" },
            UVScale: { value: [0, 0], type: "vec2<f32>" }
        };
        this.uniformsAll = { ...this.uniforms, ...this.uniforms2 }
        let error = Shader.check(shaderText)
        if (typeof error == "string") {
            this.errorLog = typeof error == "string" ? error : ""
            let _shaderText_pixi = `
            //pixi.js默认添加的
            #ifdef GL_ES
            #define in varying
            #define finalColor gl_FragColor
            #define texture texture2D
            #endif
            precision mediump float;
            ${shaderText}`
            console.log(`编译着色器时出现错误：\n${this.errorLog}\n处理后的着色器代码 \n\n${_shaderText_pixi}`)
            this.filter = Filter.from({
                resources: { my: this.uniformsAll },
                gl: {
                    vertex: defaultShaderGL,
                    fragment: defaultShaderGLFrag
                },
                gpu: {
                    vertex: {
                        source: defaultShaderGPU,
                        entryPoint: "mainVertex"
                    },
                    fragment: {
                        source: defaultShaderGPU,
                        entryPoint: "mainFragment"
                    }
                }
            })
        } else {
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
        }

        for (const name in this.filter.resources.my.uniforms) {
            let uni = this.filter.resources.my.uniforms[name]
            if (Number.isNaN(uni)) uni = 0
            if (uni == undefined) {
                uni = this.uniformsAll[name].value
            }
        }
    }
    static from(shaderText: string, name: string, vars?: any, gpu_shaderText: string = defaultShaderGPU) {
        return new Shader(shaderText, name, vars, gpu_shaderText);
    }

    static get presetsGL() {
        return presetsGL;
    }
    static get presetsWebGPU() {
        return presetsWebGPU;
    }
    //有些铺子的事件不规范/我写的代码太粪所以就面向结果编程了
    update(uniforms: { [key: string]: any[] | number | any }) {
        for (const name in uniforms) {
            this.filter.resources.my.uniforms[name] = uniforms[name]
        }

    }

    getDefaultUniform(name:string){
        return this.defaultUniform[name].value
    }
    getAllDefaultUniform(){
        return this.defaultUniform
    }

    static check(shaderText: string) {
        shaderText = `
        //pixi.js默认添加的
        #ifdef GL_ES
        #define in varying
        #define finalColor gl_FragColor
        #define texture texture2D
        #endif
        precision mediump float;
        ${shaderText}`
        const canvas = document.createElement("canvas")
        const gl = canvas.getContext("webgl2")
        const canvas1 = document.createElement("canvas")
        const gl1 = canvas1.getContext("webgl")
        let ok = false
        let glErrorText = undefined
        let gl2ErrorText = undefined
        if (gl != null) {
            let result = Shader._check(shaderText, gl)
            if (typeof result == "string") {
                ok = false
                gl2ErrorText = result
            } else {
                ok = result!
            }
            gl.getExtension('WEBGL_lose_context')?.loseContext()
        }
        if (gl1 != null) {
            let result = Shader._check(shaderText, gl1)
            if (typeof result == "string") {
                ok = false
                glErrorText = result
            } else {
                ok = ok || result!
            }
            gl1.getExtension('WEBGL_lose_context')?.loseContext()
        }
        canvas.remove()
        canvas1.remove()
        let error = `WebGL2:${gl2ErrorText} \n WebGL:${glErrorText}`
        return ok ? true : error
    }
    private static _check(shaderText: string, gl: WebGL2RenderingContext | WebGLRenderingContext) {
        const shader = gl.createShader(gl.FRAGMENT_SHADER);
        if (shader == null) return false
        gl.shaderSource(shader, shaderText);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            let error = gl.getShaderInfoLog(shader)
            gl.deleteShader(shader);
            return error;
        }
        gl.deleteShader(shader);
        return true
    }

}
export const DefaultShader = new Shader(defaultShaderGLFrag, "default", undefined, defaultShaderGPU)
function toArray(text?: string) {
    if (!text) return undefined
    text = text.slice(1, text.length - 1)
    if (!text.includes(",")) return parseFloat(text)
    let list = text.split(",")
    if (list.length == 2) return [parseFloat(list[0]), parseFloat(list[1])]
    if (list.length == 4) return [parseFloat(list[0]), parseFloat(list[1]), parseFloat(list[2]), parseFloat(list[3])]
}

export { defaultShaderGL }