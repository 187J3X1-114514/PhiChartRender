import { Application, Filter, RenderTarget, RenderTexture, Texture, TextureSource } from "pixi.js";
import { defaultShaderGL } from "../prpr/effect/shader";
import FXAAGl from './shader/fxaa.glsl?raw'
import { WebGLApplication } from "@/gl/WebGLApplication";
import { SMAAPass } from "./smaa";
import { PixiGlRenderTarget } from "@/gl/PixiGlRenderTarget";
export class Antialiasing {
    public FXAA?: Filter
    public SMAA?: SMAAPass
    public app: WebGLApplication<any>
    private tempRenderTarget: RenderTarget = new RenderTarget()
    constructor(app: WebGLApplication<any>) {
        this.app = app
    }
    async initFXAA() {
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
    async initSMAA() {
        this.SMAA = await SMAAPass.create(this.app.getGLContext())
    }
    resize(width: number, height: number) {
        this.tempRenderTarget.resize(width, height)
        if (this.FXAA) this.FXAA.resources.my.uniforms.screenSize = [width, height]
        if (this.SMAA) this.SMAA.resize(width, height)
    }

    render() {
        if (this.SMAA) {
            const gl = this.app.getGLContext()
            const currentProgram = this.app.renderer.shader._getProgramData(this.app.renderer.shader._activeProgram).program
            this.SMAA.renderSMAAEdges()
            this.SMAA.renderSMAAWeights()
            this.SMAA.renderSMAABlend()
            gl.useProgram(currentProgram)
            gl.bindRenderbuffer(gl.RENDERBUFFER,null)
            gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        }
    }

    get output() {
        if (this.SMAA) {
            const gl = this.app.getGLContext()
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.SMAA.outputFrameBuffer!.framebuffer)
            gl.bindTexture(
                gl.TEXTURE_2D,
                this.app.renderer.texture.getGlSource(
                    this.tempRenderTarget.colorTexture
                ).texture
            )
            gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, this.SMAA.outputFrameBuffer!.width, this.SMAA.outputFrameBuffer!.height, 0);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null)
            gl.bindTexture(
                gl.TEXTURE_2D,
                null
            )
            return this.tempRenderTarget
        }
    }
}