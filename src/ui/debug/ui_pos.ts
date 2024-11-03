import { ButtonIcon, List, ListItem, Slider } from "mdui"
import { Application, Graphics } from "pixi.js"
import type {  UISettings } from "../../core/types/ui"
import debugUIManger from "../../core/ui/debug_ui"
import type { SizerData } from "../../core/types/params"

function calcResizer(width: number, height: number, noteScale = 8000, resolution = window.devicePixelRatio): SizerData {
    let result: SizerData = {} as any;

    result.shaderScreenSize = [width * resolution, height * resolution];

    result.width = height / 9 * 16 < width ? height / 9 * 16 : width;
    result.height = height;
    result.widthPercent = result.width * (9 / 160);
    result.widthOffset = (width - result.width) / 2;

    result.widerScreen = result.width < width ? true : false;

    result.startX = -result.width / 12;
    result.endX = result.width * (13 / 12);
    result.startY = -result.height / 12;
    result.endY = result.height * (13 / 12);

    result.noteSpeed = result.height * 0.6;
    result.noteScale = result.width / noteScale;
    result.noteWidth = result.width * 0.117775;
    result.lineScale = result.width > result.height * 0.75 ? result.height / 18.75 : result.width / 14.0625;
    result.heightPercent = result.height / 1080;
    result.textureScale = result.height / 750;
    result.baseFontSize = result.lineScale / result.heightPercent
    return result;
}

var defaultUISettings = {
    scale: {
        Pause: 1.0,
        ComboNumber: 1.0,
        Combo: 1.0,
        Score: 1.0,
        Name: 1.0,
        Level: 1.0
    },
    pos: {
        x: {
            Pause: 0.03,
            ComboNumber: 0.5,
            Combo: 0.5,
            Score: 0.03,
            Name: 0.03,
            Level: 0.03
        }
        , y: {
            Pause: 0.05,
            ComboNumber: 0.05,
            Combo: 0.09,
            Score: 0.05,
            Name: 0.05,
            Level: 0.05
        }
    },
    offset: {
        x: {
            Pause: 0.0,
            ComboNumber: 0.0,
            Combo: 0.0,
            Score: 0.0,
            Name: 0.0,
            Level: 0.0
        }
        , y: {
            Pause: 0.0,
            ComboNumber: 0.0,
            Combo: 0.0,
            Score: 0.0,
            Name: 0.0,
            Level: 0.0
        }
    }
} as UISettings

