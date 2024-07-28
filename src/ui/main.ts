import { Avatar, ButtonIcon, Dropdown, MenuItem, NavigationDrawer, getTheme, setTheme, dialog } from "mdui"
import loginPage from "./phira/login"
import { PhiraAPI } from "../api/phira"
import { Zip, loadZip } from "../core/file";
import { ResourcePack } from "../core/resource";
import Cookies from 'js-cookie'
import { Theme } from "mdui/internal/theme";
import * as TAURI from "./tauri"
import { BUILD_ENV, BUILDTIME, GIT_HASH, PACKAGE_JSON } from "./env";
const UI_HTML = `    
<mdui-top-app-bar variant="hide" id="top-app-bar" style="display: flex">
        <mdui-button-icon icon="menu" id="top-app-bar-menu"></mdui-button-icon>
        <mdui-top-app-bar-title id="top-app-bar-title">一个及其简陋的Phigros模拟器</mdui-top-app-bar-title>

        <div style="flex-grow: 1" id="top-app-bar-other">
        </div>
        <div style="margin: auto 0;height: 100%;white-space:nowrap" id="top-app-bar-other">
            <mdui-button-icon variant="tonal" icon="auto_mode" id="mode" class="modeBtn"></mdui-button-icon>
            <mdui-dropdown trigger="hover" close-delay="2000" id="avatar-dropdown">
                <mdui-avatar style="height: 100%;right: 8px;" id="avatar" icon="account_circle" slot="trigger">
                </mdui-avatar>
                <mdui-menu>
                    <mdui-menu-item id="avatar-dropdown-1"> <mdui-icon slot="end-icon" name="login"></mdui-icon>
                        <span slot="end-text">登陆Phira账户</span></mdui-menu-item>
                    <mdui-menu-item id="avatar-dropdown-2"> <mdui-icon slot="end-icon" name="logout"></mdui-icon>
                        <span slot="end-text">登出Phira账户</span></mdui-menu-item>
                </mdui-menu>
            </mdui-dropdown>
            <h4 style="display:inline;" id="avatar-name">未登录</h4>
        </div>


    </mdui-top-app-bar>
    <mdui-navigation-drawer close-on-esc id="navigation-drawer" close-on-overlay-click style="top: 64px;">
        <mdui-list>
            <mdui-collapse>
                <mdui-collapse-item>
                    <mdui-list-item rounded slot="header" icon="class">分区<mdui-icon slot="end-icon" class="arrow"
                            name="expand_more"></mdui-icon></mdui-list-item>
                    <div style="margin-left: 2.5em;">
                        <mdui-list-item rounded id="class-chart-1">已上架</mdui-list-item>
                        <mdui-list-item rounded id="class-chart-2">未上架</mdui-list-item>
                        <mdui-list-item rounded id="class-chart-3">特殊</mdui-list-item>
                    </div>

                </mdui-collapse-item>
            </mdui-collapse>
        </mdui-list>
    </mdui-navigation-drawer>
`
let v = '' + PACKAGE_JSON.version.split('v').pop()
let nv = `V${v}-${GIT_HASH.slice(0, 7).toLocaleUpperCase()}@${BUILD_ENV.platform}/${BUILD_ENV.arch}/node${BUILD_ENV.versions.node}@BUILDTIME_${BUILDTIME}`
document.getElementById("info")!.innerText = nv
document.documentElement.classList.remove("black")
setTheme((() => {
    let t = Cookies.get("mode") ? Cookies.get("mode") : "auto"
    return (t) as Theme
})());
(()=>{
    try {
        new SharedArrayBuffer(4)
        return
    } catch {
        if (TAURI.ON_TAURI) {
            return
        }
        setTimeout(() => {
            location.reload()
        }, 10000)
        dialog(
            {
                headline: "提示",
                description: "检测到当前无法使用多线程功能，将在10秒后自动刷新页面，你也可以手动刷新页面，如果刷新后仍然出现此提升请反馈这个问题。",
                actions: [
                    {
                        text: "👌"
                    }
                ]
            }
        )
    }
})()

document.body.innerHTML = UI_HTML + document.body.innerHTML
export var account: undefined | PhiraAPI = undefined;
(document.getElementById("avatar-dropdown-1")! as MenuItem).disabled = false;
(document.getElementById("avatar-dropdown-2")! as MenuItem).disabled = true
export const topAppBar = document.getElementById("top-app-bar")!
export const topAppBarMenu = document.getElementById("top-app-bar-menu")!
export const topAppBarTitle = document.getElementById("top-app-bar-title")!
export const topAppBarOther = document.getElementById("top-app-bar-other")!
export const avatar = document.getElementById("avatar")! as Avatar
export const avatarName = document.getElementById("avatar-name")!
export const modeBtn = document.getElementById("mode")! as ButtonIcon
export const navigationDrawer = document.getElementById("navigation-drawer")! as NavigationDrawer
uModeBtn()

let a = await fetch("assets/pack/resource.zip")
let zip: Zip
zip = await loadZip("resource.zip", await a.blob())
export const ResPack = await ResourcePack.load(zip)
for (let e of document.getElementsByClassName("arrow")) {
    var el = (e as HTMLElement).parentElement as HTMLElement
    el.addEventListener("click", () => {
        if (e.classList.contains("arrow-active")) {
            e.classList.remove("arrow-active")
        } else {
            e.classList.add("arrow-active")
        }
    })
}
navigationDrawer.open = false
topAppBarMenu?.addEventListener("click", () => {
    navigationDrawer.open = navigationDrawer.open ? false : true
});
(document.getElementById("avatar-dropdown-1")! as MenuItem).addEventListener("click", () => {
    (document.getElementById("avatar-dropdown")! as Dropdown).open = false
    reqLogin()
});
(document.getElementById("avatar-dropdown-2")! as MenuItem).addEventListener("click", () => {
    (document.getElementById("avatar-dropdown")! as Dropdown).open = false
    reqLogout()
});
modeBtn.addEventListener("click", () => {
    let m = getTheme()
    let m_ = "auto"
    if (m == "light") m_ = "dark"
    if (m == "dark") m_ = "auto"
    if (m == "auto") m_ = "light"
    Cookies.set("mode", m_)
    setTheme(m_ as Theme)
    uModeBtn()

})
export async function reqLogin() {
    (document.getElementById("avatar-dropdown")! as Dropdown).open = false;
    (document.getElementById("avatar-dropdown-1")! as MenuItem).disabled = true;
    let loginR = await loginPage(document.body)
    if (loginR.ok) {
        (document.getElementById("avatar-dropdown-1")! as MenuItem).disabled = false;
        (document.getElementById("avatar-dropdown-2")! as MenuItem).disabled = false
        avatar.icon = undefined;
        (async () => {
            avatar.src = await loginR.api!.getAvatar()
        })()
        account = loginR.api!
        avatarName.innerText = account.userName
    } else {
        reqLogout()
    }
}
export async function reqLogout() {
    account = undefined;
    (document.getElementById("avatar-dropdown-1")! as MenuItem).disabled = false;
    (document.getElementById("avatar-dropdown-2")! as MenuItem).disabled = true;
    (document.getElementById("avatar-dropdown")! as Dropdown).open = false

    avatar.icon = "account_circle"
    avatar.src = undefined
    avatarName.innerText = "未登录"
}
export function getChartClassification() {

}
function uModeBtn() {
    let m = getTheme()
    let m_ = "auto_mode"
    if (m == "light") m_ = "light_mode"
    if (m == "dark") m_ = "dark_mode"
    if (m == "auto") m_ = "auto_mode"
    modeBtn.icon = m_
}