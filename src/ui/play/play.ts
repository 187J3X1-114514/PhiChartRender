import { ChartData, ChartInfo } from "../../core/chart/chartinfo";
import Game from "../../core/game";
import { ResourceManger, ResourcePack } from "../../core/resource";
import { File } from "../../core/file";
import { Application } from "pixi.js";
import { topAppBar, BACKGROUND } from "../main";

export class PlayS {
    private res: ResourceManger
    private chart?: ChartInfo
    private game?: Game
    private app?: Application
    private file: File[]
    private resp: ResourcePack
    private chart_data?: ChartData
    private end: () => void
    constructor(file: File | File[] | ChartInfo, resp: ResourcePack, resm: ResourceManger = new ResourceManger()) {
        this.res = resm
        this.file = file instanceof Array ? file : (file instanceof ChartInfo ? [] : [file])
        this.resp = resp
        if (file instanceof ChartInfo) {
            this.chart = file
        }
        this.end = () => { }
    }
    setOnEnd(f: () => void) {
        this.end = f
    }
    async load(autoPlay: boolean = false) {
        if (this.chart == undefined) {
            for (let f of this.file) {
                if (f.extension.toLowerCase() == "zip") {
                    await this.res.load(f.name, await f.getBlob())
                } else {
                    await this.res.add(f)
                }
            }
            for (let key in this.res.charts) {
                this.chart = this.res.charts[key]
            }
        }
        await this.chart!.blur(40)
        this.game = new Game()
        this.app = new Application()
        this.chart_data = this.chart!.get(this.res)
        await this.app.init({
            //width: document.documentElement.clientWidth,
            //height: document.documentElement.clientHeight,
            autoDensity: true,
            antialias: true,
            //backgroundAlpha: 1,
            hello: true,
            resizeTo: document.documentElement,
            resolution: window.devicePixelRatio,
            preference: navigator.gpu ? "webgpu" : "webgl"
        })
        await this.game.init({
            app: this.app,
            render: {
                resizeTo: document.documentElement
            },
            chart: this.chart_data!,
            assets: this.resp.Assets,
            zipFiles: this.res,
            settings: {
                autoPlay: autoPlay, shader: true, showInputPoint: true, showFPS: false, bgDim: 0.1
            }
        })
        let r = new ResizeObserver(() => { this.game!.resize(true) })
        r.observe(this.app!.canvas)
        this.game.createSprites()
        this.game.on("end", () => {
            this.onend()
        })
    }
    start() {
        topAppBar.style.display = "none"
        document.body.style.paddingTop = "0px"
        this.app!.canvas.classList.add("push-in")
        this.app!.canvas.classList.add("game")
        BACKGROUND.pause()
        setTimeout(() => {
            this.game!.start()
            this.app!.canvas.classList.remove("push-in")
        }, 620)
    }
    private onend() {
        BACKGROUND.render()
        topAppBar.style.display = "flex"
        document.body.style.paddingTop = "64px"
        this.app!.canvas.classList.add("push-out")
        this.end()
    }
}