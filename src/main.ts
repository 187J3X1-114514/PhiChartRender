import 'mdui/mdui.css'
import './styles.css'
import 'mdui/components/icon.js';
import { APP, reqFullSc } from './ui';
import { createApp } from 'vue'
import App from './ui/App.vue'

document.body.addEventListener("click", () => {
    if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) reqFullSc()
})

export const app = createApp(App)
app.mount(APP)

