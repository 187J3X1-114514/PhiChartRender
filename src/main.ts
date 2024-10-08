import 'mdui/mdui.css'
import { Button, Card, Select, MenuItem } from 'mdui';
import { ResourceManger } from './core/resource';
import './styles.css'
import 'mdui/components/icon.js';
import { reqFullSc } from './ui';
import { ChartPage } from './ui/phira/chart/chart';
import { account, app, reqLogin, ResPack } from './ui/main';
import { PlayS } from './ui/play/play';
import { ON_TAURI } from './ui/tauri';
document.documentElement.addEventListener("click", () => {
    if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) reqFullSc()
})
if (document.URL.includes("?") || ON_TAURI && false) {
    await reqLogin()
    let api = account!
    let cp = await ChartPage.create(api, app)
}
else {

    //document.body.append(c)
}
