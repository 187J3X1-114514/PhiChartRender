import { GlRenderTarget } from "pixi.js"

export class RenderTarget {
    public framebuffer: WebGLFramebuffer = undefined as any
    private renderbuffer: WebGLRenderbuffer = undefined as any
    private _texture: WebGLTexture = undefined as any
    public get texture(): WebGLTexture {
        return this._texture
    }
    public set texture(value: WebGLTexture) {
        this._texture = value
    }
    private _width: number = 0
    public get width(): number {
        return this._width
    }
    public set width(value: number) {
        this._width = value
    }
    private _height: number = 0
    public get height(): number {
        return this._height
    }
    public set height(value: number) {
        this._height = value
    }
    private gl: WebGL2RenderingContext | WebGLRenderingContext = undefined as any
    constructor(gl: WebGL2RenderingContext | WebGLRenderingContext, width: number, height: number, skip: boolean = false) {
        if (skip) return
        this.gl = gl
        this.width = width
        this.height = height
        this.createFrameBuffer(width, height)
    }

    private createFrameBuffer(width: number, height: number) {
        this.framebuffer = this.gl.createFramebuffer() as WebGLFramebuffer;
        this.texture = this.gl.createTexture() as WebGLTexture;
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null)
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.renderbuffer = this.gl.createRenderbuffer() as WebGLRenderbuffer;
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.renderbuffer);
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height);
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.texture, 0);
        this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.renderbuffer);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)
    }

    remove() {
        this.gl.deleteFramebuffer(this.framebuffer)
        this.gl.deleteTexture(this.texture)
        this.gl.deleteRenderbuffer(this.renderbuffer)
    }

    resize(width: number, height: number) {
        this.width = width
        this.height = height
        this.remove()
        this.createFrameBuffer(width, height)
    }
}