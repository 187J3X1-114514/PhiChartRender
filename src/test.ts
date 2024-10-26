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
import { reqFullSc } from './ui';
import './ui/main';

import { buildAllJudgeLineData, buildColorValueEventData, buildEventLayerData, buildJudgeLineData, buildOtherEventData, buildStringValueEventData, ChartFile, readAllJudgeLineData, readEventLayerData, readJudgeLineData, readOtherEventData, readStringValueEventData } from './file/chart';
import { ReadBufferDataView, WriteBufferDataView } from './file/data_view';
import { Application, Assets, Sprite } from 'pixi.js';
import Shader from './core/prpr/effect/shader';
document.documentElement.addEventListener("click", () => {
    if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) reqFullSc()
})
/*
import { ResourceManager } from "./core/resource";
import Chart from './core/chart';
import { PlayS } from './ui/play/play';
import { Application } from 'pixi.js';
import Game from './core/game';
import { topAppBar, BACKGROUND, ResPack } from './ui/main';

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

let chartBf = await ChartFile.from(resM.files[resM.charts["11938463.json"]!.chart] as Chart)
download(chartBf)
let chart = resM.charts["11938463.json"]!
console.log(resM.files[resM.charts["11938463.json"]!.chart],await ChartFile.read(chartBf))


await chart.blur(40)
let game = new Game()
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
await game.init({
    app: app,
    render: {
        resizeTo: document.documentElement
    },
    chart: chart!,
    assets: ResPack.Assets,
    zipFiles: resM,
    settings: {
        autoPlay: true, shader: true, showInputPoint: false, showFPS: false, bgDim: 0.3
    }
})
let r = new ResizeObserver(() => { game!.resize(true) })
r.observe(app!.canvas)
game.createSprites()

topAppBar.style.display = "none"
document.body.style.paddingTop = "0px"
app!.canvas.classList.add("push-in")
app!.canvas.classList.add("game")
BACKGROUND.pause()
setTimeout(() => {
    game!.start()
    app!.canvas.classList.remove("push-in")
}, 620)

/*
let wb = new WriteBufferDataView()
buildStringValueEventData(wb,{
    startTime:-1110.564,
    endTime:5456.554645,
    value:"Now, the thoughts keep to linger on飞得更高风格士大夫电风扇😅😅😅"
})
buildStringValueEventData(wb,{
    startTime:-1110.564,
    endTime:5456.554645,
    value:"Now, the thou飞得更高风格士大夫电风扇😅😅😅"
})
let cc = wb.build()
let wb1 = new WriteBufferDataView()
wb1.setArrayBuffer(cc)
let rb = new ReadBufferDataView(new DataView(wb1.build()))
let aaaa = rb.getArrayBuffer()
let rb2 = new ReadBufferDataView(new DataView(aaaa.buffer))
console.log(readStringValueEventData(rb2))
console.log(readStringValueEventData(rb2))
*/

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

document.body.appendChild(app.canvas)
app.canvas.classList.add("game")
app.stage.addChild(new Sprite(await Assets.load("assets/phira.png")))
let testShader = new Shader(Shader.presetsGL.shockwave, "test", undefined, Shader.presetsWebGPU.shockwave)
let s = performance.now()
app.ticker.add(() => {
    testShader.update({
        time: (performance.now() - s) / 1000,
        screenSize: [document.documentElement.clientWidth, document.documentElement.clientHeight],
        progress:0.2,
        centerX:0.5,
        centerY:0.5,
        width:0.1,
        distortion:1.8,
        expand:10
    })
})

app.stage.filters = [testShader.filter]