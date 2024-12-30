<script lang="ts">
import { onMounted, ref } from 'vue';
import LoadingComponent from '../component/LoadingComponent.vue';
import PauseOverlayComponent from '../component/PauseOverlayComponent.vue';

const root = ref()
export default {
    components: {
        PauseOverlayComponent
    },
    data() {
        return {
            open: true
        }
    },
    setup() {
        onMounted(async () => {
        })
        return {
            root,
        }
    },
    unmounted() {
    },
    watch: {
    }
}
</script>

<template>
    <div ref="root" class="test-root">
        <PauseOverlayComponent v-bind:open="open"></PauseOverlayComponent>
    </div>
</template>

<style></style>