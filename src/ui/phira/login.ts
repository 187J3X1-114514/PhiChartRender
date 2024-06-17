import { Button, Checkbox, CircularProgress, Dialog, TextField } from "mdui";
import { PhiraAPI, loginResult } from "../../api/phira";
import Cookies from 'js-cookie'
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
            dialog.headline = "登录中"
            dialogInput.removeChild(emailInput)
            dialogInput.removeChild(passwordInput)
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
            newCancelButton.innerText = api.api ? "好" : "重新登录"
            dialog.append(newCancelButton)
            if (!api.api) {
                t.removeChild(el)
                await loginPage(t)
            } else  if (checkKeepPassword.checked){
                Cookies.set("phira", JSON.stringify({
                    email: emailInput.value,
                    password: passwordInput.value
                }))
            }
            newCancelButton.addEventListener("click", () => {
                dialog.open = false
                dialog.addEventListener("closed", () => {
                    t.removeChild(el)
                    el.remove()
                })

                r(api)
            })
        })
        if (Cookies.get("phira")) {
            try {
                let p = JSON.parse(Cookies.get("phira")!)
                if (p.email && p.password) {
                    emailInput.value = p.email
                    passwordInput.value = p.password
                    checkKeepPassword.checked = true
                }
            } catch { }
        }
    })
}