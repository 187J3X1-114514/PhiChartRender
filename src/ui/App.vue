<template>
    <div ref="app">
        <ScreenComponent :screen-name="screenName" :other-data="screenOtherData"></ScreenComponent>
    </div>
    <!--
    <span class="info" id="info">{{ verText }}</span>
    -->
    <mdui-top-app-bar :class="{ 'tauri': ON_TAURI, 'windows': ON_WINDOWS, 'flex-display': true }" ref="topAppBar"
        variant="hide" id="top-app-bar" style="display: flex" class="left-all top-app-bar">
        <div class="top-app-bar-blur"></div>
        <LogoComponent style="width: 2em;height: 2em;padding-left: 1em;"></LogoComponent>
        <mdui-top-app-bar-title id="top-app-bar-title">
            Phigros Simulator Plus {{ 'V' + PACKAGE_JSON.version.split('v').pop() }}</mdui-top-app-bar-title>
        <div style="flex-grow: 1" id="top-app-bar-other">
        </div>
        <div style="margin: auto 0;height: 100%;white-space:nowrap" id="top-app-bar-other">
            <mdui-dropdown trigger="hover" id="theme-dropdown" placement="bottom">
                <mdui-button-icon variant="tonal" icon="auto_mode" id="mode" ref="modeBtn" slot="trigger"
                    class="modeBtn" @click="modeBtnClick()"></mdui-button-icon>
                <mdui-menu selects="single" id="modeMenu" @change="modeMenuClick()">
                    <mdui-menu-item :selected="THEME === 'light'" value="light">
                        <mdui-icon slot="end-icon" name="light_mode"></mdui-icon>
                        <span slot="end-text">{{ I18N("html.light_mode") }}</span>
                    </mdui-menu-item>
                    <mdui-menu-item :selected="THEME === 'dark'" value="dark">
                        <mdui-icon slot="end-icon" name="dark_mode"></mdui-icon>
                        <span slot="end-text">{{ I18N("html.dark_mode") }}</span>
                    </mdui-menu-item>
                    <mdui-divider></mdui-divider>
                    <mdui-menu-item :selected="THEME === 'auto'" value="auto">
                        <mdui-icon slot="end-icon" name="auto_mode"></mdui-icon>
                        <span slot="end-text">{{ I18N("html.auto_mode") }}</span>
                    </mdui-menu-item>
                </mdui-menu>
            </mdui-dropdown>
            <mdui-dropdown trigger="hover" id="avatar-dropdown">
                <mdui-avatar style="height: 100%;right: 8px;" id="avatar" ref="avatar" icon="account_circle"
                    slot="trigger">

                </mdui-avatar>
                <mdui-menu>
                    <mdui-menu-item id="avatar-dropdown-1" @click="reqLogin()"> <mdui-icon slot="end-icon"
                            name="login"></mdui-icon>
                        <span slot="end-text" id="avatar-dropdown-1-text">{{ I18N("html.login.phira.in")
                            }}</span></mdui-menu-item>
                    <mdui-menu-item id="avatar-dropdown-2" @click="reqLogout()" disabled> <mdui-icon slot="end-icon"
                            name="logout"></mdui-icon>
                        <span slot="end-text" id="avatar-dropdown-2-text">{{ I18N("html.login.phira.out")
                            }}</span></mdui-menu-item>
                </mdui-menu>
            </mdui-dropdown>
            <h4 style="display:inline;" id="avatar-name" ref="avatarName">{{ I18N("ui.text.not_login") }}</h4>
        </div>
    </mdui-top-app-bar>

    <mdui-navigation-rail :class="{ 'tauri': ON_TAURI, 'windows': ON_WINDOWS }" ref="navigationRail" value="welcome"
        id="navigation-rail">
        <div class="navigation-rail-blur"></div>
        <mdui-button-icon @click="navigationDrawer.open = (!navigationDrawer.open) && screenName != 'welcome'"
            icon="menu" slot="top" id="top-app-bar-menu" ref="top-app-bar-menu"
            :disabled="screenName == 'welcome'"></mdui-button-icon>
        <mdui-button-icon icon="bug_report" slot="bottom" id="debug-btn"></mdui-button-icon>
        <mdui-button-icon icon="settings" slot="bottom"></mdui-button-icon>
        <mdui-tooltip placement="right" slot="bottom" content="{{ I18N('html.src') }}" id="src-text-tooltip">
            <mdui-button-icon icon="source"
                onclick='window.open("https://github.com/187J3X1-114514/PhiChartRender")'></mdui-button-icon>
        </mdui-tooltip>

        <mdui-navigation-rail-item @click="changeScreen('phira')" icon="cloud" class="black-font" id="tab-phira"
            value="phira"><span>{{
                I18N("html.tab.phira") }}</span></mdui-navigation-rail-item>
        <mdui-navigation-rail-item @click="changeScreen('loc')" icon="insert_drive_file" value="loc" id="tab-local"
            class="black-font"><span>{{
                I18N("html.tab.local") }}</span></mdui-navigation-rail-item>
        <mdui-navigation-rail-item @click="changeScreen('test')" icon="bug_report" value="test" id="tab-test"
            class="black-font"><span>test</span></mdui-navigation-rail-item>

        <mdui-navigation-rail-item ref="navigationRailItem_WEL" value="welcome"
            style="display: none;"></mdui-navigation-rail-item>
    </mdui-navigation-rail>
    <mdui-navigation-drawer :class="{ 'tauri': ON_TAURI, 'windows': ON_WINDOWS }" modal close-on-esc
        id="navigation-drawer" ref="navigationDrawer" close-on-overlay-click>
        <div class="navigation-drawer-blur"></div>
        <mdui-list>
            <mdui-collapse v-show="screenName === 'phira'" accordion id="phira-drawer" class="collapse-rail">
                <mdui-collapse-item>
                    <mdui-list-item rounded slot="header" icon="class"><span id="html.phira.class-chart">{{
                        I18N("html.phira.class-chart") }}</span><mdui-icon slot="end-icon" class="arrow"
                            name="expand_more"></mdui-icon></mdui-list-item>
                    <div style="margin-left: 2.5em;">
                        <mdui-list-item rounded :class="{ 'list-item-active': phiraClassType === 0 }" id="class-chart-1"
                            @click="phiraClassType = 0; (screenOtherData as any).type = phiraClassType">{{
                                I18N("html.phira.class-chart-1")
                            }}</mdui-list-item>
                        <mdui-list-item rounded :class="{ 'list-item-active': phiraClassType === 2 }" id="class-chart-2"
                            @click="phiraClassType = 2; (screenOtherData as any).type = phiraClassType">{{
                                I18N("html.phira.class-chart-2")
                            }}</mdui-list-item>
                        <mdui-list-item rounded :class="{ 'list-item-active': phiraClassType === 1 }" id="class-chart-3"
                            @click="phiraClassType = 1; (screenOtherData as any).type = phiraClassType">{{
                                I18N("html.phira.class-chart-3") }}</mdui-list-item>
                    </div>

                </mdui-collapse-item>
            </mdui-collapse>
            <div id="rec-drawer" v-show="screenName === 'rec'" class="collapse-rail">
                <mdui-list-item rounded nonclickable class="dev-text">
                    <span id="rec-dev-text">
                        {{ I18N("html.dev") }}
                    </span>

                </mdui-list-item>
            </div>
            <mdui-collapse accordion id="loc-drawer" v-show="screenName === 'loc'" class="collapse-rail">
                <mdui-list-item rounded id="loc-drawer-1" icon="clear">{{ I18N("html.chart.clear")
                    }}</mdui-list-item>
                <mdui-list-item rounded id="loc-drawer-2" icon="folder">{{ I18N("html.chart.view")
                    }}</mdui-list-item>
            </mdui-collapse>
        </mdui-list>
    </mdui-navigation-drawer>
    <mdui-dialog fullscreen id="protocolDialog1">
        <div id="protocolText1"></div>
        <mdui-button id="protocolNO1" slot="action" variant="tonal">{{
            I18N("ui.screen.phira.terms_of_use.text.no") }}</mdui-button>
        <mdui-button id="protocolYES1" slot="action" disabled variant="tonal">{{
            I18N("html.protocol.yes") }}</mdui-button>
    </mdui-dialog>
    <mdui-dialog fullscreen id="protocolDialog2">
        <div id="protocolText2"></div>
        <mdui-button id="protocolNO2" slot="action" variant="tonal">{{
            I18N("ui.screen.phira.terms_of_use.text.no") }}</mdui-button>
        <mdui-button id="protocolYES2" slot="action" disabled variant="tonal">{{
            I18N("html.protocol.yes") }}</mdui-button>
    </mdui-dialog>
    <PauseOverlayComponent v-bind="__pauseOverlayData!"></PauseOverlayComponent>
