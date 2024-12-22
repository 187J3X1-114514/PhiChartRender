import { RenderTarget } from "@/gl/RenderTarget";
import { SMAABlendShader, SMAAEdgesShader, SMAAWeightsShader } from "./shader/smaa";
import { ShaderProgram, Uniform } from "@/gl/Shader";
import { SMAA_AreaTexture, SMAA_SearchTexture } from "./smaa_texture";
export class SMAAPass {
    public gl: WebGL2RenderingContext | WebGLRenderingContext;

    public SMAAEdgesShader?: ShaderProgram
    public SMAAWeightsShader?: ShaderProgram
    public SMAABlendShader?: ShaderProgram

    public SMAAEdgesRenderTarget?: RenderTarget
    public SMAAWeightsRenderTarget?: RenderTarget

    public inputFrameBuffer?: RenderTarget;
    public outputFrameBuffer?: RenderTarget;

    private SMAA_AreaTexture?: WebGLTexture
    private SMAA_SearchTexture?: WebGLTexture

    constructor(gl: WebGL2RenderingContext | WebGLRenderingContext) {
        this.gl = gl
        this.initShader()
        this.initFramebuffer()
    }

    static async create(gl: WebGL2RenderingContext | WebGLRenderingContext) {
        let _ = new this(gl)
        _.SMAA_AreaTexture = await SMAA_AreaTexture(gl)
        _.SMAA_SearchTexture = await SMAA_SearchTexture(gl)
        return _
    }

    initShader() {
        this.SMAAEdgesShader = new ShaderProgram(
            this.gl,
            SMAAEdgesShader.vertexShader,
            SMAAEdgesShader.fragmentShader,
            Uniform.createUniforms(SMAAEdgesShader.uniform)
        )
        this.SMAAWeightsShader = new ShaderProgram(
            this.gl,
            SMAAWeightsShader.vertexShader,
            SMAAWeightsShader.fragmentShader,
            Uniform.createUniforms(SMAAWeightsShader.uniform)
        )
        this.SMAABlendShader = new ShaderProgram(
            this.gl,
            SMAABlendShader.vertexShader,
            SMAABlendShader.fragmentShader,
            Uniform.createUniforms(SMAABlendShader.uniform)
        )
    }

    initFramebuffer() {
        this.outputFrameBuffer = new RenderTarget(this.gl, this.gl.canvas.width, this.gl.canvas.height)
        this.SMAAEdgesRenderTarget = new RenderTarget(this.gl, this.gl.canvas.width, this.gl.canvas.height)
        this.SMAAWeightsRenderTarget = new RenderTarget(this.gl, this.gl.canvas.width, this.gl.canvas.height)
    }

    setInput(inputFrameBuffer: RenderTarget) {
        this.inputFrameBuffer = inputFrameBuffer
    }

    private bindFrameBuffer(frameBuffer: RenderTarget) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuffer.framebuffer)
    }

    renderSMAAEdges() {
        if (this.SMAAEdgesRenderTarget == undefined) return
        if (this.inputFrameBuffer == undefined) return
        if (this.SMAAEdgesShader == undefined) return
        this.bindFrameBuffer(this.SMAAEdgesRenderTarget)
        const gl = this.gl
        this.SMAAEdgesShader.setUniform("tDiffuse", this.inputFrameBuffer.texture)
        this.SMAAEdgesShader.setUniform("resolution", [gl.canvas.width, gl.canvas.height])
        this.SMAAEdgesShader.use()
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        this.SMAAEdgesShader.unuse()
    }
    renderSMAAWeights() {
        if (this.SMAAWeightsRenderTarget == undefined) return
        if (this.SMAAEdgesRenderTarget == undefined) return
        if (this.SMAAWeightsShader == undefined) return
        if (this.SMAA_AreaTexture == undefined) return
        if (this.SMAA_SearchTexture == undefined) return
        this.bindFrameBuffer(this.SMAAWeightsRenderTarget)
        const gl = this.gl
        this.SMAAWeightsShader.setUniform("tDiffuse", this.SMAAEdgesRenderTarget.texture)
        this.SMAAWeightsShader.setUniform("tArea", this.SMAA_AreaTexture)
        this.SMAAWeightsShader.setUniform("tSearch", this.SMAA_SearchTexture)
        this.SMAAWeightsShader.setUniform("resolution", [gl.canvas.width, gl.canvas.height])
        this.SMAAWeightsShader.use()
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        this.SMAAWeightsShader.unuse()
    }
    renderSMAABlend() {
        if (this.outputFrameBuffer == undefined) return
        if (this.SMAAWeightsRenderTarget == undefined) return
        if (this.SMAABlendShader == undefined) return
        if (this.inputFrameBuffer == undefined) return
        this.bindFrameBuffer(this.outputFrameBuffer)
        const gl = this.gl
        this.SMAABlendShader.setUniform("tDiffuse", this.SMAAWeightsRenderTarget.texture)
        this.SMAABlendShader.setUniform("tColor", this.inputFrameBuffer.texture)
        this.SMAABlendShader.setUniform("resolution", [gl.canvas.width, gl.canvas.height])
        this.SMAABlendShader.use()
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        this.SMAABlendShader.unuse()
    }

    resize(width: number, height: number) {
        this.outputFrameBuffer?.resize(width,height)
        this.SMAAEdgesRenderTarget?.resize(width,height)
        this.SMAAWeightsRenderTarget?.resize(width,height)
    }
}