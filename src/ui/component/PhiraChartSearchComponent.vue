<script lang="ts">
import { onMounted, PropType, ref } from 'vue';
import { I18N } from '../i18n';
import { PhiraAPI } from '@/api/phira';
import { Button } from 'mdui';
const searchBtn = ref<Button>()
export default {
    props: {
        "searchCallback": Function as PropType<
            (searchOrder: string, searchDivision: string, searchText: string) => void
        >
    }

    ,
    setup() {
        return {
            "searchOrder": "-updated_",
            "searchDivision": "_",
            "searchText": "",
            searchBtn
        }
    },
    mounted() {
    },
    unmounted() {
    },
    methods: {
        I18N: (s: string) => {
            return I18N.get(s)
        },
        search() {
            (async () => {
                if (this.searchCallback) {
                    searchBtn.value!.loading = true
                    await this.searchCallback(
                        PhiraAPI.getSearchOrder(this.searchOrder.slice(0, this.searchOrder.length - 1) as string)!,
                        PhiraAPI.getSearchDivision(this.searchDivision.slice(0, this.searchDivision.length - 1) as string)!,
                        this.searchText
                    )
                    searchBtn.value!.loading = false
                }
            })()
        }
    },
    watch: {
    }
}
</script>

<template>
    <div class="search-div">
        <mdui-text-field @input="searchText = $event.target.value" class="search-text" variant="filled" type="text"
            clearable icon="search" :label="I18N('ui.screen.phira.chart.text.search')"></mdui-text-field>
        <mdui-select :value="searchOrder" @change="searchOrder = $event.target.value" class="search-select1"
            variant="filled" placement="auto" :label="I18N('ui.screen.phira.chart.text.select1')">
            <mdui-menu-item value="name_">{{ I18N("ui.screen.phira.chart.text.order.name") }}</mdui-menu-item>
            <mdui-menu-item value="-name_">{{ I18N("ui.screen.phira.chart.text.order.nameReverse") }}</mdui-menu-item>
            <mdui-menu-item value="rating_">{{ I18N("ui.screen.phira.chart.text.order.rating") }}</mdui-menu-item>
            <mdui-menu-item value="-rating_">{{ I18N("ui.screen.phira.chart.text.order.ratingReverse")
                }}</mdui-menu-item>
            <mdui-menu-item value="updated_">{{ I18N("ui.screen.phira.chart.text.order.time") }}</mdui-menu-item>
            <mdui-menu-item value="-updated_">{{ I18N("ui.screen.phira.chart.text.order.timeReverse")
                }}</mdui-menu-item>
        </mdui-select>
        <mdui-select :value="searchDivision" @change="searchDivision = $event.target.value" class="search-select2"
            variant="filled" placement="auto" :label="I18N('ui.screen.phira.chart.text.select2')">
            <mdui-menu-item value="_">{{ I18N("ui.screen.phira.chart.text.d.ordinary") }}</mdui-menu-item>
            <mdui-menu-item value="plain_">{{ I18N("ui.screen.phira.chart.text.d.difficulty") }}</mdui-menu-item>
            <mdui-menu-item value="troll_">{{ I18N("ui.screen.phira.chart.text.d.shenjin") }}</mdui-menu-item>
            <mdui-menu-item value="visual_">{{ I18N("ui.screen.phira.chart.text.d.viewing") }}</mdui-menu-item>
        </mdui-select>
        <mdui-button ref="searchBtn" @click="search()" class="phira-search-btn" variant="filled" full-width
            icon="search">{{
                I18N("ui.screen.phira.chart.text.search") }}</mdui-button>
    </div>
</template>

<style>
.phira-search-btn {
    width: 10%;
    height: auto;
    border-radius: 1rem;
    transition: all 0.2s cubic-bezier(.2, 0, 0, 1);
    font-weight: bold;
    font-size: 16px;
    transform: scale(1.0);
}
</style>