</template>

<script lang="ts">
import { get_theme, ON_TAURI, ON_WINDOWS, set_theme } from './tauri';
import { onMounted, ref } from 'vue';
import { I18N } from "./i18n"
import { CircularProgress, Dropdown, getTheme, LinearProgress, MenuItem, setTheme, TopAppBar } from 'mdui';
import * as MDUI from 'mdui';
import Cookies from 'js-cookie'

import { BUILD_ENV, BUILDTIME, GIT_HASH, PACKAGE_JSON } from "./env";
import { VERSION as PIXI_VERSION } from "pixi.js";
import { PhiraAPI } from '@/api/phira';
import loginPage from './phira/login';
import { loadZip } from '@/core/file';
import { ResourcePack } from '@/core/resource';
import * as DB from "./data"
import { STATUSTEXT } from './status';
import { loadFont } from "../core/font";
import ScreenComponent from "./screen/ScreenComponent.vue"
import LogoComponent from './component/LogoComponent.vue';
await loadFont();
(window as any).MDUI = MDUI;

import { snackbar } from 'mdui/functions/snackbar.js';
import { reqFullSc } from '.';
import PauseOverlayComponent from './component/PauseOverlayComponent.vue';

if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) document.body.addEventListener("click", () => {
    reqFullSc()
})

