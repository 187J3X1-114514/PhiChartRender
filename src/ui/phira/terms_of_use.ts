import { Dialog } from "mdui";
import { genDialogBtn } from "../utils/index"
import * as API_URL from '../../api/url'
import Cookies from 'js-cookie'
interface protocolResult {
    terms_of_use: boolean
    privacy_policy: boolean
}
export default async function protocolPage(t: Element): Promise<protocolResult> {
    if (Cookies.get("protocol")) {
        try {
            let p = JSON.parse(atob(Cookies.get("protocol")!))
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
    protocol1Button.href = API_URL.PHIRA_PROTOCOL1
    protocol2Button.href = API_URL.PHIRA_PROTOCOL2
    protocol1Button.target = "_blank"
    protocol2Button.target = "_blank"
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
    protocol1Button.addEventListener("click", () => {
        icon1.name = 'check'

        r.terms_of_use = true
        if (r.terms_of_use && r.privacy_policy) { okButton.disabled = false; icon3.name = 'check' }
    })
    protocol2Button.addEventListener("click", () => {
        icon2.name = 'check'
        r.privacy_policy = true
        if (r.terms_of_use && r.privacy_policy) { okButton.disabled = false; icon3.name = 'check' }
    })
    dialog.append(cancelButton)
    dialog.append(protocol1Button)
    dialog.append(protocol2Button)
    dialog.append(okButton)
    el.append(dialog)
    t.append(el)
    dialog.open = true
    return await new Promise<protocolResult>((ra) => {
        okButton.addEventListener("click", () => {
            dialog.open = false
            dialog.addEventListener("closed", () => {
                t.removeChild(el)
                el.remove()
            })
            Cookies.set("protocol", btoa(JSON.stringify(r)), { expires: 365 })
            return ra(r)
        })
        cancelButton.addEventListener("click", () => {
            dialog.open = false
            dialog.addEventListener("closed", () => {
                t.removeChild(el)
                el.remove()
            })
            Cookies.set("protocol", btoa(JSON.stringify(r)), { expires: 365 })
            return ra(r)
        })
    })


}