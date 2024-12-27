<script lang="ts">
import { onMounted, PropType, ref } from 'vue';
import { I18N } from '../i18n';
import ChartCardComponent from './ChartCardComponent.vue';
const grid_width = ref(5)
const root = ref()

const resize = () => {
    let ratio = self.devicePixelRatio == 1 ? 1 : self.devicePixelRatio * 0.4
    grid_width.value = Math.min(Math.max((Math.floor(root.value.clientWidth * ratio / 270) > 0 ? Math.floor(root.value.clientWidth * ratio / 270) : Math.ceil(root.value.clientWidth * ratio / 270)), 1), 5)
}

const ro = new ResizeObserver(resize)
export default {
    components: {
        ChartCardComponent
    },
    props: {
        charts: Object as PropType<{
            image: string,
            level: string,
            levelname: string,
            name: string,
            charter: string,
            click: () => any
        }[]>,
        show_nothing: Boolean
    },
    setup() {
        onMounted(() => {
            ro.observe(root.value)
        })

        const itemRefs = ref<any[]>([])
        const setItemRef = (el: any) => {
            if (el) {
                itemRefs.value.push(el)
            }
        }
        return {
            grid_width,
            root,
            setItemRef,
            itemRefs
        }
    },
    mounted() {

    },
    unmounted() {
        ro.disconnect()
    },
    methods: {
        I18N: (s: string) => {
            return I18N.get(s)
        }
    },
    watch: {
    }
}
</script>

<template>
    <span class="chart-card-nothing" v-show="!(charts != undefined && charts.length != 0) && show_nothing">{{ I18N("ui.nothing") }}</span>
    <div ref="root" class="chart-card-root" :style="`grid-template-columns: repeat(${grid_width}, 1fr);`">
        <TransitionGroup name="chart-card">
            <ChartCardComponent class="" :ref="setItemRef" v-for="chart in charts" v-bind="chart" :key="chart.name">
            </ChartCardComponent>
        </TransitionGroup>
    </div>
</template>

<style>
.chart-card {
}

.chart-card-nothing {
    display: flex;
    justify-content: center;
    font-size: 2.1em;
    margin-top: 7%;
    font-style: italic;
    color: rgba(112, 112, 112, 0.425);

}

.chart-card-root {
    display: grid;
    gap: 20px;
    margin: 10px;
}

.chart-card-enter-active,
.chart-card-leave-active {
    transition: all 0.2s ease;
}

.chart-card-enter-to {
    opacity: 1;
}

.chart-card-enter-from,
.chart-card-leave-to {
    opacity: 0;
}
</style>