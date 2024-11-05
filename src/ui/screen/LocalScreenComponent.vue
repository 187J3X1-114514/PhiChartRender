<script lang="ts">
import { ResourceManager } from '@/core/resource';
import { MenuItem } from 'mdui';
import { onMounted, ref } from 'vue';
import { ResPack } from '../App.vue';
import { I18N } from '../i18n';
import { PlayS } from '../play/play';
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

export default {
    setup() {
        onMounted(async () => {
        })
        return {
            root,
            autoPlay,
            chartSelect
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
    }
}
</script>

<template>
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
    </div>
</template>