try {
    new SharedArrayBuffer(4)
} catch {
    if (ON_TAURI) {
    } else {
        if (!(Cookies.get("isreload") == "1")) {
            snackbar({
                message: I18N.get("html.thread.error.a")
            })
            setTimeout(() => {
                Cookies.set("isreload", "1")
                location.reload()
            }, 10000)
        } else {
            snackbar({
                message: I18N.get("html.thread.error.b")
            })
        }
    }
}

export var account: undefined | PhiraAPI = undefined;
export const app = ref<HTMLElement>(null as any)
export const avatar = ref(null as any)
export const avatarName = ref(null as any)

export const topAppBar = ref<TopAppBar>(null as any)
export const load = document.getElementById("load-stage")! as LinearProgress
const THEME = ref(getTheme())
let zip = await loadZip("resource.zip", await DB.getOrCreateCacheDATA("assets/pack/resource"))
var __ResPack
try {
    __ResPack = await ResourcePack.load(zip)
} catch {
    let src = await (await fetch("assets/pack/resource")).blob()
    zip = await loadZip("resource.zip", src)
    try {
        __ResPack = await ResourcePack.load(zip)
        await DB.addCacheDATA("assets/pack/resource", src)
    } catch {

    }
}

export const ResPack = __ResPack as ResourcePack
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
function buildCPross() {
    let r = new CircularProgress()
    r.style.height = "65%"
    return r
}
export async function reqLogin() {
    if (account != undefined) return
    (document.getElementById("avatar-dropdown")! as Dropdown).open = false;
    (document.getElementById("avatar-dropdown-1")! as MenuItem).disabled = true;
    let loginR = await loginPage(document.body)
    if (loginR.ok) {
        (document.getElementById("avatar-dropdown-1")! as MenuItem).disabled = true;
        (document.getElementById("avatar-dropdown-2")! as MenuItem).disabled = false
        avatar.value.icon = undefined;
        let load = buildCPross()
        while (true) {
            if (avatar.value.firstChild == null) break
            avatar.value.removeChild(avatar.value.firstChild!)
        }
        avatar.value.appendChild(load)
        loginR.api!.getAvatar().then((s) => {
            if (s != "") {
                avatar.value.src = s
            }
            avatar.value.removeChild(load)
        })
        account = loginR.api
        avatarName.value.innerText = account!.userName
    } else {
        reqLogout()
    }
}
export async function reqLogout() {
    account = undefined;
    (document.getElementById("avatar-dropdown-1")! as MenuItem).disabled = false;
    (document.getElementById("avatar-dropdown-2")! as MenuItem).disabled = true;
    (document.getElementById("avatar-dropdown")! as Dropdown).open = false

    avatar.value.icon = "account_circle"
    avatar.value.src = undefined
    avatarName.value.innerText = I18N.get("ui.text.not_login")
}
const modeBtn = ref(null as any);
const navigationRail = ref(null as any)
const navigationDrawer = ref(null as any)
const navigationRailItem_WEL = ref()
async function setThemeP(a: string) {
    if (a != "auto") {
        document.body.style.setProperty("--color", a == "light" ? "#000000" : "#FFFFFF")
        document.body.style.setProperty("--color--s", a == "light" ? "255" : "0")
    } else {
        document.body.style.setProperty("--color", window.matchMedia("(prefers-color-scheme: light)").matches ? "#000000" : "#FFFFFF")
        document.body.style.setProperty("--color--s", window.matchMedia("(prefers-color-scheme: light)").matches ? "255" : "0")
    }
    THEME.value = a as any
    if (ON_TAURI) {
        if (a == "light") {
            await set_theme(0)
        }
        if (a == "dark") {
            await set_theme(1)
        }
        if (a == "auto") {
            await set_theme(await get_theme() == 0 ? 1 : 0)
        }
    }

    setTheme(a as any);
}
function uModeBtn() {
    let m = getTheme()
    let m_ = "auto_mode"
    if (m == "light") m_ = "light_mode"
    if (m == "dark") m_ = "dark_mode"
    if (m == "auto") m_ = "auto_mode"
    modeBtn.value.icon = m_
}
if (Cookies.get("mode")) {
    setThemeP(Cookies.get("mode")!)
}

