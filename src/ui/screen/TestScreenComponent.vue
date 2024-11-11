<script lang="ts">
import { onMounted, ref } from 'vue';
import PagerComponent from '../component/PagerComponent.vue';
import PhiraChartSearchComponent from '../component/PhiraChartSearchComponent.vue';
import { account, load, reqLogin, ResPack } from "@/ui/App.vue";
if (account == undefined) await reqLogin()
const root = ref()
export default {
    components: {
        PagerComponent,
        PhiraChartSearchComponent
    },
    setup() {
        return {
            root
        }
    },
    data() {
        return {
            show: false,

        }
    },
    unmounted() {
    },
    methods: {
        test: async (a: string, b: string, c: string) => {
            console.log(a, b, c)
        }
    },
    watch: {
    }

}
</script>

<template>
    <div ref="root" class="phira-chart-root">
        <PhiraChartSearchComponent :search-callback="test"></PhiraChartSearchComponent>
        <PagerComponent :total="32" :show="show"></PagerComponent>
    </div>

</template>
<style>
.phira-chart-root {
    text-align: center;
}
</style>