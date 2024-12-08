<script lang="ts">
import { onMounted, PropType, ref } from 'vue';
import { I18N } from '../i18n';
import { addCacheDATA, checkCacheDATA, checkInfoData, getCacheDATA, getInfoData } from '../data';
import { LinearProgress } from 'mdui';
import { PHIRA_API_BASE_URL_NO_CORS1, proxyPhriaApiURL } from '@/api/url';
import { ON_TAURI } from '../tauri';
import { AUTOFetch } from '@/api/phira';
const NONE_IMG = await (async () => {
    let c = document.createElement("canvas")
    let ctx = c.getContext("2d")!
    ctx.fillStyle = "rgb(33,33,33)"
    ctx.fillRect(0, 0, 1920, 1080)
    return c.toDataURL("image/png")
})()
const chartimg = ref<HTMLImageElement>()
const loadStage = ref<LinearProgress>()
export default {
    props: {
        image: String,
        level: String,
        levelname: String,
        name: String,
        charter: String,
        click: Function as PropType<any>
    },
    setup() {
        const imageurl = ref()
        return {
            chartimg,
            imageurl,
            loadStage
        }
    },
    data() {
        return {
            load_done: false
        }
    },
    mounted() {
        this.imageurl = NONE_IMG
        const imgkey = this.image as string

        (async () => {
            chartimg.value!.onerror = () => {
                this.onerror()
            }
            //chartimg.value!.onload = () => {
            //    this.onload()
            //}
            if (this.image && this.image!.startsWith("PHIRA")) {
                let illustration = this.image.split("PHIRA").pop()!
                const srcUrl = illustration.replace("https://api.phira.cn/", "") + ".thumbnail"
                const url = ON_TAURI ? PHIRA_API_BASE_URL_NO_CORS1 + srcUrl : proxyPhriaApiURL(srcUrl);
                const imageName = url.split("/").pop()!
                if (await checkCacheDATA(imageName)) {
                    let blob = await getCacheDATA(imageName) as Blob
                    this.imageurl = URL.createObjectURL(blob)
                    this.onload()
                } else {
                    await new Promise(async (r) => {
                        if (!await checkCacheDATA(imageName)) {
                            if (ON_TAURI) {
                                try {
                                    let rep = await AUTOFetch(url)
                                    let blob = await rep.blob()
                                    this.imageurl = URL.createObjectURL(blob)
                                    await addCacheDATA(imageName, blob)
                                    this.onload()
                                    r(null)

                                } catch {
                                    this.imageurl = NONE_IMG
                                    this.onload()
                                    r(null)
                                }
                            } else {
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
                                    let blob = await new Promise<Blob>((res) => canvas.toBlob(res as any))
                                    await addCacheDATA(imageName, blob)
                                    this.imageurl = URL.createObjectURL(blob)
                                    this.onload()
                                    r(null)
                                }
                                tempi.onerror = () => {
                                    this.imageurl = NONE_IMG
                                    this.onload()
                                    r(null)
                                }
                            }

                        }
                    })
                }

            } else {
                if (await checkInfoData(imgkey)) {
                    let blob = await getInfoData(imgkey) as Blob
                    this.imageurl = URL.createObjectURL(blob)
                    this.onload()
                } else {
                    this.imageurl = NONE_IMG
                    this.onload()
                }
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
        },
        onload() {
            if (loadStage.value) loadStage.value!.style.display = "none"
            this.load_done = true
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
        <img ref="chartimg" :src="imageurl">
        <mdui-chip class="top-right" type="button" variant="assist" elevated="">
            <span :class="levelname" style="z-index: 4;">
                {{ level }}
            </span>
        </mdui-chip>
        <div class="chart-info"></div>
        <mdui-linear-progress ref="loadStage" max="1"
            style="top: 0px; left: 0px; width: 100%; position: absolute; z-index: 10;" v-show="!load_done">
        </mdui-linear-progress>
    </mdui-card>
</template>

<style>
.chart-card {
    opacity: 1;
    transition: opacity 0.6s;
    aspect-ratio: 8 / 5;
    text-align: left;
}
</style>