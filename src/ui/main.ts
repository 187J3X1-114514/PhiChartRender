import { BUILD_ENV, BUILDTIME, GIT_HASH, PACKAGE_JSON } from "./env";
import { VERSION as PIXI_VERSION } from "pixi.js";
import { STATUS, STATUSTEXT } from "./status";
import * as DB from "./data"

//////////////////////////////////////
document.getElementById("top-app-bar-title")!.innerText += (' V' + PACKAGE_JSON.version.split('v').pop())
let v = '' + PACKAGE_JSON.version.split('v').pop()
let nv = `V${v}-${GIT_HASH.slice(0, 7).toLocaleUpperCase()}+pixi_${PIXI_VERSION}@${BUILD_ENV.platform}/${BUILD_ENV.arch}/node${BUILD_ENV.versions.node}@BUILDTIME_${BUILDTIME}`
document.getElementById("info")!.innerText = nv
//////////////////////////////////////
import { loadFont } from "../core/font";
STATUS.setStatus("加载字体中")
await loadFont()
STATUS.setStatus("")
STATUS.setStatusInfo("")

import { Avatar, ButtonIcon, Dropdown, MenuItem, NavigationDrawer, getTheme, setTheme, CircularProgress, LinearProgress, NavigationRail, Collapse, NavigationRailItem } from "mdui"
import loginPage from "./phira/login"
import { PhiraAPI } from "../api/phira"
import { Zip, loadZip } from "../core/file";
import { ResourcePack } from "../core/resource";
import Cookies from 'js-cookie'
import { Theme } from "mdui/internal/theme";
import { get_theme, main, MAINWINDOW_HWND, ON_TAURI, RUN_RS_FN } from "./tauri";
import { openDebug } from "./debug/ui_pos";
import { background } from "./background/background";
import { LocalScreen } from "./screen/local";
import { ChartPage } from "./phira/chart/chart";


const UI_HTML = `    

`
async function setThemeP(a: string) {
    if (a != "auto") {
        document.body.style.setProperty("--color", a == "light" ? "#000000" : "#FFFFFF")
        document.body.style.setProperty("--color--s", a == "light" ? "255" : "0")
    } else {
        document.body.style.setProperty("--color", window.matchMedia("(prefers-color-scheme: light)").matches ? "#000000" : "#FFFFFF")
        document.body.style.setProperty("--color--s", window.matchMedia("(prefers-color-scheme: light)").matches ? "255" : "0")
    }
    if (ON_TAURI) {
        switch (a) {
            case "light":
                await RUN_RS_FN("set_theme", {
                    hwnd: MAINWINDOW_HWND,
                    mode: 0
                })
                break
            case "dark":
                await RUN_RS_FN("set_theme", {
                    hwnd: MAINWINDOW_HWND,
                    mode: 1
                })
                break
            case "auto":
                if (await get_theme() == 0) {
                    await RUN_RS_FN("set_theme", {
                        hwnd: MAINWINDOW_HWND,
                        mode: 1
                    })
                } else {
                    await RUN_RS_FN("set_theme", {
                        hwnd: MAINWINDOW_HWND,
                        mode: 0
                    })
                }

        }
    }
    setTheme(a as any);
}

