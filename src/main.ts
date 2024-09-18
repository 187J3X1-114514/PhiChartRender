import 'mdui/mdui.css'
import { Button, Card, Select, MenuItem } from 'mdui';
import { ResourceManger } from './core/resource';
import './styles.css'
import 'mdui/components/icon.js';
import { reqFullSc } from './ui';
import { ChartPage } from './ui/phira/chart/chart';
import { account, app, reqLogin, ResPack } from './ui/main';
import { PlayS } from './ui/play/play';
import { ON_TAURI } from './ui/tauri';
document.documentElement.addEventListener("click", () => {
    if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) reqFullSc()
})
if (document.URL.includes("?") || ON_TAURI && false) {
    await reqLogin()
    let api = account!
    let cp = await ChartPage.create(api, app)
}
else {
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
        let p = new PlayS(c,res,ress)
        await p.load()
        p.start()
    })

    document.body.append(c)
}
