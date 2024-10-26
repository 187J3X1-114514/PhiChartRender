import { Application, Filter } from "pixi.js";
import { defaultShaderGL } from "../prpr/effect/shader";
import FXAAGl from './shader/fxaa.glsl?raw'
export class Antialiasing {
    public FXAA?: Filter
    public app: Application
    constructor(app: Application) {
        this.app = app
    }
    initFXAA() {
        this.FXAA = Filter.from({
            resources: {
                my: {
                    screenSize: { value: [1, 1], type: "vec2<f32>" }
                }
            },
            gl: {
                vertex: defaultShaderGL,
                fragment: FXAAGl
            }
        })
    }
    updata(width: number, height: number) {
        if (this.FXAA) this.FXAA.resources.my.uniforms.screenSize = [width, height]
    }
}