setThemeP((() => {
    let t = Cookies.get("mode") ? Cookies.get("mode") : "auto"
    return (t) as Theme
})());
await main()
document.body.innerHTML = UI_HTML + document.body.innerHTML
export var account: undefined | PhiraAPI = undefined;
(document.getElementById("avatar-dropdown-1")! as MenuItem).disabled = false;
(document.getElementById("avatar-dropdown-2")! as MenuItem).disabled = true;
export const topAppBar = document.getElementById("top-app-bar")!
export const app = document.getElementById("app")!
export const topAppBarMenu = document.getElementById("top-app-bar-menu")!
export const topAppBarTitle = document.getElementById("top-app-bar-title")!
export const topAppBarOther = document.getElementById("top-app-bar-other")!
export const avatar = document.getElementById("avatar")! as Avatar
export const avatarName = document.getElementById("avatar-name")!
export const modeBtn = document.getElementById("mode")! as ButtonIcon
export const navigationDrawer = document.getElementById("navigation-drawer")! as NavigationDrawer
export const navigationRail = document.getElementById("navigation-rail")! as NavigationRail
export const locDrawer = document.getElementById("loc-drawer")! as Collapse
export const recDrawer = document.getElementById("rec-drawer")! as Collapse
export const phiraDrawer = document.getElementById("phira-drawer")! as Collapse
export const load = document.getElementById("load-stage")! as LinearProgress
export const debugBtn = document.getElementById("debug-btn")! as ButtonIcon
export const tabPhira = document.getElementById("tab-phira")! as NavigationRailItem
export const tabRec = document.getElementById("tab-rec")! as NavigationRailItem
export const tabLocal = document.getElementById("tab-local")! as NavigationRailItem
uModeBtn()

STATUS.setStatus("加载资源中")
let zip: Zip
STATUS.setStatusInfo("assets/pack/resource")
zip = await loadZip("resource.zip", await DB.getOrCreateCacheDATA("assets/pack/resource"))
export const ResPack = await ResourcePack.load(zip)
STATUS.setStatus("")
STATUS.setStatusInfo("")
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
export const BACKGROUND = await background.init()

