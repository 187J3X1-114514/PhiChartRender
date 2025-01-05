import { Application, Assets, Graphics, Sprite, Texture } from "pixi.js"
import { appWindow, ON_ANDROID, ON_TAURI, rgb2ColorRef, set_wa } from "../tauri"
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
    private color: number = 0xfff
    private drawCanvas: HTMLCanvasElement = undefined as any
    static async init() {
        let _ = new this()
        await _._init()
        await _.updateTexture()
        _.watchWindow()
        await _.render(true);
        (window as any).background = _
        return _

    }
    private async _init() {
        this.drawCanvas = document.createElement("canvas")
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
        let color = await this.getColorFromImage(this.texture.source.resource)
        this.color = parseInt(`0x${color.split("#")[1]}`)
        setColorScheme(color)
        await set_wa(34, rgb2ColorRef(this.color))
        this.sprite.texture = this.texture
        const scaleX = window.screen.width / this.texture.width * 1
        this.sprite.scale.x = scaleX
        this.sprite.height = this.texture.height * scaleX
    }

    async getColorFromImage(image: ImageBitmap): Promise<string> {
        return new Promise<string>(async (r) => {
            const ctx = this.drawCanvas.getContext("2d")!
            this.drawCanvas.width = image.width
            this.drawCanvas.height = image.height
            ctx.drawImage(image, 0, 0, this.drawCanvas.width, this.drawCanvas.height)
            let url = URL.createObjectURL(await new Promise<Blob>((res) => this.drawCanvas.toBlob(res as any)))
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
            if (ON_ANDROID) {
                return {
                    x: 0,
                    y: 0
                }
            }
            let _ = await appWindow.outerPosition()
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
        //let topColor = this.getBackgroundColor(Math.floor((Math.min(pos.y, pos.y * 0.9) / window.screen.height) * this.drawCanvas.height))
        set_wa(35, rgb2ColorRef(this.color))
        this.app.render()
    }

    watchWindow() {
        this._watchInterval = setInterval(async () => {
            await this.render()
        }, 10)
    }

    private getBackgroundColor(y: number) {
        var _r = 0
        var _g = 0
        var _b = 0
        const sample = 2
        var count = 0
        const ctx = this.drawCanvas.getContext("2d")!
        let data = ctx.getImageData(0, y, this.drawCanvas.width, 1)
        while (true) {
            count++
            if (count % sample != 0) continue
            if (count >= this.drawCanvas.width) break
            _r += data.data[count * 4 + 0]
            _g += data.data[count * 4 + 1]
            _b += data.data[count * 4 + 2]
        }
        data = undefined as any
        return [_r / count, _g / count, _b / count]
    }
}

function rgbToHex(r: number, g: number, b: number) {
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return (r << 16) | (g << 8) | b;
}