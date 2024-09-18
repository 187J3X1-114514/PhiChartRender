import { Application, Graphics, Container, Sprite, Assets, BlurFilter, Texture } from "pixi.js"
import * as Shader from "./shader";
import { Slider } from "mdui";
import { GlowFilter } from "pixi-filters";
import * as StackBlur from 'stackblur-canvas';
import * as presets from '../../core/prpr/effect/shader/presets/index';
export const BACKGROUNDCANVAS = document.createElement("canvas")
BACKGROUNDCANVAS.id = "background"
export class background {
    public app: Application = undefined as any
    private linesContainer: Container = new Container()
    private lines: Graphics = undefined as any
    private shaders: { [key: string]: Shader.Shader } = {}
    private background_image: Sprite = undefined as any
    static async init(grid?: boolean) {
        let _ = new this()
        _.app = new Application()
        await _.app.init(
            {
                canvas: BACKGROUNDCANVAS,
                resizeTo: document.documentElement,
                autoDensity: true,
                antialias: true,
                autoStart: true,
                resolution: 1.0
            }
        )
        _.app.ticker.maxFPS = 25
        _.app.stop()
        _.app.stage.addChild(_.linesContainer)
        let tex = await Assets.load("/assets/background/0.png")
        const img = tex._source.resource as ImageBitmap
        const c = document.createElement("canvas")
        const ctx = c.getContext("2d")!
        c.width = img.width
        c.height = img.height
        ctx.drawImage(img, 0, 0)
        StackBlur.canvasRGB(c, 0, 0, img.width, img.height, 64)
        const newImg = Texture.from(await createImageBitmap(c))
        _.background_image = new Sprite(
            newImg
        )
        _.app.stage.addChild(_.background_image)
        _.resize()
        document.body.appendChild(_.app.canvas)
        let r = new ResizeObserver(() => { _.resize() })
        r.observe(_.app.canvas)
        _.init_shader()
        _.linesContainer.filters = grid ? _.linesContainer.filters : []
        return _

    }
    private init_shader() {
        this.shaders.grid = new Shader.Shader(
            Shader.grid_shader,
            {
                grid_scale: { value: 0.9, type: "f32" },
                grid_zoom: { value: 1.2, type: "f32" },
                grid_width: { value: 0.025, type: "f32" },
                grid_twist: { value: 5.1, type: "f32" },
                grid_color: { value: [0.7, 0.7, 0.7], type: "vec3<f32>" },
                grid_bloom_color: { value: [81 / 255 * 0.5 + 0.1, 161 / 255 * 0.5 + 0.1, 199 / 255 * 0.5 + 0.1], type: "vec3<f32>" },
                grid_bloom_s: { value: 0.6, type: "f32" },
                grid_bloom_pos: { value: 1.0, type: "f32" },
                base_alpha: { value: 0.03, type: "f32" },
            }
        )
        this.shaders.hor_glow = new Shader.Shader(
            Shader.hor_glow,
            {
                pos: { value: 1.0, type: "f32" },
                base_alpha: { value: 0.03, type: "f32" },
                mix_color: { value: [30 / 255, 136 / 255, 181 / 255], type: "vec3<f32>" },
                block_alpha: { value: 0.46, type: "f32" },

            }
        )
        this.shaders.bloom = new Shader.Shader(
            presets.bloom,
            {
                iThreshold: { value: 0.01, type: "f32" },
                iIntensity: { value: 1.0, type: "f32" },
                iColor: { value: [30 / 255, 136 / 255, 181 / 255, 0.5], type: "f32" }
            }
        )
        this.linesContainer.filters = [this.shaders.grid.filter, this.shaders.hor_glow.filter, this.shaders.bloom.filter]
        this.background_image.filters = new BlurFilter({
            strength: 32
            , quality: 6,
            kernelSize: 13
        })
        this.app.ticker.add(() => {
            this.updata_shader()
        })
        //document.body.appendChild(
        //    (() => {
        //        let s = new Slider()
        //        s.value = 0.0
        //        s.step = 0.01
        //        s.max = 3
        //        s.min = -3
        //        s.addEventListener("input", () => {
        //            this.shaders.grid.update(
        //                {
        //                    grid_bloom_pos: s.value
        //                }
        //            )
        //        })
        //        return s
        //    })()
        //)
        this.shaders.grid.filter.resources.my.uniforms._pos = 1.5
    }
    private updata_shader() {
        //this.shaders.hor_glow.update(
        //    {

        //    }
        //)
        this.shaders.hor_glow.update(
            {
                screenSize: [this.app.canvas.width, this.app.canvas.height]
            }
        )
        this.shaders.grid.update(
            {
                screenSize: [this.app.canvas.width, this.app.canvas.height],
                grid_bloom_pos: (() => {
                    this.shaders.grid.filter.resources.my.uniforms._pos -= 0.003 / (this.app.ticker.maxFPS / 60)
                    if (this.shaders.grid.filter.resources.my.uniforms._pos < -0.5) {
                        this.shaders.grid.filter.resources.my.uniforms._pos = 1.4
                    }
                    return this.shaders.grid.filter.resources.my.uniforms._pos % 1.5
                })()
            }
        )
        this.linesContainer.alpha = 1 - (Math.sin(performance.now()) * 1.0)
    }
    resize() {
        this.lines?.destroy()
        this.lines = (() => {
            const graphics = new Graphics();
            graphics.rect(0, 0, this.app.canvas.width, this.app.canvas.height).fill({ color: 0xFFFFFF, alpha: 0.0 })
            return graphics
        })()
        this.linesContainer.addChild(this.lines)
        this.lines.x = 0
        this.lines.y = 0
        this.background_image.zIndex = -10
        if (this.app.canvas.width > this.app.canvas.height) {
            this.background_image.scale.set(this.app.canvas.width / this.background_image.texture.width)
        } else {
            this.background_image.scale.set(this.app.canvas.height / this.background_image.texture.height)
        }
        this.background_image.anchor.set(0.5)
        this.background_image.x = this.app.canvas.width / 2
        this.background_image.y = this.app.canvas.height / 2
        this.render()
    }
    private is_once?: boolean = undefined
    render(once?: boolean) {
        
        const _ = (once: boolean) => {
            if (once) {
                this.app.stop()
                //this.app.start()
                //setTimeout(() => {
                //    this.app.stop()
                //}, 1000 / this.app.ticker.maxFPS + 50)
                this.app.render()
            } else {
                this.app.start()
            }
        }
        if (once != undefined) {
            this.is_once = once
            _(once)
        } else {
            _(this.is_once!)
        }

    }
    pause() {
        this.app.stop()
    }
}