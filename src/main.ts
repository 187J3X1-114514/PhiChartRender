import 'mdui/mdui.css'
import './styles.css'
import 'mdui/components/icon.js';
import { reqFullSc } from './ui';
import { createApp } from 'vue'
import App from './ui/App.vue'
document.documentElement.addEventListener("click", () => {
    if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) reqFullSc()
})

export const app = createApp(App)
app.mount('#app')

