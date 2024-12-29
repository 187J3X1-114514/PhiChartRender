<script lang="ts">
import { ResourceManager } from '@/core/resource';
import { MenuItem } from 'mdui';
import { onMounted, ref } from 'vue';
import { load, ResPack } from '../App.vue';
import { I18N } from '../i18n';
import { scrollIntoView } from '@/utils';
import { PlayScreen } from '../play/play';
import PagerComponent from '../component/PagerComponent.vue';
import ChartCardRootComponent from '../component/ChartCardRootComponent.vue';
import { ChartInfo, getAllChartInfo, getChartByID } from '../data';
import { reqFullSc } from '..';
import { BaseChartInfo } from '@/core/chart/chartinfo';
function openFilePicker(fn: (c: FileList | null, a: HTMLInputElement, b: Event) => any, accept?: string, multiple?: boolean) {
    const inpEle = document.createElement("input");
    inpEle.id = `__file_${Math.trunc(Math.random() * 100000)}`;
    inpEle.type = "file";
    inpEle.style.display = "none";
    accept && (inpEle.accept = accept);
    multiple && (inpEle.multiple = multiple);
    inpEle.addEventListener("change", event => fn(inpEle.files, inpEle, event), { once: true });
    inpEle.click();
}

const ress = new ResourceManager()
const autoPlay = ref()
const chartSelect = ref()
const root = ref()
const allchart = ref<Record<string, ChartInfo>>({})
const allchart_split = ref<Record<string, ChartInfo>[]>([])
const charts = ref<any[]>([]);
const max_page = ref<number>(1)
export async function getLoadChart() {
    console.log("重加载铺面")
    allchart.value = (await getAllChartInfo())
    let keys = Object.keys(allchart.value)
    allchart_split.value = []
    for (var i = 0; i < keys.length; i += 18) {
        let list: Record<string, ChartInfo> = {}
        for (let key of keys.slice(i, i + 18)) {
            list[key] = allchart.value[key]
        }
        allchart_split.value.push(list);
    }
    console.log(max_page.value, allchart_split, allchart)
    max_page.value = allchart_split.value.length
}

export default {
    components: {
        ChartCardRootComponent,
        PagerComponent
    },
    setup() {
        return {
            root,
            autoPlay,
            chartSelect,
            charts,
            allchart,
            max_page
        }
    },
    unmounted() {
    },
    async mounted() {
        charts.value = []
        await this.updateLoadChart()
    },
    data() {
        return {
            show: true,
            show_pager: false,
            page: 1
        }
    },
    methods: {
        uploadFile: () => {

            openFilePicker(async (f) => {
                await ress.loads(f);
                while (chartSelect.value.firstChild) {
                    chartSelect.value.removeChild(chartSelect.value.firstChild);
                }
                for (let key in ress.charts) {
                    let i = new MenuItem()
                    i.value = key
                    i.innerText = ress.charts[key]!.chart + ": " + ress.charts[key]!.src.name
                    chartSelect.value.append(i)
                }
            }, undefined, true)
        },
        startGame: async () => {
            //reqFullSc()
            let c = ress.charts[chartSelect.value.value as string]!
            let p = new PlayScreen(c, ResPack, ress)
            await p.load(false)
            p.start()
        },
        async playCacheChart(chart: BaseChartInfo, key: string) {
            load.classList.remove("hide")
            this.show = false
            let blob = await getChartByID(key)
            let resm = new ResourceManager()
            await resm.load("chart.zip", blob)
            let c = resm.charts[Object.keys(resm.charts)[0]]!
            let p = new PlayScreen(c, ResPack, resm)
            await p.load(false)
            load.classList.add("hide")
            p.start()
            p.setOnEnd(() => {
                this.show = true
            })

        },

        I18N: (s: string) => {
            return I18N.get(s)
        },
        async removeCard() {
            while (true) {
                if (charts.value.length == 0) { charts.value = []; break; }
                charts.value.pop()
                await new Promise((r) => {
                    setTimeout(() => {
                        r(null)
                    }, 30)
                })
            }
            await new Promise((r) => {
                setTimeout(() => {
                    r(null)
                }, 200)
            })
        },
        async updateLoadChart() {
            await getLoadChart()
            await scrollIntoView(document.body)
            this.show_pager = false
            await this.removeCard()
            for (let key in allchart_split.value[this.page - 1]) {
                let chart = allchart.value[key]
                charts.value.push({
                    image: chart.image ? chart.image : "-",
                    level: chart.level,
                    name: chart.name,
                    charter: chart.charter,
                    click: () => {
                        this.playCacheChart(chart, key)
                    }
                })
                await new Promise((r) => {
                    setTimeout(() => {
                        r(null)
                    }, 50)
                })
            }
            this.show_pager = true
        }
    },
    watch: {
        page() {
            this.updateLoadChart()
        }
    }
}
</script>

<template>
    <Transition name="chart-root" v-show="show">
        <div ref="root">
            <mdui-card variant="filled">
                <mdui-select variant="filled" ref="chartSelect" placement="auto">

                </mdui-select>
                <mdui-button @click="uploadFile()" ref="upload" type="button" variant="filled">{{
                    I18N("ui.screen.local.uploadfile") }}</mdui-button>
                <mdui-button @click="startGame()" ref="start" value="" type="button" variant="filled">{{
                    I18N("ui.screen.local.play") }}</mdui-button>

                <mdui-switch ref="autoPlay" value="on"></mdui-switch>
            </mdui-card>
            <div style="display: flex;flex-wrap: wrap;justify-content: center;">
                <ChartCardRootComponent :charts="charts"></ChartCardRootComponent>
                <PagerComponent :total="max_page ? max_page : 1" :show="show_pager && charts.length != 0"
                    :change="(a) => { page = a }">
                </PagerComponent>
            </div>

        </div>
    </Transition>

</template>

<style>
.chart-root-enter-active,
.chart-root-leave-active {
    transition: all 0.4s cubic-bezier(0.76, 0, 0.24, 1);
}

.chart-root-enter-to {
    transform: translateX(0%);
}

.chart-root-enter-from,
.chart-root-leave-to {
    transform: translateX(-101%);
}
</style>