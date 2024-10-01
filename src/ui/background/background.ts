//import { Application } from "pixi.js"
//import * as Shader from "./shader";
//import * as StackBlur from 'stackblur-canvas';
//import * as presets from '../../core/prpr/effect/shader/presets/index';
//import { genNoise } from "./utils";
import { iCompileAndStart, ShaderToy } from "./shadertoy/shadertoy";
export const BACKGROUNDCANVAS = document.createElement("canvas")
BACKGROUNDCANVAS.id = "background"
export class background {
    //public app: Application = undefined as any
    private app__: ShaderToy = undefined as any
    //private shaders: { [key: string]: Shader.Shader } = {}
    private isStop: boolean = false
    private renderFrame:number = 0
    //private textures: { [key: string]: Texture } = {}
    //private frameBuffer: { [key: string]: Texture } = {}
    //private container: { [key: string]: Container } = {}
    //private sprite: { [key: string]: Sprite } = {}
    //private background_image: Sprite = undefined as any
    static async init() {
        let _ = new this()
        //_.app = new Application()
        //await _.app.init(
        //    {
        //        canvas: BACKGROUNDCANVAS,
        //        resizeTo: document.documentElement,
        //        autoDensity: true,
        //        antialias: true,
        //        autoStart: true,
        //        resolution: 1.0
        //    }
        //)
        ////_.app.ticker.maxFPS = 10
        //_.app.start()
        ////_.textures.noise = Texture.from(await genNoise(256, 256))
        ////_.textures.iChannel0 = await Assets.load("assets/background/iChannel0.jpg")
        ////_.container.a = new Container()
        ////_.container.b = new Container()
        ////_.container.c = new Container()
        ////_.container.d = new Container()
        ////_.create_framebuffer()
        ////_.background_image = new Sprite()
        ////_.container.a.addChild(_.background_image)
        ////_.sprite.a = new Sprite(_.frameBuffer.a)
        ////_.app.stage.addChild(_.sprite.a)
        //_.resize()
        document.body.appendChild(BACKGROUNDCANVAS)
        let r = new ResizeObserver(() => { _.resize() })
        r.observe(BACKGROUNDCANVAS)
        //_.init_shader()
        let v = await fetch("background.json")
        let shaderToy = await iCompileAndStart(BACKGROUNDCANVAS, await v.json())
        _.app__ = shaderToy
        return _

    }
    /*
    private create_framebuffer() {
        //this.frameBuffer.a = RenderTexture.create({width:this.app.canvas.width,height:this.app.canvas.height})
        //this.frameBuffer.b = RenderTexture.create({width:this.app.canvas.width,height:this.app.canvas.height})
        //this.frameBuffer.c = RenderTexture.create({width:this.app.canvas.width,height:this.app.canvas.height})
        //this.frameBuffer.d = RenderTexture.create({width:this.app.canvas.width,height:this.app.canvas.height})
    }
    private init_shader() {
        //console.log(this)
        this.shaders.grid = new Shader.Shader(
            Shader.background_glow,
            {
                brightness: { value: 0.75, type: "f32" },
                speed: { value: 0.08, type: "f32" }
            }
        )
        //new RenderTarget().colorTexture
        //this.shaders.background_gargantua_a = new Shader.Shader(
        //    Shader.background_gargantua_a_shader,
        //    {
        //
        //        iTime: { value: 0, type: "f32" }
        //    },
        //    {
        //        noiseTex: this.textures.noise,
        //        iChannel0: this.textures.iChannel0,
        //    }
        //)
        //this.shaders.background_gargantua_b = new Shader.Shader(
        //    Shader.background_gargantua_b_shader,
        //    {
        //    },
        //    {
        //        iChannel0: this.frameBuffer.a,
        //    }
        //)
        //this.shaders.background_gargantua_c = new Shader.Shader(
        //    Shader.background_gargantua_c_shader,
        //    {
        //    },
        //    {
        //        iChannel0: this.frameBuffer.a,
        //    }
        //)
        //
        //this.container.a.filters = [this.shaders.background_gargantua_a.filter]
        this.app.stage.filters = [this.shaders.grid.filter]
        //this.background_image.filters = new BlurFilter({
        //    strength: 32
        //    , quality: 6,
        //    kernelSize: 13
        //})
        this.app.ticker.add(() => {
            this.updata_shader()
        })
    }
    private updata_shader() {
        this.shaders.grid.update(
            {
                time: performance.now() / 1000,
                iTime: performance.now() / 1000
            }
        )
        //this.shaders.background_gargantua_b.update(
        //    {
        //        time: performance.now()/1000
        //    }
        //)
        //this.shaders.background_gargantua_c.update(
        //    {
        //        time: performance.now()/1000
        //    }
        //)
        //console.log(0)
        //this.app.renderer.render(this.container.a, { renderTexture: this.frameBuffer.a })

    }*/
    resize() {
        this.renderFrame = 0
        //this.background_image.zIndex = -10
        //if (this.app.canvas.width > this.app.canvas.height) {
        //    this.background_image.scale.set(2)
        //} else {
        //    this.background_image.scale.set(2)
        //}
        //this.background_image.anchor.set(0.5)
        //this.background_image.x = this.app.canvas.width / 2
        //this.background_image.y = this.app.canvas.height / 2
        //this.create_framebuffer()
    }
    render() {
        this.isStop = false
        const loop = () => {
            if (!this.isStop && !(this.renderFrame > 100)) {
                this.app__.render()
                this.renderFrame++
            }
            requestAnimationFrame(loop)
        }
        loop()
        //this.app.start()
    }
    pause() {
        this.isStop = !this.isStop
    }
}