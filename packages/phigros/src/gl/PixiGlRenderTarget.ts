import { GlRenderTarget, GlTexture } from "pixi.js";
import { RenderTarget } from "./RenderTarget";

export class PixiGlRenderTarget extends RenderTarget {
    private pixiRenderTarget: GlRenderTarget
    private pixiTexture: GlTexture
    constructor(pixiRenderTarget: GlRenderTarget, pixiTexture: GlTexture) {
        super(undefined as any, 0, 0, true)
        this.pixiRenderTarget = pixiRenderTarget
        this.pixiTexture = pixiTexture
    }
    remove() { return }
    resize() {
        this.width = this.pixiRenderTarget.width
        this.height = this.pixiRenderTarget.height
    }

    get texture() {
        return this.pixiTexture.texture
    }
    set texture(_value: WebGLTexture) {
        return
    }
    get width(): number {
        return this.pixiRenderTarget.width
    }
    set width(_value: number) { }
    get height(): number {
        return this.pixiRenderTarget.height
    }
    set height(_value: number) { }

}