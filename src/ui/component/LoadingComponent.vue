<template>
    <div class="loading-root">
        <div class="loading-background"></div>
        <span class="loading-text">Loading...</span>
    </div>
</template>

<style>
.loading-root {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 88px;
    height: 23px;
}

.loading-background {
    background: #fff;
    width: 100%;
    height: 100%;
    animation: loading-background-anim 2.2s cubic-bezier(0,-0.12, 0.15, 1.05) infinite;
}

.loading-text {
    position: absolute;
    font-size: 14px;
    font-family: phi;
    color: #fff;
    mix-blend-mode: difference;
    font-weight: normal;
    transform: translateX(1px);
}


@keyframes loading-background-anim {
    0% {
        clip-path: xywh(0px 0px 0% 100%);
    }
    5% {
        clip-path: xywh(0px 0px 0% 100%);
    }

    38% {
        clip-path: xywh(0px 0px 100% 100%);
    }

    65% {
        clip-path: xywh(0px 0px 100% 100%);
    }

    95% {
        clip-path: xywh(100% 0px 0% 100%);
    }

    100% {
        clip-path: xywh(100% 0px 0% 100%);
    }
}
</style>