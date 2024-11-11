import { Button, Checkbox, CircularProgress, Dialog, TextField } from "mdui";
import { PhiraAPI, type loginResult } from "../../api/phira";
import * as DB from "../data"
import md5 from 'md5-js'
import * as CryptoJS from 'crypto-js'
import protocolPage from "./terms_of_use";
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { I18N } from "../i18n";
const fpPromise = await FingerprintJS.load()
var id = await fpPromise.get()
setInterval(async () => {
    id = await fpPromise.get()
}, 15 * 60 * 60 * 1000)
const DID = await genID()
export default async function loginPage(t: Element): Promise<loginResult> {
    const dialog = new Dialog()
    dialog.classList.add("close-on-overlay-click")
    dialog.headline = I18N.get("ui.screen.phira.login.text.login")
    const dialogInput = document.createElement("form")
    dialogInput.slot = "description"
    //email#####################################
    const emailInput = new TextField()
    const emailInputHelp = document.createElement("span")
    emailInputHelp.slot = "helper"
    emailInput.addEventListener("input", () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (emailRegex.test(emailInput.value)) {
            emailInputHelp.innerText = emailInput.value + I18N.get("ui.screen.phira.login.tip.email")
            emailInputHelp.style.color = "unset"
            emailInput.style.color = "unset"
        }
    })
    emailInput.label = I18N.get("ui.screen.phira.login.text.email")
    emailInput.placeholder = "example@uk.com"
    emailInput.type = "email"
    emailInput.append(emailInputHelp)
    dialogInput.append(emailInput)
    //password##########################################
    const passwordInput = new TextField()
    const passwordInputHelp = document.createElement("span")
    passwordInputHelp.slot = "helper"
    passwordInput.addEventListener("input", () => {
        if (passwordInput.value.length >= 8) {
            passwordInputHelp.innerText = ""
            passwordInputHelp.style.color = "unset"
        } else if (passwordInput.value == "") {
            passwordInputHelp.innerText = ""
            passwordInputHelp.style.color = "unset"
        } else {
            passwordInputHelp.innerText = I18N.get("ui.screen.phira.login.tip.password_warn")
            passwordInputHelp.style.color = "#f2b8b5"
        }
    })
    passwordInput.label = I18N.get("ui.screen.phira.login.text.password")
    passwordInput.type = "password"
    passwordInput.togglePassword = true
    passwordInput.append(passwordInputHelp)
    passwordInput.autocomplete = "on"
    emailInput.autocomplete = "on"
    dialogInput.id = generateRandom().toFixed(10)
    emailInput.required = true
    emailInput.form = dialogInput.id
    passwordInput.required = true
    passwordInput.form = dialogInput.id
    passwordInput.autocomplete = "on"
    emailInput.autocomplete = "on"
    emailInput.name = "email"
    passwordInput.name = "password"
    dialogInput.append(emailInput)
    dialogInput.append(passwordInput)
    //ok/cancel##########################################
    const cancelButton = new Button()
    const okButton = new Button()
    cancelButton.slot = "action"
    cancelButton.variant = "elevated"
    okButton.slot = "action"
    okButton.variant = "filled"
    const okIcon = document.createElement("mdui-icon-login")
    okIcon.slot = "end-icon"
    okButton.innerText = I18N.get("ui.screen.phira.login.text.login_btn")
    okButton.append(okIcon)
    cancelButton.innerText = I18N.get("ui.screen.phira.login.text.cancel_btn")
    const checkKeepPassword = new Checkbox()
    checkKeepPassword.innerText = I18N.get("ui.screen.phira.login.text.keep_password")
    dialog.append(cancelButton)
    dialog.append(okButton)
    dialogInput.append(checkKeepPassword)
    dialog.append(dialogInput)
    t.append(dialog)
    setTimeout(() => {
        dialog.open = true
    }, 100)
    return await new Promise<loginResult>(async (r) => {
        cancelButton.addEventListener("click", () => {
            dialog.open = false
            r({ api: undefined, ok: false, status: 200, error: I18N.get("ui.screen.phira.login.text.error.b") } as loginResult)
        })
        okButton.addEventListener("click", async () => {
            let pr = await protocolPage(t)
            if (!(pr.privacy_policy && pr.terms_of_use)) {
                dialog.headline = I18N.get("ui.screen.phira.login.text.login_fail")
                dialog.removeChild(okButton)
                dialogInput.removeChild(emailInput)
                dialogInput.removeChild(passwordInput)
                dialogInput.removeChild(checkKeepPassword)
                dialogInput.innerText = I18N.get("ui.screen.phira.login.text.login_tip")
                let newCancelButton = new Button()
                newCancelButton.slot = "action"
                newCancelButton.variant = "elevated"
                newCancelButton.innerText = I18N.get("ui.screen.phira.login.text.ok")
                dialog.append(newCancelButton)
                newCancelButton.addEventListener("click", () => {
                    dialog.open = false
                    r({ api: undefined, ok: false, status: 200, error: I18N.get("ui.screen.phira.login.text.error.a") } as loginResult)
                })
            } else {
                dialog.headline = I18N.get("ui.screen.phira.login.text.logging")
                dialogInput.removeChild(emailInput)
                dialogInput.removeChild(passwordInput)
                dialogInput.removeChild(checkKeepPassword)
                let p = new CircularProgress()
                p.style.height = "100%"
                //dialogInput.style.display = "inline-block"
                dialogInput.style.textAlign = "center"
                dialogInput.style.height = document.documentElement.clientHeight * 0.05 + "px"
                dialogInput.style.overflow = 'hidden';
                dialogInput.append(p)
                dialog.removeChild(okButton)
                let api = await PhiraAPI.login(emailInput.value, passwordInput.value)
                dialog.headline = api.api ? I18N.get("ui.screen.phira.login.text.login.true") : I18N.get("ui.screen.phira.login.text.login_fail")
                dialogInput.removeChild(p)
                if (!api.ok) dialogInput.innerText = api.error
                dialog.removeChild(cancelButton)

                let newCancelButton = new Button()
                newCancelButton.slot = "action"
                newCancelButton.variant = "elevated"
                newCancelButton.innerText = I18N.get("ui.screen.phira.login.text.ok")
                dialog.append(newCancelButton)
                if (api.api) {
                    DB.setInfoData("phira", checkKeepPassword.checked ? genCookie(emailInput.value, passwordInput.value) : "null")
                }
                newCancelButton.addEventListener("click", () => {
                    dialog.open = false
                    r(api)
                })
                if (api.ok) {
                    setTimeout(() => {
                        dialog.open = false
                        r(api)
                    }, 400)
                }
            }

        })
        if (await DB.checkInfoData("phira")) {
            try {
                let p = getCookie(await DB.getInfoData("phira")! as string)
                if (p.email != "" && p.password != "") {
                    emailInput.value = p.email
                    passwordInput.value = p.password
                    checkKeepPassword.checked = true
                }
            } catch { }
        }
    })
}

