<script lang="ts">
import { ResourceManager } from '@/core/resource';
import { MenuItem } from 'mdui';
import { onMounted, ref } from 'vue';
import { ResPack } from '../App.vue';
import { I18N } from '../i18n';
import { PlayS } from '../play/play';
import ChartCardComponent from '../component/ChartCardComponent.vue';
import ChartCardRootComponent from '../component/ChartCardRootComponent.vue';
import { getAllChartInfo } from '../data';
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
async function addLoadChart() {
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
                console.log(chart)
            }
        })
        await new Promise((r) => {
            setTimeout(() => {
                r(null)
            }, 100)
        })
    }
}
export default {
    components: {
        ChartCardRootComponent
    },
    setup() {
        onMounted(async () => {
            await addLoadChart()
        })
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
            let c = ress.charts[chartSelect.value.value as string]!
            let p = new PlayS(c, ResPack, ress)
            await p.load(autoPlay.value.value == "on")
            p.start()
        },
        I18N: (s: string) => {
            return I18N.get(s)
        }
    },
    watch: {
        allchart() {
            addLoadChart()
        }
    }
}
</script>

<template>
    <div ref="root">
        <ChartCardRootComponent :charts="charts"></ChartCardRootComponent>
        <mdui-card variant="filled">
            <mdui-select variant="filled" ref="chartSelect" placement="auto">

            </mdui-select>
            <mdui-button @click="uploadFile()" ref="upload" type="button" variant="filled">{{
                I18N("ui.screen.local.uploadfile") }}</mdui-button>
            <mdui-button @click="startGame()" ref="start" value="" type="button" variant="filled">{{
                I18N("ui.screen.local.play") }}</mdui-button>

            <mdui-switch ref="autoPlay" value="on"></mdui-switch>
        </mdui-card>
    </div>
</template>