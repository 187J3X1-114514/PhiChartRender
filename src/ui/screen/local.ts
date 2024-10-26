import { Button, Card, Select, MenuItem, Switch } from "mdui";
import { ResourceManager } from "../../core/resource";
import { ResPack } from "../main";
import { PlayS } from "../play/play";
import { BaseScreen } from "./base";

export class LocalScreen extends BaseScreen {
    private resManger?: ResourceManager

    create(): void {
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
        const ress = new ResourceManager()
        const fbtn = new Button()
        const sbtn = new Button()
        const autoplay = new Switch()
        const c = new Card()
        c.variant = "filled"
        fbtn.innerText = "上传文件"
        sbtn.innerText = "启动！"
        const s = new Select()
        c.append(s)
        c.append(fbtn)
        c.append(sbtn)
        c.append(autoplay)
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
                console.log(ress)
            }, undefined, true)
        })
        sbtn.addEventListener("click", async () => {
            let c = ress.charts[s.value as string]!
            let p = new PlayS(c, res, ress)
            await p.load(autoplay.value=="on")
            p.start()
        })
        this.root.appendChild(c)

    }
    destroy(): void {
        this.resManger?.destroy()
        delete this.resManger
    }
    addToPage(): void {
        this.parent.appendChild(this.root)
    }

}