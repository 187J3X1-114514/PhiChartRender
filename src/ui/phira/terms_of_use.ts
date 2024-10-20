import { Button, Dialog, snackbar } from "mdui";
import { genDialogBtn } from "../utils/index"
import * as API_URL from '../../api/url'
import * as DB from "../data"
interface protocolResult {
    terms_of_use: boolean
    privacy_policy: boolean
}
export default async function protocolPage(t: Element): Promise<protocolResult> {
    if (await DB.checkInfoData("protocol")) {
        try {
            let p = JSON.parse(atob(await DB.getInfoData("protocol")!))
            if (p.terms_of_use&& p.privacy_policy) {
                return {
                    terms_of_use: true,
                    privacy_policy: true
                } as protocolResult
            }
        } catch { }
    }
    let r = {
        terms_of_use: false,
        privacy_policy: false
    } as protocolResult
    const el = document.createElement("div")
    el.style.position = "absolute"
    el.style.top = "0px"
    el.style.left = "0px"
    el.style.zIndex = "3000"
    const dialog = new Dialog()
    dialog.classList.add("close-on-overlay-click")
    dialog.headline = "《服务条款》和《隐私政策》"
    dialog.description = "在使用由 TeamFlos 提供的 Phira 线上服务之前，你必须阅读并同意TeamFlos的《服务条款》和《隐私政策》"
    const cancelButton = genDialogBtn("elevated")
    const okButton = genDialogBtn("elevated")
    const protocol1Button = genDialogBtn("tonal")
    const protocol2Button = genDialogBtn("tonal")
    cancelButton.innerText = "拒绝"
    okButton.innerText = "确认"
    okButton.disabled = true
    protocol1Button.innerText = "《服务条款》"
    protocol2Button.innerText = "《隐私政策》"
    const icon1 = document.createElement("mdui-icon")
    icon1.slot = "icon"
    icon1.name = 'close'
    const icon2 = document.createElement("mdui-icon")
    icon2.slot = "icon"
    icon2.name = 'close'
    const icon3 = document.createElement("mdui-icon")
    icon3.slot = "icon"
    icon3.name = 'close'
    protocol1Button.append(icon1)
    protocol2Button.append(icon2)
    okButton.append(icon3)
    dialog.append(cancelButton)
    dialog.append(protocol1Button)
    dialog.append(protocol2Button)
    dialog.append(okButton)
    let protocolDialog1 = document.getElementById("protocolDialog1")! as Dialog
    let protocolDialog2 = document.getElementById("protocolDialog2")! as Dialog
    let protocolNOBtn1 = document.getElementById("protocolNO1")! as Button
    let protocolNOBtn2 = document.getElementById("protocolNO2")! as Button
    let protocolYESBtn1 = document.getElementById("protocolYES1")! as Button
    let protocolYESBtn2 = document.getElementById("protocolYES2")! as Button
    let protocol1 = document.createElement("div")
    let protocol2 = document.createElement("div")
    protocolDialog1.style.zIndex = "9999"
    protocolDialog2.style.zIndex = "9999"
    protocolDialog1.open = false
    protocolDialog2.open = false
    let jump = false
    try {
        protocol1.innerHTML = (await (await fetch(API_URL.PHIRA_PROTOCOL1_TEXT)).text()).replaceAll("template", "div")
        protocol2.innerHTML = (await (await fetch(API_URL.PHIRA_PROTOCOL2_TEXT)).text()).replaceAll("template", "div")
    } catch {
        snackbar({
            message: "无法获取Phira的使用条款和隐私政策，将跳转到Phira官网",
        })
        jump = true
    }
    if (!jump) {
        let _1 = protocol1.getElementsByTagName("article")[0].getElementsByTagName("div")[0]!
        let _2 = protocol1.getElementsByTagName("article")[0].getElementsByTagName("div")[1]!
        if (_1.getAttribute("v-if")?.includes("zh-CN")) {
            protocol1 = _1
        } else {
            protocol1 = _2
        }

        let _3 = protocol2.getElementsByTagName("article")[0].getElementsByTagName("div")[0]!
        let _4 = protocol2.getElementsByTagName("article")[0].getElementsByTagName("div")[1]!
        if (_3.getAttribute("v-if")?.includes("zh-CN")) {
            protocol2 = _3
        } else {
            protocol2 = _4
        }
        document.getElementById("protocolText1")?.appendChild(protocol1)
        document.getElementById("protocolText2")?.appendChild(protocol2)
    } else {
        protocol1Button.href = API_URL.PHIRA_PROTOCOL1
        protocol2Button.href = API_URL.PHIRA_PROTOCOL2
        protocol1Button.target = "_blank"
        protocol2Button.target = "_blank"
    }
    el.append(dialog)
    t.append(el)
    const check = () => {
        if (r.terms_of_use && r.privacy_policy) { okButton.disabled = false; icon3.name = 'check' }
    }
    protocolNOBtn1.addEventListener("click",()=>{
        icon1.name = 'close'
        r.terms_of_use = false
        protocolDialog1.open = false
        check()
    })
    protocolNOBtn2.addEventListener("click",()=>{
        icon2.name = 'close'
        r.privacy_policy = false
        protocolDialog2.open = false
        check()
    })
    protocolYESBtn1.addEventListener("click",()=>{
        icon1.name = 'check'
        r.terms_of_use = true
        protocolDialog1.open = false
        check()
    })
    protocolYESBtn2.addEventListener("click",()=>{
        icon2.name = 'check'
        r.privacy_policy = true
        protocolDialog2.open = false
        check()
    })

    protocol1Button.addEventListener("click", async () => {
        if (jump) {
            icon1.name = 'check'
            r.terms_of_use = true
        } else {
            protocolDialog1.open = true
            protocolYESBtn1.disabled = true
            let _i = setTimeout(()=>{
                protocolYESBtn1.disabled = false
                clearTimeout(_i)
            },5000)
        }
        check()
    })
    protocol2Button.addEventListener("click", async () => {
        if (jump) {
            icon2.name = 'check'
            r.privacy_policy = true
        } else {
            protocolDialog2.open = true
            protocolYESBtn2.disabled = true
            let _i = setTimeout(()=>{
                protocolYESBtn2.disabled = false
                clearTimeout(_i)
            },5000)
        }

        check()
    })
    dialog.open = true
    return await new Promise<protocolResult>((ra) => {
        okButton.addEventListener("click", async() => {
            dialog.open = false
            dialog.addEventListener("closed", () => {
                t.removeChild(el)
                el.remove()
            })
            DB.setInfoData("protocol", btoa(JSON.stringify(r)))
            return ra(r)
        })
        cancelButton.addEventListener("click", async() => {
            dialog.open = false
            dialog.addEventListener("closed", () => {
                t.removeChild(el)
                el.remove()
            })
            DB.setInfoData("protocol", btoa(JSON.stringify(r)))
            return ra(r)
        })
    })


}