import 'mdui/mdui.css'
import { Button, Card, Select, MenuItem } from 'mdui';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { ResourceManger } from './core/resource';
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
const ress = new ResourceManger()
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
