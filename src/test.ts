/*import 'mdui/mdui.css'
import { Button, Card, Select, MenuItem } from 'mdui';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { ResourceManager } from './core/resource';
import './styles.css'
import { OutGameFontName } from './core/font';
import 'mdui/components/icon.js';
import { reqFullSc } from './ui';
import { ResPack } from './ui/main';
import { PlayS } from './ui/play/play';
import Game from './core/game';
import { Application } from 'pixi.js';
import { load_ffmpeg, RecordGame } from './ui/record';
document.body.style.fontFamily = OutGameFontName
function openFilePicker(fn: (c: FileList | null, a: HTMLInputElement, b: Event) => any, accept?: string, multiple?: boolean) {
    const inpEle = document.createElement("input");
    inpEle.id = `__file_${Math.trunc(Math.random() * 100000)}`;
    inpEle.type = "file";
    inpEle.style.display = "none";
    // 文件类型限制
    accept && (inpEle.accept = accept);
    // 多选限制
    multiple && (inpEle.multiple = multiple);
    inpEle.addEventListener("change", event => fn(inpEle.files, inpEle, event), { once: true });
    inpEle.click();
}
await load_ffmpeg()
const res = ResPack
const ress = new ResourceManager()
const fbtn = new Button()
const ctx = document.createElement("div")
ctx.style.width = "854px"
ctx.style.height = "540px"
const sbtn = new Button()
const c = new Card()
c.variant = "filled"

fbtn.innerText = "上传文件"
sbtn.innerText = "启动！"
const s = new Select()
c.append(s)
c.append(fbtn)
c.append(sbtn)
fbtn.addEventListener("click", () => {
    openFilePicker(async (f) => {
        await ress.loads(f);
        while (s.firstChild) {
            s.removeChild(s.firstChild);
        }
        for (let key in ress.charts) {
            let i = new MenuItem()
            i.value = key
            i.innerText = ress.charts[key]!.chart + ": " + ress.charts[key]!.src.name
            s.append(i)
        }
    }, undefined, true)
})
sbtn.addEventListener("click", async () => {
    let c = ress.charts[s.value as string]!
    await c.blur(40)
    let game = new Game()
    let app = new Application()
    let d = document.createElement("div")
    let canvas = document.createElement("canvas")
    await app.init({
        width: 2160,
        height: 1080,
        autoDensity: true,
        antialias: true,
        backgroundAlpha: 1,
        preference: "webgl",
        hello: true,
        resolution: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? window.devicePixelRatio : 1,
        canvas:canvas
    })
    d.appendChild(canvas)
    await game.init({
        app: app,
        render: {},
        chart: c,
        assets: res.Assets,
        zipFiles: ress,
        settings: {
            autoPlay: true, shader: true, showInputPoint: false, showFPS: true,bgDim:0.3
        }
    })
    const downloadBlob = (blobUrl:string, fileName:string) => {
        const a = document.createElement('a'); //创建一个a标签
        a.href = blobUrl;
        a.download = fileName || 'file';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);  //a标签上加上链接，并触发点击时间，下载数据
        URL.revokeObjectURL(blobUrl); // 释放 URL 对象
    };
    game.createSprites()
    let r = new RecordGame(60,game)
    r.onend = async()=>{
        r.get_webm((a)=>{

            downloadBlob(URL.createObjectURL(a),"test.webm")
        })
    }
    document.body.append(d)
    r.start_record()
})

document.body.append(c)
*/
import 'mdui/mdui.css'
import './styles.css'
import 'mdui/components/icon.js';
import Shader from './core/prpr/effect/shader';
import { Application, Assets, Container, Sprite, Text, TextStyle } from 'pixi.js';
import { RePhiEditEasing } from './core/chart/easing';
import { WebGLApplication } from './gl/WebGLApplication';
/*
const resM = new ResourceManager()
await resM.load("test.zip", await (await fetch("test")).blob());
console.log(resM)
function download(buff: ArrayBuffer) {

    let url = window.URL.createObjectURL(new Blob([buff], { type: "arraybuffer" }))
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', 'out.phi.chart');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

}

let chartBf = await ChartPack.from(resM)
download(chartBf)

let resm = await ChartPack.read(chartBf)
let chart = resm.chartInfo
console.log(resM,resm)
await chart.blur(40)
let app = new Application()
await app.init({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
    autoDensity: true,
    antialias: true,
    backgroundAlpha: 1,
    preference: "webgpu",
    hello: true,
    resizeTo: document.documentElement,
    resolution: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? window.devicePixelRatio : 1
})
let game = await Game.create({
    app: app,
    render: {
        resizeTo: document.documentElement
    },
    chart: chart!.get(resm.resourceManager),
    assets: ResPack.Assets,
    zipFiles: resm.resourceManager,
    settings: {
        autoPlay: true, shader: true, showInputPoint: false, showFPS: false, bgDim: 0.3
    }
})
let r = new ResizeObserver(() => { game!.resize(true) })
r.observe(app!.canvas)
game.createSprites()

topAppBar.value.style.display = "none"
document.body.style.paddingTop = "0px"
app!.canvas.classList.add("push-in")
app!.canvas.classList.add("game")
setTimeout(() => {
    game!.start()
    app!.canvas.classList.remove("push-in")
}, 620)
*/

let app = await WebGLApplication.create(document.createElement("canvas"))
app.canvas.classList.add("test-game-fs")
globalThis.addEventListener("resize", () => {
    app.resize(window.innerWidth, window.innerHeight)
})
document.body.appendChild(app.canvas)
app.canvas.classList.add("game")
let c = new Container()
let t = new Text({
    text: "dsfgsdfsdfsdf",
    style:new TextStyle({
        fill:"#FFFFFF"
    })
    
})
c.addChild(t)
let s = new Sprite(await Assets.load("assets/phira.png"))
s.scale.set(0.5)
c.addChild(s)

app.setTick(() => {
    app.renderer.render(c)
})
app.start()

/*
import utils from './core/chart/convert/utils';
let a = { startTime: 410, endTime: 410, easingType: 4, start: 0, end: 0.05 }
let b =[ {
    "time": [
        0,
        0,
        1
    ],
    "bpm": 155,
    "endTime": 5000,
    "startBeat": 0,
    "endBeat": 10000,
    "startTime": 0,
    "beatTime": 0.3870967741935484
}]
console.log(a)
console.log(utils.calculateEventEase(a, RePhiEditEasing))
console.log(utils.calculateRealTime(b, utils.calculateEventEase(a, RePhiEditEasing)))
*/