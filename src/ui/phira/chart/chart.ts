import { Button, LinearProgress, TextField, Card, Chip, Divider, Select, MenuItem } from "mdui";
import { dialog } from "mdui/functions/dialog.js";
import { PhiraAPI, PhiraAPIChartInfo, SearchDivision, SearchOrder } from "../../../api/phira";
import { PHIRA_API_BASE_URL_NO_CORS2, PHIRA_API_CORS } from "../../../api/url";
import { ResPack, account, navigationDrawer } from "../../main";
import { PlayS } from "../../play/play";
import { loadZip } from "../../../core/file/zip";
export let a = {
    id: 19508,
    name: "Ours",
    level: "IN Lv.14",
    charter: "Ours（vitaminb＆唯空wekon）",
    composer: "*Luna feat.初音ミク",
    illustrator: "",
    description: "B站:没有营养的维生素b＆唯空wekon\n高考纪念谱，希望大家喜欢！\n手元及屏元需同时@我们两位谱师\nps:那两个移动hold是全屏判定",
    illustration: "https://api.phira.cn/files/363219b3-37b5-47b4-9319-b70cb1f9e2e3",
    preview: "https://api.phira.cn/files/4ec5e086-9335-46d1-b983-c8157f82118f",
    file: "https://api.phira.cn/files/7740f9c2-527d-412d-b0d6-75fb392d25f3",
    uploader: 30,
    tags: [
        "regular"
    ],
    created: "2024-05-04T12:08:47.669191Z",
    updated: "2024-05-04T15:38:15.823452Z",
    chartUpdated: "2024-05-04T12:08:47.669191Z"
}
let classChart1 = document.getElementById("class-chart-1")!
let classChart2 = document.getElementById("class-chart-2")!
let classChart3 = document.getElementById("class-chart-3")!
const NONE_IMG = await (async () => {
    let c = document.createElement("canvas")
    let ctx = c.getContext("2d")!
    ctx.fillStyle = "rgb(33,33,33)"
    ctx.fillRect(0, 0, 1920, 1080)
    return c.toDataURL("image/png")
})()