var cp: ChartPage | undefined = undefined;
tabPhira.addEventListener("click", async () => {
    if (cp != undefined) {
        cp.root.classList.add("push-out-y")
        setTimeout(async () => {
            lScreen = new LocalScreen(app)
            lScreen.create()
            lScreen.root.classList.add("push-in-y")
            lScreen.addToPage()
            setTimeout(() => {
                lScreen!.root.classList.remove("push-in-y")
            }, 400)
        }, 220)
        setTimeout(() => {
            cp!.remove()
            cp = undefined
        }, 270)
    } else if (lScreen != undefined) {
        lScreen.root.classList.add("push-out-y")
        setTimeout(async () => {
            if (account == undefined) await reqLogin()
            let api = account!

            cp = ChartPage.create(api, app)
            cp.root.classList.add("push-in-y")
            setTimeout(() => {
                cp!.root.classList.remove("push-in-y")
            }, 400)
            await cp.searchChart()
        }, 220)
        setTimeout(() => {
            lScreen!.root.remove()
            lScreen!.destroy()
            lScreen = undefined
        }, 270)
    } else {
        while (true) {
            if (app.firstChild == null) break
            app.removeChild(app.firstChild!)
        }
        if (account == undefined) await reqLogin()
        let api = account!
        cp = ChartPage.create(api, app)
        cp.root.classList.add("push-in-y")
        setTimeout(() => {
            cp!.root.classList.remove("push-in-y")
        }, 400)
        await cp.searchChart()
    }
})
var lScreen: LocalScreen | undefined = undefined;
tabLocal.addEventListener("click", async () => {
    if (cp != undefined) {
        cp.root.classList.add("push-out-y")
        setTimeout(async () => {
            lScreen = new LocalScreen(app)
            lScreen.create()
            lScreen.root.classList.add("push-in-y")
            lScreen.addToPage()
            setTimeout(() => {
                lScreen!.root.classList.remove("push-in-y")
            }, 400)
        }, 220)
        setTimeout(() => {
            cp!.remove()
            cp = undefined
        }, 270)
    } else if (lScreen != undefined) {
        lScreen.root.classList.add("push-out-y")
        setTimeout(async () => {
            if (account == undefined) await reqLogin()
            let api = account!

            cp = ChartPage.create(api, app)
            cp.root.classList.add("push-in-y")
            setTimeout(() => {
                cp!.root.classList.remove("push-in-y")
            }, 400)
            await cp.searchChart()
        }, 220)
        setTimeout(() => {
            lScreen!.root.remove()
            lScreen!.destroy()
            lScreen = undefined
        }, 270)
    } else {
        lScreen = new LocalScreen(app)
        lScreen.create()
        setTimeout(() => {
            lScreen!.root.classList.remove("push-in-y")
        }, 400)
        lScreen.addToPage()
    }
})
tabLocal.click()
function buildCPross() {
    let r = new CircularProgress()
    r.style.height = "65%"
    return r
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
modeBtn.addEventListener("click", async () => {
    let m = getTheme()
    let m_ = "auto"
    if (m == "light") m_ = "dark"
    if (m == "dark") m_ = "auto"
    if (m == "auto") m_ = "light"
    Cookies.set("mode", m_)
    await setThemeP(m_ as Theme)
    if (m_ != "auto") {
        (document.getElementsByClassName("phira-github")[0]! as HTMLElement).style.setProperty("--color", m_ == "light" ? "#000000" : "#FFFFFF")
    } else {
        (document.getElementsByClassName("phira-github")[0]! as HTMLElement).style.setProperty("--color", window.matchMedia("(prefers-color-scheme: light)").matches ? "#000000" : "#FFFFFF")
    }

    uModeBtn()

})
navigationRail.addEventListener("change", () => {
    switch (navigationRail.value) {
        case "loc":
            locDrawer.classList.remove("hide")
            recDrawer.classList.add("hide")
            phiraDrawer.classList.add("hide")
            break
        case "rec":
            locDrawer.classList.add("hide")
            recDrawer.classList.remove("hide")
            phiraDrawer.classList.add("hide")
            break
        case "phira":
            locDrawer.classList.add("hide")
            recDrawer.classList.add("hide")
            phiraDrawer.classList.remove("hide")
            break
    }

})
debugBtn.addEventListener("click", async () => {
    await openDebug()
})
export async function reqLogin() {
    (document.getElementById("avatar-dropdown")! as Dropdown).open = false;
    (document.getElementById("avatar-dropdown-1")! as MenuItem).disabled = true;
    let loginR = await loginPage(document.body)
    if (loginR.ok) {
        (document.getElementById("avatar-dropdown-1")! as MenuItem).disabled = true;
        (document.getElementById("avatar-dropdown-2")! as MenuItem).disabled = false
        avatar.icon = undefined;
        let load = buildCPross()
        while (true) {
            if (avatar.firstChild == null) break
            avatar.removeChild(avatar.firstChild!)
        }
        avatar.appendChild(load)
        loginR.api!.getAvatar().then((s) => {
            if (s != "") {
                avatar.src = s
            }
            avatar.removeChild(load)
        })
        account = loginR.api
        avatarName.innerText = account!.userName
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

let classChart1 = document.getElementById("class-chart-1")!
let classChart2 = document.getElementById("class-chart-2")!
let classChart3 = document.getElementById("class-chart-3")!
classChart2.classList.add("list-item-active")
classChart1.addEventListener("click", () => {
    classChart1.classList.add("list-item-active")
    classChart2.classList.remove("list-item-active")
    classChart3.classList.remove("list-item-active")
    cp!.type = 0
    cp!.page = 1
    navigationDrawer.open = false
    cp!.searchChart()
})
classChart2.addEventListener("click", () => {
    classChart2.classList.add("list-item-active")
    classChart1.classList.remove("list-item-active")
    classChart3.classList.remove("list-item-active")
    cp!.type = 2
    cp!.page = 1
    navigationDrawer.open = false
    cp!.searchChart()
})
classChart3.addEventListener("click", () => {
    classChart3.classList.add("list-item-active")
    classChart1.classList.remove("list-item-active")
    classChart2.classList.remove("list-item-active")
    cp!.type = 1
    cp!.page = 1
    navigationDrawer.open = false
    cp!.searchChart()
})

//////////////////////////////////////////////////////////////////////////////
setTimeout(()=>{
    load.classList.add("hide")
    document.getElementById("start-o")!.classList.remove("black");
    setTimeout(()=>{
        document.getElementById("start-o")!.remove()
        STATUSTEXT.classList.toggle("status-text-onload")
        STATUSTEXT.classList.toggle("status-text-done")
    },300)
},100)

