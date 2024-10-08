import 'mdui/mdui.css'
import './styles.css'
import 'mdui/components/icon.js';
import { reqFullSc } from './ui';
import './ui/main';
document.documentElement.addEventListener("click", () => {
    if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) reqFullSc()
})
