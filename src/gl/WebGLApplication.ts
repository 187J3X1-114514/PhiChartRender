import { Container, isWebGLSupported, RenderTexture, Sprite, Texture, WebGLRenderer } from "pixi.js";
import { RenderTarget as PixiRenderTarget } from "pixi.js";
import { PixiGlRenderTarget } from "./PixiGlRenderTarget";
import { ShaderProgram, Uniform, UniformType } from "./Shader";

export class WebGLApplication {
    public canvas: HTMLCanvasElement;
    public renderer = new WebGLRenderer()
    public fpsCount: FPS = new FPS(1)
    private _tick?: () => any
    private isStart: boolean = false;
    private tickInterval?: number;
    private lastTime: number = 0
    private gl: WebGL2RenderingContext | WebGLRenderingContext = undefined as any
    private blitToScreenContainer: Container = new Container()
    private blitToScreenSprite: Sprite = new Sprite()
    private constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.blitToScreenContainer.addChild(this.blitToScreenSprite)
    }
    getGLContext(): WebGL2RenderingContext | WebGLRenderingContext {
        return this.gl
    }
    private async init() {
        if (!isWebGLSupported()) return
        this.gl = this.canvas.getContext("webgl2", { powerPreference: "high-performance" }) || this.canvas.getContext("webgl", { powerPreference: "high-performance" }) as any
        await this.renderer.init({
            preferWebGLVersion: this.gl instanceof WebGL2RenderingContext ? 2 : 1,
            autoDensity: true,
            //width: window.innerWidth,
            //height: window.innerHeight,
            context: this.gl as any,
            resolution: 1
        })
        this.renderer.hello.init({ hello: true })
        this.resize(window.innerWidth, window.innerHeight)
    }

    resize(width: number, height: number) {
        this.canvas.style.width = width + "px"
        this.canvas.style.height = height + "px"
        this.canvas.width = width * window.devicePixelRatio
        this.canvas.height = height * window.devicePixelRatio
        this.renderer.resize(width * window.devicePixelRatio, height * window.devicePixelRatio, 1)
        console.log(this)
    }

    start() {
        this.isStart = true
        if (this.tickInterval == undefined) {
            this.tickInterval = setInterval(() => {
                this.fpsCount.tick(performance.now() - this.lastTime)
                this.tick()
            }, 1000 / 120) as any
        }
    }

    stop() {
        this.isStart = false
    }

    tick() {
        if (!this.isStart) {
            if (this.tickInterval != undefined) {
                clearInterval(this.tickInterval)
                this.tickInterval = undefined
            }
            return
        }
        /////////////////////
        if (this._tick) this._tick();
        /////////////////////
        this.lastTime = performance.now()
    }

    setTick(fn: () => any) {
        this._tick = fn
    }

    static async create(canvas: HTMLCanvasElement) {
        const _ = new this(canvas)
        await _.init()
        return _
    }

    getGlRenderTarget(renderTarget: PixiRenderTarget) {
        const gpuRenderTarget = this.renderer.renderTarget.getGpuRenderTarget(renderTarget)
        const texure = this.renderer.texture.getGlSource(renderTarget.colorTexture)
        return new PixiGlRenderTarget(gpuRenderTarget, texure)
    }

    biltToScreen(renderTarget: PixiRenderTarget) {
        this.blitToScreenSprite.texture = new Texture(renderTarget.colorTexture)
        this.renderer.render(this.blitToScreenContainer)
    }
}

class FPS {
    private q: number[] = [];
    private sumDuration: number = 0; // ms
    private frameDuration: number;
    private lastFrameTime: number = 0;
    public fps: number = 0;
    constructor(frameDuration: number) {
        this.frameDuration = frameDuration;
    }
    tick(deltaTime: number): number {
        //deltaTime *= 1000; // 将deltaTime转换为毫秒
        if (this.q.length < 50) { // 样本数设为100
            this.sumDuration += deltaTime;
            this.q.push(deltaTime);
            this.fps = 1000 / (this.sumDuration / this.q.length);
        } else {
            this.sumDuration -= this.q.shift()!; // 移除队列中的第一个元素
            this.sumDuration += deltaTime;
            this.q.push(deltaTime);
            this.fps = 1000 / (this.sumDuration / 50);
        }

        return this.fps;
    }
    shouldRender(currentTime: number): boolean {
        if (currentTime - this.lastFrameTime >= this.frameDuration) {
            this.lastFrameTime = currentTime;
            return true;
        }
        return false;
    }
}