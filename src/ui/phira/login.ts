import { Button, Checkbox, CircularProgress, Dialog, TextField } from "mdui";
import { PhiraAPI, loginResult } from "../../api/phira";
import Cookies from 'js-cookie'
import md5 from 'md5-js'
import * as CryptoJS from 'crypto-js'
import protocolPage from "./terms_of_use";
export default async function loginPage(t: Element): Promise<loginResult> {

    const el = document.createElement("div")
    el.style.position = "absolute"
    el.style.top = "0px"
    el.style.left = "0px"
    el.style.zIndex = "999"
    const dialog = new Dialog()
    dialog.classList.add("close-on-overlay-click")
    dialog.headline = "登录Phira账号"
    const dialogInput = document.createElement("div")
    dialogInput.slot = "description"
    //email#####################################
    const emailInput = new TextField()
    const emailInputHelp = document.createElement("span")
    emailInputHelp.slot = "helper"
    emailInput.addEventListener("input", () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (emailRegex.test(emailInput.value)) {
            emailInputHelp.innerText = emailInput.value + "是一个电子邮箱😊"
            emailInputHelp.style.color = "unset"
            emailInput.style.color = "unset"
        }
    })
    emailInput.label = "电子邮箱"
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
            passwordInputHelp.innerText = passwordInput.value.length >= 32 ? "你能记住吗🤔" : "很合理的密码🤗"
            passwordInputHelp.style.color = "unset"
        } else if (passwordInput.value == "") {
            passwordInputHelp.innerText = ""
            passwordInputHelp.style.color = "unset"
        } else {
            passwordInputHelp.innerText = "密码太短了😒"
            passwordInputHelp.style.color = "#f2b8b5"
        }
    })
    passwordInput.label = "密码"
    passwordInput.type = "password"
    passwordInput.togglePassword = true
    passwordInput.append(passwordInputHelp)
    passwordInput.autocomplete = "on"
    emailInput.autocomplete = "on"
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
    okButton.innerText = "登录"
    okButton.append(okIcon)
    cancelButton.innerText = "取消"
    const checkKeepPassword = new Checkbox()
    checkKeepPassword.innerText = "记住账号与密码"
    dialog.append(cancelButton)
    dialog.append(okButton)
    dialogInput.append(checkKeepPassword)
    dialog.append(dialogInput)
    el.append(dialog)
    t.append(el)
    dialog.open = true
    return await new Promise<loginResult>(async (r) => {
        cancelButton.addEventListener("click", () => {
            dialog.open = false
            dialog.addEventListener("closed", () => {
                t.removeChild(el)
                el.remove()
            })
            r({ api: undefined, ok: false, status: 200, error: "用户取消操作" } as loginResult)
        })
        okButton.addEventListener("click", async () => {
            let pr = await protocolPage(t)
            if (!(pr.privacy_policy && pr.terms_of_use)) {
                dialog.headline = "登录失败"
                dialog.removeChild(okButton)
                dialogInput.removeChild(emailInput)
                dialogInput.removeChild(passwordInput)
                dialogInput.removeChild(checkKeepPassword)
                dialogInput.innerText = "在使用由 TeamFlos 提供的 Phira 线上服务之前，你必须阅读并同意TeamFlos的《服务条款》和《隐私政策》"
                let newCancelButton = new Button()
                newCancelButton.slot = "action"
                newCancelButton.variant = "elevated"
                newCancelButton.innerText = "好"
                dialog.append(newCancelButton)
                newCancelButton.addEventListener("click", () => {
                    dialog.open = false
                    dialog.addEventListener("closed", () => {
                        t.removeChild(el)
                        el.remove()
                    })
                    r({ api: undefined, ok: false, status: 200, error: "用户不同意TeamFlos的《服务条款》和《隐私政策》" } as loginResult)
                })
            } else {
                dialog.headline = "登录中"
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
                dialog.headline = api.api ? "登录成功" : "登录失败"
                dialogInput.removeChild(p)
                dialog.removeChild(cancelButton)

                let newCancelButton = new Button()
                newCancelButton.slot = "action"
                newCancelButton.variant = "elevated"
                newCancelButton.innerText = "好"
                dialog.append(newCancelButton)
                if (api.api) {
                    Cookies.set("phira", checkKeepPassword.checked ? genCookie(emailInput.value, passwordInput.value) : "null", { expires: 365 })
                }
                newCancelButton.addEventListener("click", () => {
                    dialog.open = false
                    dialog.addEventListener("closed", () => {
                        t.removeChild(el)
                        el.remove()
                    })

                    r(api)
                })
            }

        })
        if (Cookies.get("phira")) {
            try {
                let p = getCookie(Cookies.get("phira")!)
                if (p.email != "" && p.password != "") {
                    emailInput.value = p.email
                    passwordInput.value = p.password
                    checkKeepPassword.checked = true
                }
            } catch { }
        }
    })
}
//如果你要看这些代码来获取别人的账号+密码，那我只能说fuck you,My dear bitch🤗🤗🤗🤗

function generateRandom(): number {
    return Math.atan2(Math.random() * Math.cos(Math.random()) * Math.sin(Math.random()), Math.random() * Math.cos(Math.random()) * Math.sin(Math.random()))
}

export function genCookie(email: string, password: string) {
    let id = genID()
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
    let id = genID()
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
    return atob(md5(atob(b64)).slice(0, 16))
}