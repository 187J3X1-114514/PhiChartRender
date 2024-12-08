<script lang="ts">
import { ResourceManager } from '@/core/resource';
import { MenuItem } from 'mdui';
import { onMounted, ref } from 'vue';
import { load, ResPack } from '../App.vue';
import { I18N } from '../i18n';
import { PlayScreen } from '../play/play';
import ChartCardComponent from '../component/ChartCardComponent.vue';
import ChartCardRootComponent from '../component/ChartCardRootComponent.vue';
import { getAllChartInfo, getChartByID } from '../data';
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
const allchart = ref(await getAllChartInfo())
const charts = ref<any[]>([]);
(window as any).test = () => {
    charts.value.push({
        image: "00000",
        level: "00000",
        levelname: "00000",
        name: "00000",
        charter: "00000",
        click: () => {
            console.log(0)
        }
    })
}
export async function updataLoadChart() {
    allchart.value = await getAllChartInfo()
}

export default {
    components: {
        ChartCardRootComponent
    },
    setup() {
        return {
            root,
            autoPlay,
            chartSelect,
            charts,
            allchart
        }
    },
    unmounted() {
    },
    async mounted() {
        await this.addLoadChart()
    },
    data() {
        return {
            show: true
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
        async addLoadChart() {
            await new Promise((r) => {
                let i = setInterval(() => {
                    if (charts.value.length == 0) {
                        clearInterval(i)
                        r(null)
                    }
                    charts.value.pop()
                }, 100)
            })

            for (let key in allchart.value) {
                let chart = allchart.value[key]
                charts.value.push({
                    image: chart.image ? chart.image : "-",
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
        }
    },
    watch: {
        allchart() {
            this.addLoadChart()
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
            <ChartCardRootComponent :charts="charts"></ChartCardRootComponent>
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