import { Button, LinearProgress, TextField, Card, Chip, Select, MenuItem, snackbar, SegmentedButtonGroup, SegmentedButton, Icon, $ } from "mdui";
import { dialog } from "mdui/functions/dialog.js";
import { PhiraAPI, type PhiraAPIChartInfo, SearchDivision, SearchOrder } from "../../../api/phira";
import { proxyPhriaApiURL } from "../../../api/url";
import { PlayScreen as PlayScreen } from "../../play/play";
import { File } from "../../../core/file";
import { addCacheDATA, addChartByID, addChartInfo, checkCacheDATA, checkChartByID, getCacheDATA, getChartByID, removeChartByID } from "../../data";
import { generateRandomString } from "../../../core/random";
import { I18N } from "../../i18n";
import { account, load, reqLogin, ResPack } from "@/ui/App.vue";
import { scrollIntoView } from "@/utils";
import { ON_TAURI } from "@/ui/tauri";
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
    private maxPage: number = 0
    public isRemove: boolean = false
    public page: number = 1
    public type: number = 2
    public rootElement: HTMLDivElement = (undefined as unknown) as any

    public pagesBtnG: SegmentedButtonGroup = new SegmentedButtonGroup()
    public pagesBtnLast: SegmentedButton = new SegmentedButton()
    public pagesBtnNext: SegmentedButton = new SegmentedButton()
    public pagesBtn0: SegmentedButton = new SegmentedButton()
    public pagesBtn1: SegmentedButton = new SegmentedButton()
    public pagesBtn2: SegmentedButton = new SegmentedButton()

    private pagesSpan = document.createElement("span")

    private constructor() {

    }

    private updataPageBtn() {
        if (this.page >= this.maxPage - 3) {
            this.pagesBtn0.innerText = (this.maxPage - 2).toFixed(0)
            this.pagesBtn1.innerText = (this.maxPage - 1).toFixed(0)
            this.pagesBtn2.innerText = (this.maxPage).toFixed(0)

            this.pagesBtn0.value = (this.maxPage - 2).toFixed(0)
            this.pagesBtn1.value = (this.maxPage - 1).toFixed(0)
            this.pagesBtn2.value = (this.maxPage).toFixed(0)

            this.pagesBtn2.classList.remove("mdui-segmented-button-selected")
            this.pagesBtn1.classList.remove("mdui-segmented-button-selected")
            this.pagesBtn0.classList.add("mdui-segmented-button-selected")
        } else if (!(this.page > 1)) {
            this.pagesBtn0.innerText = this.page.toFixed(0)
            this.pagesBtn1.innerText = (this.page + 1).toFixed(0)
            this.pagesBtn2.innerText = (this.page + 2).toFixed(0)

            this.pagesBtn0.value = this.page.toFixed(0)
            this.pagesBtn1.value = (this.page + 1).toFixed(0)
            this.pagesBtn2.value = (this.page + 2).toFixed(0)

            this.pagesBtn2.classList.remove("mdui-segmented-button-selected")
            this.pagesBtn1.classList.remove("mdui-segmented-button-selected")
            this.pagesBtn0.classList.add("mdui-segmented-button-selected")
        } else {
            this.pagesBtn0.innerText = (this.page - 1).toFixed(0)
            this.pagesBtn1.innerText = this.page.toFixed(0)
            this.pagesBtn2.innerText = (this.page + 1).toFixed(0)

            this.pagesBtn0.value = (this.page - 1).toFixed(0)
            this.pagesBtn1.value = this.page.toFixed(0)
            this.pagesBtn2.value = (this.page + 1).toFixed(0)

            this.pagesBtn2.classList.remove("mdui-segmented-button-selected")
            this.pagesBtn1.classList.add("mdui-segmented-button-selected")
            this.pagesBtn0.classList.remove("mdui-segmented-button-selected")
        }
        this.pagesBtnLast.disabled = this.page == 1
        this.pagesBtnNext.disabled = this.page == this.maxPage

    }

    private afterCreate() {
        this.cards = document.createElement("div")
        this.search = new TextField()
        this.search.icon = "search"
        this.search.clearable = true
        this.search.label = I18N.get("ui.screen.phira.chart.text.search")
        this.resize()
        const resizeObserver = new ResizeObserver((_entries) => {
            this.resize()
        })
        resizeObserver.observe(this.rootElement);
        window.addEventListener("resize", () => this.resize())
        this.cards.classList.add("active")
        this.rootElement.classList.add("fadeIn")
        this.rootElement.classList.add("fadeIn-s")
        this.rootElement.classList.remove("fadeIn-s")
        this.rootElement.classList.add("phira-chart-root")

        this.pagesBtnLast.innerText = I18N.get("ui.screen.phira.chart.text.last_page")
        this.pagesBtnNext.innerText = I18N.get("ui.screen.phira.chart.text.next_page")

        this.pagesBtnG.appendChild(this.pagesBtnLast)
        this.pagesBtnG.appendChild(this.pagesBtn0)
        this.pagesBtnG.appendChild(this.pagesBtn1)
        this.pagesBtnG.appendChild(this.pagesBtn2)
        this.pagesBtnG.appendChild(this.pagesBtnNext)
        this.pagesBtnG.classList.add("phira-chart-page-g")

        this.pagesBtnLast.addEventListener("click", async () => {
            this.page -= 1
            await this.searchChart()
        })
        this.pagesBtnNext.addEventListener("click", async () => {
            this.page += 1
            await this.searchChart()
        })

        this.pagesBtn0.addEventListener("click", async () => {
            this.page = parseInt(this.pagesBtn0.value)
            await this.searchChart()
        })
        this.pagesBtn1.addEventListener("click", async () => {
            this.page = parseInt(this.pagesBtn1.value)
            await this.searchChart()
        })
        this.pagesBtn2.addEventListener("click", async () => {
            this.page = parseInt(this.pagesBtn2.value)
            await this.searchChart()
        })

        this.pagesBtnLast.appendChild((() => {
            let _ = new Icon()
            _.slot = "icon"
            _.name = "keyboard_arrow_left"
            return _
        })())
        this.pagesBtnNext.appendChild((() => {
            let _ = new Icon()
            _.slot = "end-icon"
            _.name = "keyboard_arrow_right"
            return _
        })())
        this.pagesBtnG.classList.add("hide")
        this.pagesSpan.classList.add("hide")
        this.pagesSpan.classList.add("phira-chart-page-span")
        this.updataPageBtn()

        this.searchDiv = document.createElement("div")
        this.select1 = new Select()
        this.select2 = new Select()
        this.select1.label = I18N.get("ui.screen.phira.chart.text.select1")
        this.select2.label = I18N.get("ui.screen.phira.chart.text.select2")
        const addItem = (a: Select, b: SearchDivision | SearchOrder, t: string) => {
            let i = new MenuItem()
            i.value = b + "_"
            i.innerText = t + ""
            a.appendChild(i)
        }
        addItem(this.select1, SearchOrder.name, I18N.get("ui.screen.phira.chart.text.order.name"))
        addItem(this.select1, SearchOrder.nameReverse, I18N.get("ui.screen.phira.chart.text.order.nameReverse"))
        addItem(this.select1, SearchOrder.rating, I18N.get("ui.screen.phira.chart.text.order.rating"))
        addItem(this.select1, SearchOrder.ratingReverse, I18N.get("ui.screen.phira.chart.text.order.ratingReverse"))
        addItem(this.select1, SearchOrder.time, I18N.get("ui.screen.phira.chart.text.order.time"))
        addItem(this.select1, SearchOrder.timeReverse, I18N.get("ui.screen.phira.chart.text.order.timeReverse"))
        addItem(this.select2, SearchDivision.ordinary, I18N.get("ui.screen.phira.chart.text.d.ordinary"))
        addItem(this.select2, SearchDivision.difficulty, I18N.get("ui.screen.phira.chart.text.d.difficulty"))
        addItem(this.select2, SearchDivision.shenjin, I18N.get("ui.screen.phira.chart.text.d.shenjin"))
        addItem(this.select2, SearchDivision.viewing, I18N.get("ui.screen.phira.chart.text.d.viewing"))
        this.select1.value = SearchOrder.timeReverse + "_"
        this.select2.value = SearchDivision.ordinary + "_"
        this.searchBtn = new Button()
        this.searchBtn.variant = "filled"
        this.searchBtn.icon = 'search'
        this.searchBtn.innerText = I18N.get("ui.screen.phira.chart.text.search")
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
        this.rootElement.append(this.searchDiv)
        this.rootElement.append(this.cards)
        this.rootElement.append(this.pagesBtnG)
        this.rootElement.append(document.createElement("br"))
        this.rootElement.append(this.pagesSpan)

        this.searchBtn.addEventListener("click", async () => {
            this.searchBtn.disabled = true
            this.searchBtn.loading = true
            await this.searchChart()
            this.searchBtn.disabled = false
            this.searchBtn.loading = false

        })

    }

    private updataPagesSpan() {
        this.pagesSpan.innerText = I18N.get("ui.screen.phira.chart.text.pages").replace("---", this.maxPage.toFixed(0))
    }

    private resize() {
        let ratio = self.devicePixelRatio == 1 ? 1 : self.devicePixelRatio / 0.6
        this.width = Math.min(Math.max((Math.floor(this.cards!.clientWidth * ratio / 270) > 0 ? Math.floor(this.cards!.clientWidth * ratio / 270) : Math.ceil(this.cards!.clientWidth * ratio / 270)), 1), 5)
        this.cards!.style.gridTemplateColumns = `repeat(${this.width}, 1fr)`
    }
    static create(api: PhiraAPI, el: HTMLElement) {
        let pel = document.createElement("div")
        el.appendChild(pel)
        let chartPage = new this()
        chartPage.api = api
        chartPage.rootElement = pel
        chartPage.afterCreate()
        chartPage.cards!.style.display = 'grid'
        chartPage.cards!.style.gap = '20px'
        chartPage.cards!.style.margin = '10px'
        return chartPage
    }
    createChartCard(data: PhiraAPIChartInfo) {
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
        (async () => {
            const srcUrl = data.illustration.replace("https://api.phira.cn/", "") + ".thumbnail"
            const url = proxyPhriaApiURL(srcUrl);
            const imageName = url.split("/").pop()!
            let blob: Blob | undefined = undefined
            if (await checkCacheDATA(imageName)) {
                blob = await getCacheDATA(imageName)
            } else {
                await new Promise(async (r) => {
                    let tempi = new Image()
                    tempi.setAttribute('crossorigin', 'anonymous');
                    tempi.src = url
                    tempi.onload = async () => {
                        const bmp = await createImageBitmap(tempi)
                        const canvas = document.createElement('canvas')
                        canvas.width = bmp.width
                        canvas.height = bmp.height
                        const ctx = canvas.getContext('2d')!
                        ctx.drawImage(bmp, 0, 0)
                        blob = await new Promise<Blob>((res) => canvas.toBlob(res as any))
                        await addCacheDATA(imageName, blob)
                        r(null)
                    }
                    tempi.onerror = () => {
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
        }, 100 + this.chartCount * 60)
        this.resize()
        rootCard.addEventListener("click", () => {
            setTimeout(() => {
                this.rootElement!.classList.add("push-out")
                setTimeout(() => {
                    this.rootElement.classList.add("hide")
                    this.rootElement!.classList.remove("push-out")
                }, 650)
                this.playChart(data)
            }, 150)
        })
        rootCard.classList.add("fadeIn")
        return {
            data: data,
            el: rootCard
        };
    }
    async searchChart() {
        this.pagesBtnG.classList.add("hide")
        this.pagesSpan.classList.add("hide")
        this.chartCount = 0
        if (account == undefined) {
            snackbar({
                message: I18N.get("ui.screen.phira.chart.text.error.text.not_login"),
                action: I18N.get("ui.screen.phira.login.text.login_btn"),
                onActionClick: async () => {
                    this.pagesBtnG.classList.remove("hide")
                    this.pagesSpan.classList.remove("hide")
                    await reqLogin()
                },
                messageLine: 2
            })
            return
        }
        load.classList.remove("hide")
        let api = account!
        scrollIntoView(document.body)
        await this.removeCard()
        let r = await api.search(
            PhiraAPI.getSearchOrder(this.select1!.value.slice(0, this.select1!.value.length - 1) as string),
            PhiraAPI.getSearchDivision(this.select2!.value.slice(0, this.select2!.value.length - 1) as string),
            this.search!.value, 30, this.page, this.type
        )
        this.maxPage = r.maxPages
        this.updataPagesSpan()
        this.updataPageBtn()

        for (let v of r.results) {
            this.createChartCard(v)
        }
        this.pagesBtnG.classList.remove("hide")
        this.pagesSpan.classList.remove("hide")
        let a = setInterval(() => {
            let c = true
            for (let b of this.cards!.getElementsByTagName("mdui-card")) {
                if (b.getElementsByTagName("mdui-linear-progress").length != 0) {
                    c = false
                }
            }
            if (c) {
                load.classList.add("hide")
                clearInterval(a)
            }
        }, 100)
    }
    async removeCard() {
        let _ = this.chartCount
        let ___ = this.cards!.children.length
        let ____ = 0
        for (let i = 0, length = this.cards!.children.length; i < length; i++) {
            setTimeout(() => {
                let __ = this.cards!.children.item(___ - i - 1)! as Card;
                __.style.opacity = "0"
                setTimeout(() => {
                    __.style.display = "none"
                    ____++
                }, 500)
            }, i * 40
            )
        }
        await new Promise((r) => {
            let i = setInterval(() => {
                if (____ == ___) {
                    while (this.cards!.firstChild) {
                        this.cards!.removeChild(this.cards!.firstChild)
                    }
                    clearInterval(i)
                    r(null)
                }
            }, 100)
        })

    }

    async playChart(data: PhiraAPIChartInfo) {
        load.classList.remove("hide")
        var response
        const fetchFn = async () => {
            console.log(data.file)
            const srcUrl = data.file.replace("https://api.phira.cn/", "");
            const url = ON_TAURI ? data.file : proxyPhriaApiURL(srcUrl);
            try {
                this.api.fetch(url)
                response = await fetch(
                    url,
                    { method: "GET", headers: { 'Authorization': 'Bearer ' + account!.userToken } }
                )
                return
            } catch {
                dialog(
                    {
                        headline: I18N.get("ui.screen.phira.chart.text.error.text"),
                        description: I18N.get("ui.screen.phira.chart.text.error.text.d") + url,
                        actions: [
                            {
                                text: I18N.get("ui.screen.phira.chart.text.error.text.r"),
                                onClick: () => {
                                    load.classList.add("hide")
                                    this.rootElement!.classList.add("push-in")
                                    setTimeout(() => {
                                        this.rootElement!.classList.remove("push-in")
                                    }, 800)
                                    this.rootElement.classList.remove("hide")
                                }
                            },
                            {
                                text: I18N.get("ui.screen.phira.chart.text.error.text.re"),
                                onClick: async () => { await fetchFn() },
                            },
                            {
                                text: I18N.get("ui.screen.phira.chart.text.error.text.download"),
                                onClick: async () => {
                                    const link = document.createElement('a')
                                    link.href = srcUrl
                                    link.download = "phira-" + data.name + "-" + data.id + ".zip"
                                    link.target = "_blank"
                                    link.click()
                                    load.classList.add("hide")
                                    this.rootElement!.classList.add("push-in")
                                    setTimeout(() => {
                                        this.rootElement!.classList.remove("push-in")
                                    }, 800)
                                    this.rootElement.classList.remove("hide")
                                },
                            }
                        ]
                    }
                )

            }
        }
        let chartid = "phira-" + data.id
        let blob
        if (await checkChartByID(chartid)) {
            blob = await getChartByID(chartid)
        } else {
            await fetchFn()
            blob = await response!.blob()
            await addChartByID(chartid, blob)
        }

        let chart = new PlayScreen(new File(blob, generateRandomString(32) + ".zip"), ResPack)
        chart.setOnEnd(() => {
            setTimeout(() => {
                this.rootElement!.classList.add("push-in")
                this.rootElement.classList.remove("hide")
                setTimeout(() => {
                    this.rootElement!.classList.remove("push-in")
                }, 800)
            }, 650)
        })
        try {
            await chart.load()
            await addChartInfo(chart.getChart(), chartid)
        } catch (e) {
            await removeChartByID(chartid)
            snackbar({
                message: I18N.get("ui.screen.phira.chart.text.error.text.file")
            })
            load.classList.add("hide")
            this.rootElement!.classList.add("push-in")
            setTimeout(() => {
                this.rootElement!.classList.remove("push-in")
            }, 800)
            this.rootElement.classList.remove("hide")
            load.classList.add("hide")
            return
        }

        load.classList.add("hide")
        if (this.isRemove) return
        chart.start()
    }

    remove() {
        this.isRemove = true
        load.classList.add("hide")
        this.rootElement.remove()
    }

}