export async function openDebug() {



    //基本
    const main = document.createElement("div")
    const closeBtn = new ButtonIcon()
    closeBtn.icon = "close"
    closeBtn.classList.add("debug-ui-close")
    main.classList.add("debug-ui")
    main.classList.add("push-in-no-fadein")
    main.appendChild(closeBtn)
    closeBtn.addEventListener("click", () => {
        r.unobserve(canvas)
        main.classList.remove("push-in-no-fadein")
        main.classList.add("push-out-no-fadeout-toleft")

        setTimeout(() => {
            document.body.removeChild(main)
            main.remove()
            uimanger.reset()
            progressBar.destroy()
            app.destroy()
        }, 600)
    })
    document.body.appendChild(main)
    //画布
    const app = new Application()
    const canvas = document.createElement("canvas")
    const canvasDiv = document.createElement("div")
    canvas.classList.add("debug-ui-canvas")
    canvasDiv.classList.add("debug-ui-canvas-div")
    canvasDiv.appendChild(canvas)
    main.appendChild(canvasDiv)
    await app.init({
        canvas: canvas
    })
    //列表
    const list = new List()
    main.appendChild(list)
    list.classList.add("debug-ui-list")
    list.classList.add("debug-ui-list-div")
    const buildListItem = (name: string, step: number, max: number, min: number, change: (value: number) => void, defValue: number) => {
        const li = new ListItem()
        li.classList.add("debug-ui-list-item")
        const all = document.createElement("div")
        const text = document.createElement("span")
        all.slot = "custom"
        text.innerText = name
        text.classList.add("debug-ui-list-item-text")
        all.classList.add("debug-ui-list-item-all")
        li.appendChild(all)
        li.rounded = true
        all.appendChild(text)
        const sl = new Slider()
        sl.value = defValue
        sl.step = step
        sl.max = max
        sl.min = min
        sl.labelFormatter = (v) => {
            return v.toFixed(3)
        }
        sl.classList.add("debug-ui-list-item-sl")
        sl.addEventListener("input", () => {
            change(sl.value)
        })
        all.appendChild(sl)
        return li
    }
    const listBuildInfo = [{
        step: 0.001,
        max: 1,
        min: -1,
        name: "Combo文本X坐标",
        defValue: defaultUISettings.pos.x.Combo,
        change: (v: number) => {
            defaultUISettings.pos.x.Combo = v
        }
    },
    {
        step: 0.001,
        max: 1,
        min: -1,
        name: "Combo文本Y坐标",
        defValue: defaultUISettings.pos.y.Combo,
        change: (v: number) => {
            defaultUISettings.pos.y.Combo = v
        }
    },
    {
        step: 0.001,
        max: 1,
        min: -1,
        name: "Combo数量X坐标",
        defValue: defaultUISettings.pos.x.ComboNumber,
        change: (v: number) => {
            defaultUISettings.pos.x.ComboNumber = v
        }
    },
    {
        step: 0.001,
        max: 1,
        min: -1,
        name: "Combo数量Y坐标",
        defValue: defaultUISettings.pos.y.ComboNumber,
        change: (v: number) => {
            defaultUISettings.pos.y.ComboNumber = v
        }
    },
    {
        step: 0.001,
        max: 1,
        min: -1,
        name: "暂停按钮X坐标",
        defValue: defaultUISettings.pos.x.Pause,
        change: (v: number) => {
            defaultUISettings.pos.x.Pause = v
        }
    },
    {
        step: 0.001,
        max: 1,
        min: -1,
        name: "暂停按钮Y坐标",
        defValue: defaultUISettings.pos.y.Pause,
        change: (v: number) => {
            defaultUISettings.pos.y.Pause = v
        }
    },
    {
        step: 0.001,
        max: 1,
        min: -1,
        name: "分数X坐标",
        defValue: defaultUISettings.pos.x.Score,
        change: (v: number) => {
            defaultUISettings.pos.x.Score = v
        }
    },
    {
        step: 0.001,
        max: 1,
        min: -1,
        name: "分数Y坐标",
        defValue: defaultUISettings.pos.y.Score,
        change: (v: number) => {
            defaultUISettings.pos.y.Score = v
        }
    },
    {
        step: 0.001,
        max: 1,
        min: -1,
        name: "歌曲名称X坐标",
        defValue: defaultUISettings.pos.x.Name,
        change: (v: number) => {
            defaultUISettings.pos.x.Name = v
        }
    },
    {
        step: 0.001,
        max: 1,
        min: -1,
        name: "歌曲名称Y坐标",
        defValue: defaultUISettings.pos.y.Name,
        change: (v: number) => {
            defaultUISettings.pos.y.Name = v
        }
    },
    {
        step: 0.001,
        max: 1,
        min: -1,
        name: "等级X坐标",
        defValue: defaultUISettings.pos.x.Level,
        change: (v: number) => {
            defaultUISettings.pos.x.Level = v
        }
    },
    {
        step: 0.001,
        max: 1,
        min: -1,
        name: "等级Y坐标",
        defValue: defaultUISettings.pos.y.Level,
        change: (v: number) => {
            defaultUISettings.pos.y.Level = v
        }
    },
    {
        step: 0.001,
        max: 1,
        min: -1,
        name: "Combo文本缩放",
        defValue: defaultUISettings.scale.Combo,
        change: (v: number) => {
            defaultUISettings.scale.Combo = v
        }
    },
    {
        step: 0.001,
        max: 1,
        min: -1,
        name: "Combo数缩放",
        defValue: defaultUISettings.scale.ComboNumber,
        change: (v: number) => {
            defaultUISettings.scale.ComboNumber = v
        }
    },
    {
        step: 0.001,
        max: 1,
        min: -1,
        name: "暂停按钮缩放",
        defValue: defaultUISettings.scale.Pause,
        change: (v: number) => {
            defaultUISettings.scale.Pause = v
        }
    },
    {
        step: 0.001,
        max: 1,
        min: -1,
        name: "分数缩放",
        defValue: defaultUISettings.scale.Score,
        change: (v: number) => {
            defaultUISettings.scale.Score = v
        }
    },
    {
        step: 0.001,
        max: 1,
        min: -1,
        name: "歌曲名称缩放",
        defValue: defaultUISettings.scale.Name,
        change: (v: number) => {
            defaultUISettings.scale.Name = v
        }
    },
    {
        step: 0.001,
        max: 1,
        min: -1,
        name: "等级缩放",
        defValue: defaultUISettings.scale.Level,
        change: (v: number) => {
            defaultUISettings.scale.Level = v
        }
    }]
    for (let info of listBuildInfo) {
        list.appendChild(buildListItem(info.name, info.step, info.max, info.min, info.change, info.defValue))
    }

    //实时预览
    const uimanger = new debugUIManger(app.stage,defaultUISettings);
    const progressBar = new Graphics()
    uimanger.createSprites();
    progressBar.alpha = 0.75
    progressBar.zIndex = 99999
    app.stage.addChild(progressBar)
    let r = new ResizeObserver(() => {
        resize(canvas.width, canvas.height)
    })
    r.observe(canvas)
    app.ticker.maxFPS = 30
    app.ticker.add(()=>{
        //console.log(defaultUISettings)
        (uimanger.element.Combo.sprite as any).text = "AUTOPLAY";
        (uimanger.element.ComboNumber.sprite as any).text = "9999";
        (uimanger.element.Level.sprite as any).text = "IN.11";
        (uimanger.element.Name.sprite as any).text = "UI位置测试";
        (uimanger.element.Score.sprite as any).text = "0978988";
        uimanger.settings = defaultUISettings
        uimanger.resizeSprites(calcResizer(canvas.width,canvas.height),false)
        uimanger.calcTime()
    })
    const resize = (w: number, h: number) => {
        //进度条
        let PBarW = w
        let PBarH = 12
        let PBarWW = 3
        progressBar.clear()
        progressBar.rect(0, 0, PBarW - PBarWW, PBarH).fill({ color: "#919191" })
        progressBar.rect(PBarW - PBarWW, 0, PBarWW, PBarH).fill({ color: "#FFFFFF" })
        progressBar.scale.y = (h / 1080) * 0.85
        progressBar.x = -w * 0.4
        //
        
        
    }
}