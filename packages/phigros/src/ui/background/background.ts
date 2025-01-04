import { Application, Assets, Graphics, Sprite, Texture } from "pixi.js"
import { appWindow, ON_TAURI } from "../tauri"
import { getColorFromImage, setColorScheme } from "mdui"
const backgrounds = [
    //"assets/background/img0.jpg",
    //"assets/background/img19.jpg",
    "assets/background/img20.jpg",
    "assets/background/img21.jpg",
    "assets/background/img22.jpg",
    "assets/background/img23.jpg"
]
export const BACKGROUNDCANVAS = document.createElement("canvas")
BACKGROUNDCANVAS.id = "background"
document.body.appendChild(BACKGROUNDCANVAS)
export class Background {
    private isStop: boolean = false
    private _watchInterval?: number | NodeJS.Timeout
    private _lastWindowX: number = 116456
    private _lastWindowY: number = 116456
    private texture?: Texture
    private sprite: Sprite = new Sprite()
    private app: Application = new Application()
    private tint: Graphics = new Graphics()
    static async init() {
        let _ = new this()
        await _._init()
        await _.updateTexture()
        _.watchWindow()
        await _.render(true);
        (window as any).setTint = (r: [number, number, number, number]) =>{_.setTintColor(r)}
        return _

    }
    private async _init() {
        await this.app.init({
            canvas: BACKGROUNDCANVAS,
            resizeTo: document.documentElement
        })
        this.app.ticker.stop()
        this.app.stage.addChild(this.sprite)
        this.app.stage.addChild(this.tint)
        this.tint.scale.set(10, 10)
        this.tint.position.set(-500, -500)
        this.tint.zIndex = 9000
    }
    async updateTexture() {
        let name = backgrounds[Math.floor(Math.random() * backgrounds.length)]
        this.texture = await Assets.load(name)
        setColorScheme(await this.getColorFromImage(this.texture.source.resource))
        this.sprite.texture = this.texture
        const scaleX = window.screen.width / this.texture.width * 1
        this.sprite.scale.x = scaleX
        this.sprite.height = this.texture.height * scaleX
    }

    async getColorFromImage(image: ImageBitmap): Promise<string> {
        return new Promise<string>(async (r) => {
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")!
            canvas.width = image.width
            canvas.height = image.height
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
            let url = URL.createObjectURL(await new Promise<Blob>((res) => canvas.toBlob(res as any)))
            const imgEl = new Image()
            imgEl.src = url
            imgEl.onload = async () => {
                r(await getColorFromImage(imgEl))
            }
        })

    }

    setTintColor(rgba: [number, number, number, number]) {
        this.tint.clear()
        this.tint.rect(-500, -500, 1000, 1000).fill({
            color: [rgba[0], rgba[1], rgba[2]]
        })
        this.tint.alpha = rgba[3]
        this.render(true)
    }

    async getWindowPos() {
        if (ON_TAURI) {
            let _ = await appWindow.position()
            return {
                x: _.x,
                y: _.y
            }
        } else {
            return {
                x: window.screenX,
                y: window.screenY
            }
        }
    }

    async render(f: boolean = false) {
        let pos = await this.getWindowPos()
        if ((this._lastWindowX == pos.x && this._lastWindowY == pos.y) && !f) return
        this.sprite.position.set(
            Math.min(-(pos.x), -(pos.x) * 0.60),
            Math.min(-pos.y, -pos.y * 0.9)
        )
        this._lastWindowX = pos.x
        this._lastWindowY = pos.y
        this.app.render()
    }

    watchWindow() {
        this._watchInterval = setInterval(async () => {
            await this.render()
        }, 10)
    }
}