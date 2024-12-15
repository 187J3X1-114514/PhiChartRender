<script lang="ts">
import { onMounted, ref } from 'vue';
import PagerComponent from '../component/PagerComponent.vue';
import PhiraChartSearchComponent from '../component/PhiraChartSearchComponent.vue';
import { account, load, reqLogin, ResPack } from "@/ui/App.vue";
import { I18N } from '../i18n';
import { dialog, snackbar } from 'mdui';
import { AUTOFetch, PhiraAPI, PhiraAPIChartInfo, SearchDivision, SearchOrder } from '@/api/phira';
import { scrollIntoView } from '@/utils';
import ChartCardRootComponent from '../component/ChartCardRootComponent.vue';
import { addCacheDATA, addChartByID, addChartInfo, checkCacheDATA, checkChartByID, checkInfoData, getChartByID, removeChartByID } from '../data';
import { PHIRA_API_BASE_URL_NO_CORS1, proxyPhriaApiURL } from '@/api/url';
import { generateRandomString } from '@/core/random';
import { PlayScreen } from '../play/play';
import { File } from '@/core/file';
import { ON_TAURI } from '../tauri';

const charts = ref<any[]>([]);
const root = ref()
const chartCards = ref()
export default {
    props: ["type"],
    components: {
        PagerComponent,
        PhiraChartSearchComponent,
        ChartCardRootComponent
    },
    setup() {

        return {
            root,
            charts,
            chartCards
        }
    },
    data() {
        return {
            show: false,
            chartCount: 0,
            page: 1,
            searchOrder: SearchOrder.timeReverse,
            searchDivision: SearchDivision.ordinary,
            searchText: "",
            maxPage: 1,
            show_nothing: true,
            isRemove: false,
            rootElement: root,
            hide: false
        }
    },
    async mounted() {
        this.charts = []
        if (account == undefined) await reqLogin()
        if (account != undefined) this.searchCallback(this.searchOrder, this.searchDivision, this.searchText)
    },
    unmounted() {
        this.charts = []
        this.isRemove = true
    },
    methods: {
        I18N: (s: string) => {
            return I18N.get(s)
        },
        searchCallback(searchOrder: SearchOrder, searchDivision: SearchDivision, searchText: string) {
            (async () => {
                this.show = false
                this.show_nothing = false
                this.chartCount = 0
                if (account == undefined) {
                    this.show_nothing = true
                    snackbar({
                        message: this.I18N("ui.screen.phira.chart.text.error.text.not_login"),
                        action: this.I18N("ui.screen.phira.login.text.login_btn"),
                        onActionClick: async () => {
                            this.show = true
                            await reqLogin()
                        },
                        messageLine: 2
                    })
                    return
                }
                load.classList.remove("hide")
                let api = account!
                await scrollIntoView(document.body)
                await this.removeCard()
                await new Promise((r) => {
                    setTimeout(() => {
                        r(null)
                    }, 200)
                })
                let r = await api.search(
                    searchOrder,
                    searchDivision,
                    searchText,
                    30,
                    this.page,
                    this.type
                )
                this.show_nothing = r.results.length == 0
                this.maxPage = r.maxPages
                charts.value = []

                for (let chart of r.results) {
                    charts.value.push({
                        image: "PHIRA" + chart.illustration,
                        level: chart.level,
                        levelname: (() => {
                            if (chart.level.toLowerCase().includes("sp")) {
                                return "sp"
                            } else if (chart.level.toLowerCase().includes("at")) {
                                return "at"
                            } else if (chart.level.toLowerCase().includes("in")) {
                                return "in"
                            } else if (chart.level.toLowerCase().includes("hd")) {
                                return "hd"
                            } else if (chart.level.toLowerCase().includes("ez")) {
                                return "ez"
                            } else {
                                return "uk"
                            }
                        })(),
                        name: chart.name,
                        charter: chart.charter,
                        click: async () => {
                            await this.playChart(chart)
                        }
                    })
                    await new Promise((r) => {
                        setTimeout(() => {
                            r(null)
                        }, 50)
                    })
                }
                this.show = true
                let cards: any[] = chartCards.value.itemRefs
                let a = setInterval(() => {
                    let c = true
                    for (let b of cards) {
                        if (!b.load_done) {
                            c = false
                        }
                    }
                    if (c) {
                        while (true) {
                            load.classList.add("hide")
                            if (load.classList.contains("hide")) break
                        }
                        clearInterval(a)
                    }
                }, 100)
            })()
        },
        change(searchOrder: SearchOrder, searchDivision: SearchDivision, searchText: string) {
            this.searchOrder = searchOrder
            this.searchDivision = searchDivision
            this.searchText = searchText

        },
        async removeCard() {
            while (true) {
                if (charts.value.length == 0) { charts.value = []; break; }
                charts.value.pop()
                await new Promise((r) => {
                    setTimeout(() => {
                        r(null)
                    }, 20)
                })
            }

        },

        async playChart(data: PhiraAPIChartInfo) {
            load.classList.remove("hide")
            this.hide = true
            var response
            const fetchFn = async () => {
                console.log(data.file)
                const srcUrl = data.file.replace("https://api.phira.cn/", "");
                const url = ON_TAURI ? data.file.replace("https://api.phira.cn/", PHIRA_API_BASE_URL_NO_CORS1) : proxyPhriaApiURL(srcUrl);
                try {
                    response = await AUTOFetch(
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
                                        this.hide = false
                                    }
                                },
                                {
                                    text: I18N.get("ui.screen.phira.chart.text.error.text.re"),
                                    onClick: async () => {
                                        this.hide = true
                                        await fetchFn()
                                    },
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
                                        this.hide = false
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
                    this.hide = false
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
                this.hide = false
                return
            }

            load.classList.add("hide")
            if (this.isRemove) return
            chart.start()
        }
    },
    watch: {
        type(newVal, oldVal) {
            this.page = 1;
            this.searchCallback(this.searchOrder, this.searchDivision, this.searchText)
        },
        page(newVal, oldVal) {
            this.searchCallback(this.searchOrder, this.searchDivision, this.searchText)
        }

    }

}
</script>

<template>
    <Transition name="phira-chart-root" v-show="!hide">
        <div ref="root" class="phira-chart-root">
            <Transition name="refresh-btn">
                <mdui-fab class="refresh-btn" size="normal" icon="refresh" v-show="show"
                    @click="searchCallback(searchOrder, searchDivision, searchText)"></mdui-fab>
            </Transition>

            <PhiraChartSearchComponent :search-callback="searchCallback" :change="change"></PhiraChartSearchComponent>
            <ChartCardRootComponent :show_nothing="show_nothing" ref="chartCards" :charts="charts">
            </ChartCardRootComponent>
            <PagerComponent :total="maxPage" :show="show && charts.length != 0" :change="(a) => { page = a }">
            </PagerComponent>
        </div>
    </Transition>


</template>
<style>
.phira-chart-root {
    text-align: center;
}

.refresh-btn {
    position: fixed;
    bottom: 24px;
    right: 24px;
    border-radius: 1.8rem;
    z-index: 999;
}

.refresh-btn-enter-active,
.refresh-btn-leave-active {
    transition: all 0.4s cubic-bezier(0.76, 0, 0.24, 1);
}

.refresh-btn-enter-to {
    transform: scale(1);
}

.refresh-btn-enter-from,
.refresh-btn-leave-to {
    transform: scale(0);
}

.phira-chart-root-enter-active,
.phira-chart-root-leave-active {
    transition: all 0.4s cubic-bezier(0.76, 0, 0.24, 1);
}

.phira-chart-root-enter-to {
    transform: translateX(0%);
}

.phira-chart-root-enter-from,
.phira-chart-root-leave-to {
    transform: translateX(-101%);
}
</style>