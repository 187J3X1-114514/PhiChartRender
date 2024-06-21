import 'mdui/mdui.css'
import { setTheme, Button, Card, Select, MenuItem, dialog } from 'mdui';
import { ResourcePack } from "./core/resource/resource_pack";
import { Zip, loadZip, File } from "./core/file";
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import Game from './core/game';
import { ResourceManger } from './core/resource';
import './styles.css'
import { Application } from 'pixi.js';
import { genAnimation } from './ui/utils';
import { fontName } from './core/font';
import { PhiraAPI } from './api/phira';
import protocolPage from './ui/phira/terms_of_use'
import 'mdui/components/icon.js';
import loginPage, { genCookie, getCookie } from './ui/phira/login';
import { reqFullSc } from './ui';
document.documentElement.addEventListener("click",()=>{
    reqFullSc()
})
try {
    const mainWebview = WebviewWindow.getByLabel('main')!
    mainWebview.setFullscreen(false)
} catch { }
document.body.style.fontFamily = fontName
setTheme("dark")
if (!document.URL.includes("192")) {
    let api = await loginPage(document.body)
    console.log(api)

}
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
let a = await fetch("assets/pack/resource.zip")
let zip: Zip
if (a.ok) {
    zip = await loadZip("resource.zip", await a.blob())
} else {
    let b = await new Promise<File>((r) => {
        openFilePicker(async (c) => {
            r(await File.from(c?.item(0)!))
        })
    })
    zip = await loadZip(b.name, await b.getBlob())
}

const res = await ResourcePack.load(zip)
console.log(res)
const ress = new ResourceManger()
const fbtn = new Button()
const ctx = document.createElement("div")
ctx.style.width = "854px"
ctx.style.height = "540px"
let game: Game
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
        console.log(ress)
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
var app: Application
sbtn.addEventListener("click", async () => {
    game = new Game()
    app = new Application()
    await ress.charts[s.value as string]!.blur(35)
    await app.init({
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
        autoDensity: true,
        antialias: true,
        //canvas: params.render.view ? params.render.view : undefined,
        backgroundAlpha: 1,
        preference: "webgl",
        preferWebGLVersion: 2,
        hello: true,
        resizeTo:document.documentElement
        //resolution: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? window.devicePixelRatio : undefined
    })
    await game.init({
        app: app,
        render: {
            resizeTo: document.documentElement
            , resolution: window.devicePixelRatio
        },
        chart: ress.charts[s.value as string]!,
        assets: res.Assets,
        zipFiles: ress,
        settings: {
            autoPlay: false, shader: true
        }
    })
    //(game.render.view as HTMLCanvasElement).style.width = "100%";
    //(game.render.view as HTMLCanvasElement).style.height = "100%";
    //function rendererResize(application: Application) {
    //
    //    let [width, height] = [document.documentElement.clientWidth, document.documentElement.clientHeight];
    //    (game.render.canvas as HTMLCanvasElement).style.width = `${document.documentElement.clientWidth}px`;
    //    (game.render.canvas as HTMLCanvasElement).style.height = `${document.documentElement.clientHeight}px`;
    //    if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
    //        console.log(width / (width * window.devicePixelRatio), height / (height * window.devicePixelRatio))
    //        application.stage.y = height-application.stage.height
    //       application.stage.scale.set(1 / window.devicePixelRatio,-(1 / window.devicePixelRatio));
    //    }
    //
    //    application.renderer.resize(width, height);
    //}
    function rendererResize() {
        if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
            let stage = app.stage;
            let [width, height] = [document.documentElement.clientWidth, document.documentElement.clientHeight];
            let ratio = window.devicePixelRatio;
            if (width > app.stage.width || height > app.stage.height) {
                width = app.stage.width;
                height = app.stage.height;
            }
            stage.rotation = 0;
            stage.x = 0;
            ratio = ratio * (width / app.stage.width);
            (game.render.canvas as HTMLCanvasElement).style.width = `${width}px`;
            (game.render.canvas as HTMLCanvasElement).style.height = `${height}px`;
            stage.scale.set(ratio);
            app.renderer.resize(width, height);
        }
    }
    
    window.addEventListener("resize", () => { rendererResize(); game.resize(true) });
    (game.render.canvas as HTMLCanvasElement).classList.add('canvas-game');
    if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
        await (game.render.canvas as HTMLCanvasElement).requestFullscreen()
    }
    //
    game.createSprites()
    game.start()
})

document.body.append(c)

