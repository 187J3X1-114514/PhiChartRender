<script lang="ts">
import { h, onMounted, PropType, ref } from 'vue';
import { I18N } from '../i18n';

const current = ref(1);

export default {
    props: {
        change: Function as PropType<(page: number) => void>,
        total: {
            type: Number,
            required: true
        },
        fullWidth: Boolean,
        show: Boolean
    },
    setup() {
        return {
            current
        }
    },
    mounted() {

    },
    unmounted() {
    },
    methods: {
        I18N: (s: string) => {
            return I18N.get(s)
        }
    },
    watch: {
        current(newV: number, oldV: number) {
            if (this.change) {
                this.change(newV)
            }
        }
    }
}
</script>

<template>
    <mdui-segmented-button-group class="pager-root" :full-width="fullWidth">
        <Transition name="pager-root">
            <div v-if="show">
                <mdui-segmented-button :disabled="current === 1" @click="current--">
                    {{ I18N("ui.screen.phira.chart.text.last_page") }}
                    <mdui-icon slot="icon" name="keyboard_arrow_left"></mdui-icon>
                </mdui-segmented-button>
                <mdui-segmented-button @click="current = 1" v-if="current >= 4" :page="1">1</mdui-segmented-button>
                <mdui-segmented-button disabled v-if="current >= 6">…</mdui-segmented-button>
                <mdui-segmented-button @click="current = 2" v-if="current === 5" :page="2">1</mdui-segmented-button>
                <mdui-segmented-button @click="current = current - 2" v-if="current >= 3" :page="current - 2">{{
                    (current -
                        2).toFixed(0)
                }}</mdui-segmented-button>
                <mdui-segmented-button @click="current = current - 1" v-if="current >= 2" :page="current - 1">{{
                    (current -
                        1).toFixed(0)
                }}</mdui-segmented-button>
                <mdui-segmented-button @click="current = current" v-if="total" class="pager-segmented-button-selected"
                    :page="current">{{
                        (current).toFixed(0)
                    }}</mdui-segmented-button>
                <mdui-segmented-button @click="current = current + 1" v-if="current + 1 <= total" :page="current + 1">{{
                    (current + 1).toFixed(0)
                    }}</mdui-segmented-button>
                <mdui-segmented-button @click="current = current + 2" v-if="current + 2 <= total" :page="current + 2">{{
                    (current + 2).toFixed(0)
                    }}</mdui-segmented-button>
                <mdui-segmented-button disabled v-if="current + 5 <= total">…</mdui-segmented-button>
                <mdui-segmented-button @click="current = current + 3" v-if="current + 4 === total" :page="current + 3">
                    {{
                        (current + 3).toFixed(0)
                    }}</mdui-segmented-button>
                <mdui-segmented-button @click="current = total" v-if="current + 3 <= total && total > 1" :page="total">
                    {{
                        (total).toFixed(0)
                    }}</mdui-segmented-button>
                <mdui-segmented-button :disabled="current >= total" @click="current++">
                    {{ I18N("ui.screen.phira.chart.text.next_page") }}
                    <mdui-icon slot="end-icon" name="keyboard_arrow_right"></mdui-icon>
                </mdui-segmented-button>
            </div>
        </Transition>

    </mdui-segmented-button-group>
</template>

<style>
.pager-segmented-button-selected {
    color: rgb(var(--mdui-color-on-secondary-container));
    background-color: rgb(var(--mdui-color-secondary-container));
    --mdui-comp-ripple-state-layer-color: var(--mdui-color-on-secondary-container);
}

.pager-root {
    transition: all 0.2s cubic-bezier(.2, 0, 0, 1);
    height: 40px;
    max-width: 60%;
    max-height: 5em;
    margin-top: 1em;
    margin-bottom: 2em;
    
}

.pager-root-enter-active,
.pager-root-leave-active {
    transition: opacity 0.3s ease;
}

.pager-root-enter-from,
.pager-root-leave-to {
    opacity: 0;
}
</style>