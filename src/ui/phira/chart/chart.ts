import { Button, LinearProgress, TextField, Card, Chip, Select, MenuItem } from "mdui";
import { dialog } from "mdui/functions/dialog.js";
import { PhiraAPI, PhiraAPIChartInfo, SearchDivision, SearchOrder } from "../../../api/phira";
import { buildPhriaApiURL, PHIRA_API_BASE_URL_NO_CORS2, PHIRA_API_CORS } from "../../../api/url";
import { ResPack, account, navigationDrawer } from "../../main";
import { PlayS } from "../../play/play";
import { File } from "../../../core/file";
import { addCacheDATA, addChartByPhiraID, checkCacheDATA, checkChartByPhiraID, getCacheDATA, getChartByPhiraID, getOrCreateCacheDATACallback } from "../../data";
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
    public page: number = 1
    public type: number = 2
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
        this.searchBtn.addEventListener("click", async () => {
            this.searchBtn.disabled = true
            this.searchBtn.loading = true
            await this.searchChart()
            this.searchBtn.disabled = false
            this.searchBtn.loading = false

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
        let load = new LinearProgress()
        load.style.top = '0px'
        load.style.left = '0px'
        load.style.width = '100%'
        load.style.position = 'absolute'
        load.style.zIndex = "10"
        const i = new Image()
        rootCard.clickable = true;
        (async()=>{
            const srcUrl = data.illustration.replace("https://api.phira.cn/", "") + ".thumbnail"
            const url = buildPhriaApiURL(srcUrl);
            let blob: Blob | undefined = undefined
            if (await checkCacheDATA(url.replace("https://api.phira.cn/files/",""))) {
                blob = await getCacheDATA(url.replace("https://api.phira.cn/files/",""))
            } else {
                await new Promise(async (r) => {
                    let tempi = new Image()
                    tempi.setAttribute('crossorigin', 'anonymous');
                    tempi.src = url
                    tempi.onload = async() => {
                        const bmp = await createImageBitmap(tempi)
                        const canvas = document.createElement('canvas')
                        canvas.width = bmp.width
                        canvas.height = bmp.height
                        const ctx = canvas.getContext('2d')!
                        ctx.drawImage(bmp,0,0)
                        blob = await new Promise<Blob>((res) => canvas.toBlob(res as any))
                        await addCacheDATA(url, blob)
                        r(null)
                    }
                    tempi.onerror = ()=>{
                        i.src = NONE_IMG
                        r(null)
                    }
                })
            }
            if (blob != undefined) i.src = URL.createObjectURL(blob);
        })()
        i.onload = async () => {
            load.remove();
        };
        i.onerror = () => {
            load.remove();
            i.remove()
        }
        i.addEventListener('dragstart', (event) => {
            event.preventDefault()
        });
        i.addEventListener('contextmenu', (event) => {
            event.preventDefault()
        });
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
        rootCard.addEventListener('select', (event) => {
            event.preventDefault()
        });
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
        for (let v of r.results){
            await this.genChartCard(v)
        }
        this.load.classList.remove("hide")
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

            const srcUrl = data.file.replace("https://api.phira.cn/", "");
            const url = buildPhriaApiURL(srcUrl);
            try {
                this.api.fetch(url)
                r = await fetch(
                    url,
                    { method: "GET", headers: { 'Authorization': 'Bearer ' + account!.userToken } }
                )
                return
            } catch {
                dialog(
                    {
                        headline: "错误",
                        description: "在尝试获取铺面时发生错误，URL：" + url,
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
                                    const link = document.createElement('a')
                                    link.href = srcUrl
                                    link.download = "phira-" + data.name + "-" + data.id + ".zip"
                                    link.target = "_blank"
                                    link.click()
                                    this.load.classList.add("hide")
                                    this.root!.classList.add("push-in")
                                    setTimeout(() => {
                                        this.root!.classList.remove("push-in")
                                    }, 800)
                                    this.root.classList.remove("hide")
                                },
                            }
                        ]
                    }
                )

            }
        }
        let b
        if (await checkChartByPhiraID(data.id)) {
            b = await getChartByPhiraID(data.id)
        } else {
            await f()
            b = await r!.blob()
            await addChartByPhiraID(data.id, b)
        }
        let c = new PlayS(new File(b, generateRandomString(32) + ".zip"), ResPack)
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

    remove() {
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

