import 'mdui/mdui.css'
import './styles.css'
import 'mdui/components/icon.js';
import { ResourceManager, ResourcePack } from './core/resource';
import { WebGLApplication } from './gl/WebGLApplication';
import PhiGame from './core/game';
import { loadZip } from './core/file'
import { GameRecorder } from './ui/record';
import { downloadBlob } from './ui/record/utils';

let src = await (await fetch("assets/pack/resource")).blob()
let zip = await loadZip("resource.zip", src)
const ResPack = await ResourcePack.load(zip)

const resourceManager = new ResourceManager()
await resourceManager.load("chart.zip", await (await fetch("/test")).blob())
console.log(resourceManager)
const chart = resourceManager.charts["2744615.json"]!
const canvas = document.createElement("canvas")
canvas.width = 2710
canvas.height = 1220
document.body.appendChild(canvas)
const app = await WebGLApplication.create(canvas)
app.resize(2710, 1220)
await chart.blur(40)
const chart_data = chart.get(resourceManager)
const game = await PhiGame.create({
    app: app,
    render: {},
    chart: chart_data!,
    assets: ResPack.Assets,
    zipFiles: resourceManager,
    settings: {
        autoPlay: true,
        prprExtra: true,
        showInputPoint: false,
        showPerformanceInfo: false,
        bgDim: 0.1,
        antialias: false,
        antialiasType: 1,
        noteScale: 1.2,
        audioOffset: 0,
        recordMode: true
    }
})
const recorder = new GameRecorder({
    width: 2710,
    height: 1220,
    fps: 30,
    game: game
})
game.createSprites()
game.start()
await recorder.init()
let i = setInterval(async () => {
    game.calcTickByCurrentTime(recorder.time)
    game.render()
    await recorder.step()
    if (recorder.frameCount > recorder.totalFrame) {
        let b = await recorder.encoder.stop();
        downloadBlob("test.mp4", [b], "")
        clearInterval(i)
    }
}, 1000 / 30)

