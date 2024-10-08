import { Button, LinearProgress, TextField, Card, Chip, Select, MenuItem } from "mdui";
import { dialog } from "mdui/functions/dialog.js";
import { PhiraAPI, PhiraAPIChartInfo, SearchDivision, SearchOrder } from "../../../api/phira";
import { PHIRA_API_BASE_URL_NO_CORS2, PHIRA_API_CORS } from "../../../api/url";
import { ResPack, account, navigationDrawer } from "../../main";
import { PlayS } from "../../play/play";
import { File } from "../../../core/file";
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
    public height: number = 7
    public width: number = 4
    private chartCount = 0
    private search?: TextField
    private cards?: HTMLDivElement
    private select1?: Select
    private select2?: Select
    private searchDiv?: HTMLDivElement
    private searchBtn: Button = (undefined as unknown) as any
    private page: number = 1
    private type: number = 2
    private load: LinearProgress = (undefined as unknown) as any
    public root: HTMLDivElement = (undefined as unknown) as any
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
        resizeObserver.observe(this.root);
        window.addEventListener("resize", () => this.resize())
        this.cards.classList.add("active")
        this.root.classList.add("fadeIn")
        this.root.classList.add("fadeIn-s")
        this.root.classList.remove("fadeIn-s")

        this.searchDiv = document.createElement("div")
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
        this.root.append(this.searchDiv)
        document.body.append(this.load)
        this.root.append(this.cards)
        classChart2.classList.add("list-item-active")
        this.searchBtn.addEventListener("click", async () => {
            this.searchBtn.disabled = true
            this.searchBtn.loading = true
            await this.searchChart()
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
            this.searchChart()
        })
        classChart2.addEventListener("click", () => {
            classChart2.classList.add("list-item-active")
            classChart1.classList.remove("list-item-active")
            classChart3.classList.remove("list-item-active")
            this.type = 2
            this.page = 1
            navigationDrawer.open = false
            this.searchChart()
        })
        classChart3.addEventListener("click", () => {
            classChart3.classList.add("list-item-active")
            classChart1.classList.remove("list-item-active")
            classChart2.classList.remove("list-item-active")
            this.type = 1
            this.page = 1
            navigationDrawer.open = false
            this.searchChart()
        })

    }
    private resize() {
        let ratio = self.devicePixelRatio == 1 ? 1 : self.devicePixelRatio * 0.4
        this.width = Math.min(Math.max((Math.floor(this.cards!.clientWidth * ratio / 270) > 0 ? Math.floor(this.cards!.clientWidth * ratio / 270) : Math.ceil(this.cards!.clientWidth * ratio / 270)), 1), 5)
        this.cards!.style.gridTemplateColumns = `repeat(${this.width}, 1fr)`
    }
    static create(api: PhiraAPI, el: HTMLElement) {
        let pel = document.createElement("div")
        el.appendChild(pel)
        let chartPage = new this()
        chartPage.api = api
        chartPage.root = pel
        chartPage.afterCreate()
        chartPage.cards!.style.display = 'grid'
        chartPage.cards!.style.gap = '20px'
        chartPage.cards!.style.margin = '10px'
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
        i.onerror = () => {
            load.remove();
            i.remove()
        }
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
                this.root!.classList.add("push-out")
                setTimeout(() => {
                    this.root.classList.add("hide")
                    this.root!.classList.remove("push-out")
                }, 650)
                this.playChart(data)
            }, 150)
        })
        return {
            data: data,
            el: rootCard
        };
    }
    async searchChart() {

        let api = account!
        let r = await api.search(
            api.getSearchOrder(this.select1!.value.slice(0, this.select1!.value.length - 1) as string),
            api.getSearchDivision(this.select2!.value.slice(0, this.select2!.value.length - 1) as string),
            this.search!.value, 30, this.page, this.type
        )
        while (this.cards!.firstChild) {
            this.cards!.removeChild(this.cards!.firstChild!)
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
            const srcUrl = data.file.replace("https://api.phira.cn/files/", PHIRA_API_BASE_URL_NO_CORS2);
            const url = (PHIRA_API_CORS + data.file).replace("https://api.phira.cn/files/", PHIRA_API_BASE_URL_NO_CORS2);
            try {
                r = await fetch(
                    url,
                    { method: "GET", headers: { 'Authorization': 'Bearer ' + account!.userToken } }
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
                                    this.root!.classList.add("push-in")
                                    setTimeout(() => {
                                        this.root!.classList.remove("push-in")
                                    }, 800)
                                    this.root.classList.remove("hide")
                                }
                            },
                            {
                                text: "重试",
                                onClick: async () => { await f() },
                            },
                            {
                                text: "手动下载",
                                onClick: async () => {
                                    const link = document.createElement('a');
                                    link.href = srcUrl;
                                    link.download = "phira-"+data.name+"-"+data.id+".zip";
                                    link.target = "_blank";
                                    link.click(); },
                            }
                        ]
                    }
                )

            }
        }
        await f()

        //let ac = await loadZip(generateRandomString(32) + ".zip", await r!.blob())
        //let li: any[] = []
        //ac.files.forEach((v) => { li.push(v) })
        let c = new PlayS(new File(await r!.blob(), generateRandomString(32) + ".zip"), ResPack)
        c.setOnEnd(() => {
            setTimeout(() => {
                this.root!.classList.add("push-in")
                this.root.classList.remove("hide")
                setTimeout(() => {
                    this.root!.classList.remove("push-in")
                }, 800)
            }, 650)
        })
        await c.load()
        this.load.classList.add("hide")
        c.start()
    }

    remove(){
        this.root.remove()
        this.load.remove()
    }

}
function generateRandomString(length: number): string {
    try {
        return self.crypto.randomUUID()
    } catch {
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }

        return result;
    }
}

