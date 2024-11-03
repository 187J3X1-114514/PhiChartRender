<script lang="ts">
import LocalScreenComponent from './LocalScreenComponent.vue';
import PhiraScreenComponent from './PhiraScreenComponent.vue';

export default {
    props: ['screenName', 'otherData'],
    components: {
        PhiraScreenComponent,
        LocalScreenComponent
    }
}
</script>

<template>
    <Transition name="screen">
        <LocalScreenComponent v-bind="otherData" v-if="screenName === 'loc'"></LocalScreenComponent>
        <PhiraScreenComponent v-bind="otherData" v-else-if="screenName === 'phira'"></PhiraScreenComponent>
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