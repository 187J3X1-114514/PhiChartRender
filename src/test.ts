import 'mdui/mdui.css'
import './styles.css'
import 'mdui/components/icon.js';
import "./main"
const chart = JSON.parse(await ((await fetch("19919062.json")).text()));
(window as any).chart = chart