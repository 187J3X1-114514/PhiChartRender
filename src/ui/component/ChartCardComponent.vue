<script lang="ts">
import { onMounted, ref } from 'vue';
import { I18N } from '../i18n';
import { checkInfoData, getInfoData } from '../data';
const NONE_IMG = await (async () => {
    let c = document.createElement("canvas")
    let ctx = c.getContext("2d")!
    ctx.fillStyle = "rgb(33,33,33)"
    ctx.fillRect(0, 0, 1920, 1080)
    return c.toDataURL("image/png")
})()
const chartimg = ref<HTMLImageElement>()

export default {
    props: [
        "image",
        "level",
        "levelname",
        "name",
        "charter",
        "click"
    ],
    setup() {
        const imageurl = ref()
        return {
            chartimg,
            imageurl
        }
    },
    mounted() {
        const imgkey = this.image as string
        chartimg.value!.onerror = () => {
            this.onerror()
        }
        (async () => {
            if (await checkInfoData(imgkey)) {
                let blob = await getInfoData(imgkey) as Blob
                this.imageurl = URL.createObjectURL(blob)
            } else {
                this.imageurl = NONE_IMG
            }
        })()
    },
    unmounted() {
        try {
            URL.revokeObjectURL(this.imageurl)
        } catch { }
    },
    methods: {
        I18N: (s: string) => {
            return I18N.get(s)
        },
        onclick() {
            this.click()
        },
        onerror() {
            if (chartimg.value) chartimg.value.src = NONE_IMG
        }
    },
    watch: {
    }
}
</script>

<template>
    <mdui-card @click="onclick()" class="chart-card chart-illustration fadeIn" tabindex="0" variant="elevated"
        clickable="">
        <span class="chart-name" style="z-index: 5;">{{ name }}</span>
        <span class="chart-charter" style="z-index: 5;">{{ charter }}</span>
        <img ref="chartimg" :src="imageurl" @onerror="onerror()">
        <mdui-chip class="top-right" name="" value="" type="button" variant="assist" elevated="">
            <span :class="levelname" style="z-index: 4;">
                {{ level }}
            </span>
        </mdui-chip>
        <div class="chart-info"></div>
    </mdui-card>
</template>

<style>
.chart-card {
    opacity: 1;
    transition: opacity 0.6s;
    aspect-ratio: 8 / 5;
}
</style>