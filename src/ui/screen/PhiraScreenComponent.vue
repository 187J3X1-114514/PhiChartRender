<script lang="ts">
import { onMounted, ref } from 'vue';
import { account, load, reqLogin } from "../App.vue";
import { ChartPage } from "../phira/chart/chart";

const root = ref()
var chartPage: ChartPage
export default {
    props: ["type"],
    setup() {
        onMounted(async () => {
            if (account == undefined) await reqLogin()
            let api = account!
            chartPage = ChartPage.create(api, root.value)
            await chartPage.searchChart()
        })
        return {
            root
        }
    },
    unmounted() {
        chartPage.isRemove = true
        load.classList.add("hide")
    },
    watch: {
        type(newVal, oldVal) {
            chartPage!.type = newVal;
            chartPage!.page = 1;
            chartPage!.searchChart()
        }
    }
}
</script>

<template>
    <div ref="root" style="transition: all 0.2 ease;"></div>
</template>