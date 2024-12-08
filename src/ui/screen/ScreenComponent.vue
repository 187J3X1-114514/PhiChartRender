<script lang="ts">
import LocalScreenComponent from './LocalScreenComponent.vue';
import PhiraScreenComponent from './PhiraScreenComponent.vue';
import WelcomeScreenComponent from './WelcomeScreenComponent.vue';
import { defineAsyncComponent } from 'vue';

export default {
    props: ['screenName', 'otherData'],
    components: {
        LocalScreenComponent: defineAsyncComponent(() => import('./LocalScreenComponent.vue')),
        PhiraScreenComponent: defineAsyncComponent(() => import('./PhiraScreenComponent.vue')),
        WelcomeScreenComponent: defineAsyncComponent(() => import('./WelcomeScreenComponent.vue'))
    }
}
</script>

<template>
    <Transition name="screen">
        <LocalScreenComponent v-bind="otherData" v-if="screenName === 'loc'"></LocalScreenComponent>
        <PhiraScreenComponent v-bind="otherData" v-else-if="screenName === 'phira'"></PhiraScreenComponent>
        <WelcomeScreenComponent v-bind="otherData" v-else-if="screenName === 'welcome'"></WelcomeScreenComponent>
    </Transition>

</template>

<style>
.screen-enter-active,
.screen-leave-active {
    transition: opacity 0.5s ease;
    position: absolute;
    left: 80px;
    right: 0px;
}

.screen-enter-from,
.screen-leave-to {
    opacity: 0;
}
</style>