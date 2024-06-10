import 'mdui/mdui.css'
import { setTheme, Button, Card, Select, MenuItem } from 'mdui';
import { ResourcePack } from "./core/resource/resource_pack";
import { Zip, loadZip, File } from "./core/file";
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import Game from './core/game';
import { ResourceManger } from './core/resource';
import './styles.css'
import { Application } from 'pixi.js';
try {
    const mainWebview = WebviewWindow.getByLabel('main')!
    mainWebview.setFullscreen(false)
} catch { }

setTheme("dark")
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
sbtn.addEventListener("click", async () => {
    game = new Game()
    await game.init({
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
    function rendererResize(application: Application) {

        let [width, height] = [document.documentElement.clientWidth, document.documentElement.clientHeight];
        (game.render.canvas as HTMLCanvasElement).style.width = `${document.documentElement.clientWidth}px`;
        (game.render.view as HTMLCanvasElement).style.height = `${document.documentElement.clientHeight}px`;
        //stage.scale.set(ratio);
        application.renderer.resize(width, height);
    }
    window.addEventListener("resize", () => { rendererResize(game.render); game.resize(true) });
    (game.render.canvas as HTMLCanvasElement).classList.add('canvas-game');
    await (game.render.canvas as HTMLCanvasElement).requestFullscreen()
    game.createSprites()
    game.start()
    game.on('pause', () => {
        game.pause(false)
    })
})

document.body.append(c)

