/*

import { I18N } from "./i18n";
import { STATUS, STATUSTEXT } from "./status";
import * as DB from "./data"

import { loadFont } from "../core/font";
STATUS.setStatus(I18N.get("status.load_font"))
await loadFont()
STATUS.setStatus("")
STATUS.setStatusInfo("")

import { Avatar, ButtonIcon, Dropdown, MenuItem, NavigationDrawer, getTheme, CircularProgress, LinearProgress, NavigationRail, Collapse, NavigationRailItem } from "mdui"
import loginPage from "./phira/login"
import { PhiraAPI } from "../api/phira"
import { Zip, loadZip } from "../core/file";
import { ResourcePack } from "../core/resource";
import { openDebug } from "./debug/ui_pos";
import { background } from "./background/background";
import { LocalScreen } from "./screen/local";
import { PhiraChartScreen } from "./screen/phira";

export var account: undefined | PhiraAPI = undefined;
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

export const BACKGROUND = await background.init()

tabPhira.addEventListener("click", async () => {
    SCREEN.change(new PhiraChartScreen(app), async () => {
        await reqLogin()
    })
})

tabLocal.addEventListener("click", async () => {
    SCREEN.change(new LocalScreen(app))
})
tabLocal.click()
function buildCPross() {
    let r = new CircularProgress()
    r.style.height = "65%"
    return r
}
(document.getElementById("avatar-dropdown-1")! as MenuItem).addEventListener("click", () => {
    (document.getElementById("avatar-dropdown")! as Dropdown).open = false
    reqLogin()
});
(document.getElementById("avatar-dropdown-2")! as MenuItem).addEventListener("click", () => {
    (document.getElementById("avatar-dropdown")! as Dropdown).open = false
    reqLogout()
});
/*
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
    if (account != undefined) return
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
    avatarName.innerText = I18N.get("ui.text.not_login")
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
    if (SCREEN.screen instanceof PhiraChartScreen) {
        SCREEN.screen.chartPage!.type = 0
        SCREEN.screen.chartPage!.page = 1
        SCREEN.screen.chartPage!.searchChart()
    }

    navigationDrawer.open = false
})
classChart2.addEventListener("click", () => {
    classChart2.classList.add("list-item-active")
    classChart1.classList.remove("list-item-active")
    classChart3.classList.remove("list-item-active")
    if (SCREEN.screen instanceof PhiraChartScreen) {
        SCREEN.screen.chartPage!.type = 2
        SCREEN.screen.chartPage!.page = 1
        SCREEN.screen.chartPage!.searchChart()
    }
    navigationDrawer.open = false
})
classChart3.addEventListener("click", () => {
    classChart3.classList.add("list-item-active")
    classChart1.classList.remove("list-item-active")
    classChart2.classList.remove("list-item-active")
    if (SCREEN.screen instanceof PhiraChartScreen) {
        SCREEN.screen.chartPage!.type = 1
        SCREEN.screen.chartPage!.page = 1
        SCREEN.screen.chartPage!.searchChart()
    }
    navigationDrawer.open = false
})

//////////////////////////////////////////////////////////////////////////////
setTimeout(() => {
    load.classList.add("hide")
    document.getElementById("start-o")!.classList.remove("black");
    setTimeout(() => {
        document.getElementById("start-o")!.remove()
        STATUSTEXT.classList.toggle("status-text-onload")
        STATUSTEXT.classList.toggle("status-text-done")
    }, 300)
}, 100)
*/