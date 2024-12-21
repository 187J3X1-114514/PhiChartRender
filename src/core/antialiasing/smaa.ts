import { SMAABlendShader, SMAAEdgesShader, SMAAWeightsShader } from "./shader/smaa";

export class SMAAPass {
    public gl: WebGL2RenderingContext | WebGLRenderingContext;

    public SMAAEdgesShader?: WebGLShader
    public SMAAWeightsShader?: WebGLShader
    public SMAABlendShader?: WebGLShader

    public inputFrameBuffer?: WebGLFramebuffer;

    constructor(gl: WebGL2RenderingContext | WebGLRenderingContext) {
        this.gl = gl
        this.initShader()
    }

    initShader() {
        this.SMAAEdgesShader = this.glCreateShaderProgram(SMAAEdgesShader.vertexShader, SMAAEdgesShader.fragmentShader)
        this.SMAAWeightsShader = this.glCreateShaderProgram(SMAAWeightsShader.vertexShader, SMAAWeightsShader.fragmentShader)
        this.SMAABlendShader = this.glCreateShaderProgram(SMAABlendShader.vertexShader, SMAABlendShader.fragmentShader)
    }

    private compileShaderSource(shader: WebGLShader, src: string) {
        this.gl.shaderSource(shader, src);
        this.gl.compileShader(shader);
    }

    private glCreateShaderProgram(vertexShaderSrc: string, fragmentShaderSrc: string) {
        const gl = this.gl
        const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
        this.compileShaderSource(vertexShader, vertexShaderSrc)
        this.compileShaderSource(fragmentShader, fragmentShaderSrc)
        const program = gl.createProgram()
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.detachShader(program, vertexShader);
        gl.detachShader(program, fragmentShader);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const linkErrLog = gl.getProgramInfoLog(program);
            throw linkErrLog
        }
        return program
    }

    setInput(inputFrameBuffer: WebGLFramebuffer) {
        this.inputFrameBuffer = inputFrameBuffer
    }

    bindFrameBuffer(frameBuffer: WebGLFramebuffer) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuffer)
    }


}