export class ChartPage {
    public chart: PhiraAPIChartInfo[] = []
    public api: PhiraAPI = (undefined as unknown) as any
    //private el: HTMLElement = (undefined as unknown) as any
    public height: number = 7
    public width: number = 4
    private chartCount = 0
    private search?: TextField
    private cards?: HTMLDivElement
    private select1?: Select
    private select2?: Select
    private searchDiv?: HTMLDivElement
    //private pel: HTMLElement = (undefined as unknown) as any
    private searchBtn: Button = (undefined as unknown) as any
    private page: number = 1
    private type: number = 2
    private load: LinearProgress = (undefined as unknown) as any
    private div: HTMLDivElement = (undefined as unknown) as any
    private constructor() {

    }
    private afterCreate() {
        this.cards = document.createElement("div")
        this.search = new TextField()
        this.search.icon = "search"
        this.search.clearable = true
        this.search.label = "搜索"
        this.resize()
        const resizeObserver = new ResizeObserver((_entries) => {
            this.resize()
        })
        resizeObserver.observe(this.div);
        window.addEventListener("resize", () => this.resize())
        this.cards.classList.add("push-in")
        this.cards.classList.add("active")
        this.div.classList.add("fadeIn")
        this.div.classList.add("fadeIn-s")
        this.div.classList.remove("fadeIn-s")

        this.searchDiv = document.createElement("div")
        this.searchDiv.classList.add("push-in")
        this.select1 = new Select()
        this.select2 = new Select()
        this.select1.label = "排列顺序"
        this.select2.label = "类型"
        const addItem = (a: Select, b: SearchDivision | SearchOrder, t: string) => {
            let i = new MenuItem()
            i.value = b + "_"
            i.innerText = t + ""
            a.appendChild(i)
        }
        addItem(this.select1, SearchOrder.name, "名称")
        addItem(this.select1, SearchOrder.nameReverse, "名称逆序")
        addItem(this.select1, SearchOrder.rating, "评分")
        addItem(this.select1, SearchOrder.ratingReverse, "评分逆序")
        addItem(this.select1, SearchOrder.time, "时间")
        addItem(this.select1, SearchOrder.timeReverse, "时间逆序")
        addItem(this.select2, SearchDivision.ordinary, "常规")
        addItem(this.select2, SearchDivision.difficulty, "纯配置")
        addItem(this.select2, SearchDivision.shenjin, "整活")
        addItem(this.select2, SearchDivision.viewing, "观赏")
        this.select1.value = SearchOrder.timeReverse + "_"
        this.select2.value = SearchDivision.ordinary + "_"
        this.searchBtn = new Button()
        this.searchBtn.variant = "filled"
        this.searchBtn.icon = 'search'
        this.searchBtn.endIcon = 'arrow_forward'
        this.searchBtn.innerText = '搜索'
        this.searchBtn.fullWidth = true
        this.searchDiv.classList.add("search-div")
        this.search.classList.add("search-text")
        this.select1.classList.add("search-select1")
        this.select2.classList.add("search-select2")
        this.searchBtn.classList.add("search-btn")
        this.searchDiv.append(this.search)
        this.searchDiv.append(this.select1)
        this.searchDiv.append(this.select2)
        this.searchDiv.append(this.searchBtn)
        this.load = new LinearProgress()
        this.load.classList.add("search-load")
        this.load.classList.add("hide")
        this.div.append(this.searchDiv)
        document.body.append(this.load)
        this.div.append(new Divider())
        this.div.append(this.cards)
        classChart2.classList.add("list-item-active")
        this.searchBtn.addEventListener("click", async () => {
            this.searchBtn.disabled = true
            this.searchBtn.loading = true
            await this.searchC()
            this.searchBtn.disabled = false
            this.searchBtn.loading = false

        })
        classChart1.addEventListener("click", () => {
            classChart1.classList.add("list-item-active")
            classChart2.classList.remove("list-item-active")
            classChart3.classList.remove("list-item-active")
            this.type = 0
            this.page = 1
            navigationDrawer.open = false
            this.searchC()
        })
        classChart2.addEventListener("click", () => {
            classChart2.classList.add("list-item-active")
            classChart1.classList.remove("list-item-active")
            classChart3.classList.remove("list-item-active")
            this.type = 2
            this.page = 1
            navigationDrawer.open = false
            this.searchC()
        })
        classChart3.addEventListener("click", () => {
            classChart3.classList.add("list-item-active")
            classChart1.classList.remove("list-item-active")
            classChart2.classList.remove("list-item-active")
            this.type = 1
            this.page = 1
            navigationDrawer.open = false
            this.searchC()
        })
        setTimeout(() => {
        }, 200)
        setTimeout(() => {
            this.searchDiv!.classList.remove("push-in")

        }, 1000)

    }
    private resize() {
        let ratio = self.devicePixelRatio == 1 ? 1 : self.devicePixelRatio * 0.4
        this.width = Math.min(Math.max((Math.floor(this.cards!.clientWidth * ratio / 270) > 0 ? Math.floor(this.cards!.clientWidth * ratio / 270) : Math.ceil(this.cards!.clientWidth * ratio / 270)), 1), 5)
        this.cards!.style.gridTemplateColumns = `repeat(${this.width}, 1fr)`
    }
    static async create(api: PhiraAPI, el: HTMLElement) {

        let pel = document.createElement("div")
        el.appendChild(pel)
        let chartPage = new this()
        chartPage.api = api
        chartPage.div = pel
        chartPage.afterCreate()
        chartPage.cards!.style.display = 'grid'
        chartPage.cards!.style.gap = '20px'
        chartPage.cards!.style.margin = '10px'
        await chartPage.searchC()
        return chartPage
    }
    async genChartCard(data: PhiraAPIChartInfo) {
        this.chartCount++
        const rootCard = new Card()
        rootCard.style.opacity = '0'
        rootCard.style.transition = 'opacity 0.6s ease'
        rootCard.style.aspectRatio = '8/5'
        rootCard.classList.add("chart-illustration")
        const i = new Image()
        i.src = NONE_IMG
        let load = new LinearProgress()
        load.style.top = '0px'
        load.style.left = '0px'
        load.style.width = '100%'
        load.style.position = 'absolute'
        load.style.zIndex = "10"
        rootCard.clickable = true
        i.src = PHIRA_API_BASE_URL_NO_CORS2 + data.illustration.split("/").pop() + ".thumbnail"
        let level = new Chip()
        level.elevated = true
        level.appendChild((() => {
            let p = document.createElement("span")
            p.innerText = data.level
            if (data.level.toLowerCase().includes("sp")) {
                p.classList.add("sp")
            } else if (data.level.toLowerCase().includes("at")) {
                p.classList.add("at")
            } else if (data.level.toLowerCase().includes("in")) {
                p.classList.add("in")
            } else if (data.level.toLowerCase().includes("hd")) {
                p.classList.add("sp")
            } else if (data.level.toLowerCase().includes("ez")) {
                p.classList.add("ez")
            } else {
                p.classList.add("uk")
            }
            p.style.zIndex = "4"
            return p
        })())
        let info = document.createElement("div")
        info.classList.add("chart-info")
        rootCard.appendChild((() => {
            let p = document.createElement("span")
            p.innerText = data.name
            p.style.zIndex = "5"
            p.classList.add("chart-name")
            return p
        })())
        rootCard.appendChild((() => {
            let p = document.createElement("span")
            p.innerText = data.charter
            p.style.zIndex = "5"
            p.classList.add("chart-charter")
            return p
        })())
        level.classList.add("top-right")
        i.addEventListener('dragstart', (event) => {
            event.preventDefault()
        });
        i.addEventListener('contextmenu', (event) => {
            event.preventDefault()
        });
        rootCard.addEventListener('select', (event) => {
            event.preventDefault()
        });
        i.onload = () => {
            load.remove();

        };
        rootCard.appendChild(i)
        rootCard.appendChild(level)
        rootCard.appendChild(info)
        rootCard.appendChild(load)
        this.cards!.append(rootCard)
        setTimeout(() => {
            rootCard.style.opacity = '1'
            rootCard.classList.add("fadein-scale")
        }, 100 + this.chartCount * 60)
        this.resize()
        rootCard.addEventListener("click", () => {
            setTimeout(() => {
                this.div!.classList.add("push-out")
                setTimeout(() => {
                    this.div.classList.add("hide")
                    this.div!.classList.remove("push-out")
                }, 650)
                this.playChart(data)
            }, 150)
        })
        return {
            data: data,
            el: rootCard
        };
    }
    async searchC() {

        let api = account!
        let r = await api.search(
            api.getSearchOrder(this.select1!.value.slice(0, this.select1!.value.length - 1) as string),
            api.getSearchDivision(this.select2!.value.slice(0, this.select2!.value.length - 1) as string),
            this.search!.value, 30, this.page, this.type
        )
        while (this.cards!.firstChild) {
            this.cards!.removeChild(this.cards!.firstChild)
        }
        this.load.classList.remove("hide")
        r.results.forEach(async (v) => {
            await this.genChartCard(v)
        })
        let a = setInterval(() => {
            let c = true
            for (let b of this.cards!.getElementsByTagName("mdui-card")) {
                if (b.getElementsByTagName("mdui-linear-progress").length != 0) {
                    c = false
                }
            }
            if (c) {
                this.load.classList.add("hide")
                clearInterval(a)
            }
        }, 100)
    }
    async playChart(data: PhiraAPIChartInfo) {
        this.load.classList.remove("hide")
        var r
        const f = async () => {
            try {
                r = await fetch(
                    (PHIRA_API_CORS + data.file).replace("https://api.phira.cn/files/", PHIRA_API_BASE_URL_NO_CORS2),
                    { method: "GET", headers: {'Authorization': 'Bearer ' + account!.userToken } }
                )
                return
            } catch {
                dialog(
                    {
                        headline: "错误",
                        description: "在尝试获取铺面时发生错误，URL：" + (PHIRA_API_CORS + data.file).replace("https://api.phira.cn/files/", PHIRA_API_BASE_URL_NO_CORS2),
                        actions: [
                            {
                                text: "返回",
                                onClick: () => {
                                    this.load.classList.add("hide")
                                    this.div!.classList.add("push-in")
                                    this.div.classList.remove("hide")
                                }
                            },
                            {
                                text: "重试",
                                onClick: async () => { await f() },
                            }
                        ]
                    }
                )

            }
        }
        await f()

        let ac = await loadZip(generateRandomString(32) + ".zip", await r!.blob())
        let li: any[] = []
        ac.files.forEach((v) => { li.push(v) })
        let c = new PlayS(li, ResPack)
        c.setOnEnd(() => {
            setTimeout(() => {
                this.div!.classList.add("push-in")
                this.div.classList.remove("hide")
            }, 650)
        })
        await c.load()
        this.load.classList.add("hide")
        c.start()
    }

}
function generateRandomString(length: number): string {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}