export interface PauseOverlayData {
    open: boolean,
    hide: boolean,
    showCountdownTime: boolean,
    callbacks: {
        onNoCountdownTimeClosed: () => void;
        onclosed: () => void;
        clickBackButton: () => void;
        clickRetryButton: () => void;
        clickContinueButton: () => void;
    }
}

const __pauseOverlayData = ref<PauseOverlayData>({
    open: false,
    hide: true,
    showCountdownTime: true,
    callbacks: {
        onNoCountdownTimeClosed: () => { },
        onclosed: () => { },
        clickBackButton: () => { },
        clickRetryButton: () => { },
        clickContinueButton: () => { }
    }
})

export function _setPauseOverlayData(data: PauseOverlayData) {
    __pauseOverlayData.value = data
}

export function _shouldShowPauseOverlay(open: boolean) {
    if (__pauseOverlayData.value) {
        __pauseOverlayData.value.open = open
    }
}

export function _getPauseOverlayData() {
    return __pauseOverlayData
}



export default {
    name: 'Main',
    components: {
        ScreenComponent,
        LogoComponent,
        PauseOverlayComponent
    },
    data() {
        return {
            I18N: (l: string) => {
                return I18N.get(l)
            },
            phiraClassType: 2,
            BUILD_ENV: BUILD_ENV,
            BUILDTIME: BUILDTIME,
            GIT_HASH: GIT_HASH,
            PACKAGE_JSON: PACKAGE_JSON,
            PIXI_VERSION: PIXI_VERSION,
            THEME: THEME,
            screenName: "welcome",
            screenOtherData: {},
            ON_TAURI: ON_TAURI,
            ON_WINDOWS: ON_WINDOWS,

        }
    },
    setup() {
        onMounted(() => {
            (document.getElementById("src-text-tooltip")! as any).content = I18N.get('html.src')
            uModeBtn()
            setTimeout(() => {
                load.classList.add("hide")
                document.getElementById("start-o")?.classList.remove("black");
                setTimeout(() => {
                    document.getElementById("start-o")?.remove()
                    STATUSTEXT.classList.toggle("status-text-onload")
                    STATUSTEXT.classList.toggle("status-text-done")
                    //SCREEN.change(new LocalScreen(app.value))
                }, 300)
            }, 100)
        });
        return {
            modeBtn,
            navigationDrawer,
            navigationRail,
            load,
            topAppBar,
            app,
            avatar,
            avatarName,
            navigationRailItem_WEL,
            __pauseOverlayData
        };
    },
    methods: {
        modeBtnClick: async () => {
            let m = getTheme()
            let m_ = "auto"
            if (m == "light") m_ = "dark"
            if (m == "dark") m_ = "auto"
            if (m == "auto") m_ = "light"
            Cookies.set("mode", m_)
            await setThemeP(m_ as any)
            try {
                if (m_ != "auto") {

                    (document.getElementsByClassName("phira-github")[0]! as HTMLElement).style.setProperty("--color", m_ == "light" ? "#000000" : "#FFFFFF")
                } else {
                    (document.getElementsByClassName("phira-github")[0]! as HTMLElement).style.setProperty("--color", window.matchMedia("(prefers-color-scheme: light)").matches ? "#000000" : "#FFFFFF")
                }
            } catch { }
            uModeBtn()
        },
        modeMenuClick: async () => {
            let m_ = (document.getElementById("modeMenu")! as any).value
            Cookies.set("mode", m_)
            await setThemeP(m_ as any)
            try {
                if (m_ != "auto") {

                    (document.getElementsByClassName("phira-github")[0]! as HTMLElement).style.setProperty("--color", m_ == "light" ? "#000000" : "#FFFFFF")
                } else {
                    (document.getElementsByClassName("phira-github")[0]! as HTMLElement).style.setProperty("--color", window.matchMedia("(prefers-color-scheme: light)").matches ? "#000000" : "#FFFFFF")
                }
            } catch { }
            uModeBtn()
        },
        reqLogin: reqLogin,
        reqLogout: reqLogout,
        getTheme: () => { return getTheme() },
        changeScreen(s: string) {
            navigationDrawer.value.open = false
            if (s == navigationRail.value.value) {
                setTimeout(() => {
                    navigationRail.value.value = "welcome"
                }, 100)


                this.screenName = "welcome"
            } else {
                this.screenName = s
                navigationRail.value.value = s
            }
        }
    }
}

/*        <mdui-navigation-rail-item @click="changeScreen('rec')" icon="videocam" class="black-font" id="tab-rec"
            value="rec"><span>{{
                I18N("html.tab.rec") }}</span></mdui-navigation-rail-item> */
</script>