function generateRandom(): number {
    return Math.atan2(Math.random() * Math.cos(Math.random()) * Math.sin(Math.random()), Math.random() * Math.cos(Math.random()) * Math.sin(Math.random()))
}

export function genCookie(email: string, password: string) {
    let id = DID
    let md5_1 = md5(email) + id
    let md5_2 = md5(password) + id
    function reverseString(str: string): string {
        return str.split('').reverse().join('');
    }
    let rn1 = generateRandom() * generateRandom()
    let rn2 = generateRandom() / generateRandom()
    let md5_3 = md5(md5(md5_1 + md5_2) + rn1)
    let key_str = md5(md5(md5_3) + rn2)
    let iv_str = md5(reverseString(md5(reverseString(md5_3))) + rn1 * rn2)
    let keys_str = key_str + iv_str
    let encrypted = CryptoJS.AES.encrypt(email + ";" + password, key_str, { iv: CryptoJS.enc.Hex.parse(iv_str) });
    return md5(md5_1 + md5_2 + md5_3 + key_str + iv_str) + id + encrypted.toString() + ";" + keys_str
}
export function getCookie(data: string) {
    let id = DID
    if (data == "null" || !data.includes(id)) {
        return {
            email: "",
            password: ""
        }
    }
    data = data.split(id)[1]
    let keys_str = data.split(";")[1]
    let key_str = keys_str.slice(0, keys_str.length / 2)
    let iv_str = keys_str.replace(key_str, "")
    let decrypted = CryptoJS.AES.decrypt(data.split(";")[0], key_str, { iv: CryptoJS.enc.Hex.parse(iv_str) }).toString(CryptoJS.enc.Utf8).split(';')
    return {
        email: decrypted[0],
        password: decrypted[1]
    }
}
function genID() {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const txt = navigator.userAgent
    ctx.textBaseline = "top"
    ctx.font = "14px 'Arial'"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "#f60"
    ctx.fillRect(191, 81, 0, 20)
    ctx.fillStyle = "#069"
    ctx.fillText(txt, 11, 45)
    ctx.fillStyle = "rgba(114, 51, 4, 0.1145)"
    ctx.fillText(txt, 1, 4)
    const b64 = canvas.toDataURL().replace("data:image/png;base64,", "")
    return atob(md5(atob(b64) + id).slice(0, 16))
}