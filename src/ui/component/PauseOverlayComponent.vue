<script lang="ts">
import { PropType, ref } from 'vue';

const backBtnImg = ref('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEwAAABMCAYAAADHl1ErAAACdklEQVR4nO3cwYtNYRzG8YkopWlCIjVFWFjYUBqRlQ01GxZKU7KYnbJgYW1h4x/wB8xK/gLZCSsUzYbULCSmiUxNMZ7vY+Geer3NvWfOaep9md+37v7p07md06nzjo39x0maA2ZK7/gnkjTnQYE2ImBHimXbkh6U3lVltrcHVku2tzU/SY8yrPul91VXgvU4sNZRYHXI9s7AWme2JyQ9S7GA26V3VVmDJYnAainFasACa0i290h622BJIrCGZHufpJf+u2uld1XZAOt9cif8FVhDCqwO2Z5MseJvOCLbhyR9TK6sFWC69K4qC6wOBVaHgGMp1uChNLDWCjglaTG5sr7bPlN6V5UFVocCq0PA6QxrMbCGBJyTtJxgfQFOlt5VZYHVoSFYR0vvqjLgQoa1HFhDAi5L+pFgLdieLL2rygKrQ4HVIWAmw3oXWEOyPTt4O9pgzQO7S++qMtuz6RuHwBpRYHUIuJVhvQqsIUm6m2E9BcZL76qyzYS1pfSATdtmuso2LOBOhvbc9kTpXVUH3MjQ3gRaS4HWo0DrEXBdkhK018CB0ruqDriSoX0ItJYCrUeB1iNgOrsRLABHSu+qOuCi7W8J2udAaynQerQWmu0TpXdVHXBW0lKCtgRMld5VdcBUhvY10FoKtB4FWo+A45I+JWgrwPnSu6oOOJyhrQZaSymapNVAW0cNWgM2QLtUelfVAQezL9l+AldL76o6YH/+RVugtRRoPQq0HgF7Jc1naDdL76o6YJekF4HWoUDrUaD1CBiX9CRFk3Sv9K6qGxzhF2hdCrQeBVqP/OfQyIcZWhwaOSrbWwOtYzlaHHy7jhq0jcb6DTgsYS65VlSDAAAAAElFTkSuQmCC');
const continueBtnImg = ref('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAADmklEQVR4nO2aPYgdVRiGz/eNwcY/LMTCEBvtkljYWkhSpLVR2EVRDCKLBAsbbRQUQVBUbEJQbEwhSLQRIkoKkwjKIiYraCL4EwMqW0RttvE8r83cZbjc3dyfmflmZvfpdtl7zvs9vGfuvYdNaZddGifnfErSndE5Oosk5Zz/AVYkWXSezqEKOedzwL3RmTqFJpBzfjM6V2eYJKiUdFnS4eh84WwlqCLqpKRbo3OGcT1BJX8DS9FZQ5hS0KhNZ4F7ojO3yiyCSkkbwIvRuVtjVkEVUWvAA9H5G2deQRVR70q6LXqOxlhUUCnpCvBw9CyNUIegiqjTku6OnqlW6hRUSvoXeEGSS/Lo+RambkEVUd8DB6PnW5imBFVEvSPppug5J9GVei8BvwGPRAcZZ6q7HUlqOsgI4GMze8bM/hz9zsxoa/9xutKgTdz9IUmrkh6PzpJSBxuUUkrAaL/vzOyou3/b5v5VOtegMe6TtJpzfg24MSJAJxs0CeB3M1s2s3Nm1lqerjdoE3ffa2ZfAifbvE7pTYOqAH+Z2fPu/n7Te/VS0AjgCzNbcfefmtqjN0dsEu5+WNJazvnVpvbodYNGlB8L1so2na9z7V43aIz9ks7mnD8Abq9r0SEJGrEk6SLwaB2LDeKIbQVwujx2v8y7xhAbtIm7HzGzn4Fj864x6AZVAS6Y2VPu/s0srxt0g6q4+0Ez+zrnfBy4edrX7ZgGVQH+cPcVM/vken+7Yxo0LztOEPCGu++bpj0ppXRDw3k6A/CjmS0XRTHT5duOaJCk59z9wDw3k4NuEPBZeWV7dd41Btkg4FdJjxVFcWQROSkNsEHACTN7eVExIwYjCLhcPoRX61x3EEdM0ktmdsDda5WTUs8bBJwpv61famqPXjYIWJd0tCiKQ03KSaknDQL+q/z4kZkdc/f1NvbuhaCSq+V1xedtbtqXI/ZW+RBuVU5KHW8Q8JWZrRRFcSE6y7Y0/R9m4+ScrwFPR889NS3LOQXsjZ55RGeOGLBefhJu/TmzHZ14SANvm9m+iIdwLTR4nC4B90fPtzANiNkAno2eqzZqlvMpcEf0TLVSk5grwHL0LI1Qg5wTwC3RczTGAmIuAoei8zfOnHJeic7dGjOKOQPcFZ25VaaQslG+dT8RnTWEKQS9N7i37lnYRswPwIPR+cLZQs7rkvZI2hOdL5wxMeeB/dGZOkUp5hrwZHSWTpJz/rBLl1i77NIf/gdZ8Shc41GJdgAAAABJRU5ErkJggg==');
const retryBtnImg = ref('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEwAAABMCAYAAADHl1ErAAAFfklEQVR4nO2cX4gVVRzHf+esJmTlChXbP7U/KgpaSU9mREWCqFQSCeJDlob0khCEPdhLL0ZSaW+9Fj0UkRU3MJBS1MxAkA1CepG1kDKCLUXK/X6/PThzOQ537rp3Z+acq/uBy85lZ37n+/vOb2bOzJxzzaa4OgDwKcn7YuvoG5RB8g1Jg7H1JI8CAIyQXBNbU9KoAwBaJOfG1pYknQzLTPsXwFuSfGyNSVFmWGDcaZIbY+tMhvEMC4w7THJxbL3RuVLDMtPGALwv6YbYuqMxEcMC486S3CzJ1aWrtsDjQfIRM1siaYmZzTWzJdm/ZpnZDO/9dZOIvWdgYOCVCmTGg+Qdkl4C8AWA0V4qKIUKqxVJjuSqzKSxOkwKzNot6frYOfeMpKcBHC1JjgBOAPiI5FaSj5NcQPKmYPtu5jD4HJH0QMRUJwfJ+7sY9RXJLSTvGi/OFRg2QnJzEznVgqTZWQ+8mNx5ALsm+uRhHMPeUT/fkGdV9VPRKJI7SN7bS8wSo/aTXFi1/kbJTuqjhcT29WpUTiHeGZLPVKU5GiRfLCQ2SvLlKmIHMd+U1HOfLBlI7iiYNUxyaVXxAewluaiqeFHpUFnDfX0SrhOST2U3u/nnkPq5w1gnku4BcC40K+xsTlEAwPfZITgG4NSUWV0A8EFwzhqbemjXBZLLASA4zz8fW1OySPIADgTVdSC2pqQhuTEwCyTvjK0pWbLqat8jknwttqakIflkUF1nSd4WW1PSAGgFhu2OrSdpsmfwCg7Hqeoys26v25/NF0h+670/04Ce5Ck1TFJ7tIxz7sNm5PQxU4fjBCD5UHCyPxlbT0qUHZIrguVDTQjpFzoaJqn9PN57/0NzctKno2He+3ycg0kabk5O+nQ0jOSc4OtIQ1r6grIKu7tpIf1Cx1EuktRewbn+HAlTE9NiC0gJSTvNzEhOHxgYePWKNwRwPu+H1aYuMSQNBn3P0tvAsn7YaBDo5srV9TFlhl0Mlq+Vd46DwfK5spXKDAu7EnNK1rmqkBS+BSvtSpUZ1u6s6tKg3WuB0LDSznpHw5xz15xhYYWF+Rcpq7ATwfKqqkQlzqPB8s8T3jp8cUvy1up0pQfJ23U5pePRuj2ibgXLq6uTlyTt/Eh+55z7r2zFUsOcc23DJG2oTlt6hPk55z7uJYALe74ZQ5WqTARJQ0EP/8J4p59uh+Qoya+D79sqUZgYJLcHX1ve+z8mHCSrMEdyzdVcZWF1ZRe3J3oN5PJPNn41Z2fFmqMC4L3gcDxWSVCS6wt7YVLj71OB5KJCXtX9akFh7tAnlQWOCIC9QXW1xt9iApB8rLA31lfaQMOQ3FLIp7L5BW0A7Ar2SN+OcSW5LDQLwJ66GpoB4BiAC1lDv/TbVVPSYDhAEMBxkjNra5Dk/NywrMH9/WJabhYAZtr/bGRqDsl1hZLeL2l67Q1PgsysI/ks3uy89VxjAjrMNTqqRJ/9SxrKKyv/NGpWDsltBdMqnc1WBSQfBnCqcEXcElPQpoJplc2XnCwkt6pAVLMCYes6zMhtxao2kosAHOywI9N5ckxyaeGeM2enGppHSXImgD0ALhbMOpjkb45Jmgbg7aJjAP4G8C7JBXW0m3V1dnfYWco620lfwY3kgwAOlyTwI8kXJM2bZBvzSW4CcKyknX0kl1WU0mXUNjKH5FpJ2733y0v+/6uZfemcO2lmJ+3Sy9MR7/15MzNJs7K/c8xsyMwW69KrsJXe+3klMY8751733n9TfUYNQXItgM86VUIVALgA4HOSK5vIp7GxX5JmS9ogaXVWdbN6jUXyLzM75L1vSWp573+rTml3og2Wk7RCUv77YfPMbKGZ3ei9vyVfh+TvZvaPmZ02s+HsjfTw1EDlPuJ/mCL63xxw2iQAAAAASUVORK5CYII=');

export default {
    props: {
        open: Boolean,
        hide: {
            type: Boolean,
            required: false
        },
        showCountdownTime: {
            type: Boolean,
            default: true,
            required: false
        },
        callbacks: Object as PropType<{
            onNoCountdownTimeClosed: () => void,
            onclosed: () => void,
            clickBackButton: () => void,
            clickRetryButton: () => void,
            clickContinueButton: () => void
        }>
    },
    data() {
        return {
            _hide: true,
            countdownTime: 0
        }
    },
    setup() {
        return {
            backBtnImg: backBtnImg,
            continueBtnImg: continueBtnImg,
            retryBtnImg: retryBtnImg
        }
    },
    mounted() {

    },
    unmounted() {
    },
    methods: {
    },
    watch: {
        open(val) {
            if (!this.hide) {
                if (val) {
                    this.countdownTime = 0
                    this._hide = false
                } else {
                    this.countdownTime = 0
                    setTimeout(() => {
                        this._hide = true
                        this.callbacks?.onclosed()
                    }, this.showCountdownTime ? 3800 : 200)
                    let i = setInterval(() => {
                        if (this.countdownTime > 4) {
                            clearInterval(i)
                        } else {
                            this.countdownTime += 1
                        }
                    }, 1000)
                }
            }

        },
        hide(val) {
            this._hide = val
        }
    }
}
</script>

<template>
    <div
        :class="{ 'pause-overlay-root': true, 'open': open, 'close': !open, 'hide': hide, 'close-fast': !open && !showCountdownTime }">
        <div :class="{ 'open': open, 'close': !open }" class="pause-overlay-buttons">
            <div class="pause-overlay-button">
                <img draggable="false" :src="backBtnImg" class="pause-overlay-button-img"
                    @click="callbacks?.clickBackButton()">
            </div>
            <div class="pause-overlay-button">
                <img draggable="false" :src="retryBtnImg" class="pause-overlay-button-img"
                    @click="callbacks?.clickRetryButton()">
            </div>
            <div class="pause-overlay-button">
                <img draggable="false" :src="continueBtnImg" class="pause-overlay-button-img"
                    @click="callbacks?.clickContinueButton()">
            </div>
        </div>
        <div :class="{ 'open': open, 'close': !open, 'hide': !showCountdownTime }" class="pause-overlay-texts">
            <TransitionGroup name="countdown-time-text">
                <span v-if="countdownTime! <= 0.8" class="pause-overlay-text">3</span>
                <span v-else-if="countdownTime! <= 1.8" class="pause-overlay-text">2</span>
                <span v-else-if="countdownTime! <= 2.8" class="pause-overlay-text">1</span>
            </TransitionGroup>

        </div>
    </div>
</template>

<style>
.pause-overlay-texts {
    width: 3.8em;
    min-height: 91px;
}

.pause-overlay-texts.open {
    opacity: 0;
}

.pause-overlay-texts.close {
    opacity: 0;
    animation: pause-overlay-texts-in 1.5s ease-in forwards;
}

@keyframes pause-overlay-texts-in {
    0% {
        opacity: 0;
    }

    11% {
        opacity: 0;
    }

    20% {
        opacity: 1;
    }

    100% {
        opacity: 1;
    }
}

.pause-overlay-text-none,
.pause-overlay-text {
    position: absolute;
    font-family: 'phi';
    font-weight: lighter;
    font-size: 3.8em;
}

.countdown-time-text-enter-active,
.countdown-time-text-leave-active {
    position: absolute;
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.countdown-time-text-leave-to {
    opacity: 0;
    transform: translateX(-150px);
}

.countdown-time-text-enter-from {
    opacity: 0;
    transform: translateX(150px);
}


.pause-overlay-button {
    display: inline-block;
    margin-left: 60px;
    margin-right: 60px;
}

.pause-overlay-buttons.open {
    animation: pause-overlay-buttons-in 0.2s ease-in forwards;
}

.pause-overlay-buttons.close {
    animation: pause-overlay-buttons-out 0.15s ease-out forwards;
}

@keyframes pause-overlay-buttons-in {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}


@keyframes pause-overlay-buttons-out {
    0% {
        opacity: 1;
    }

    100% {
        opacity: 0;
        display: none;
    }
}

.pause-overlay-button {
    filter: drop-shadow(0px 2px 20px rgba(255, 255, 255, 0.5));
}

.pause-overlay-button:hover {
    cursor: pointer;
}

.pause-overlay-button-img {
    user-select: none;
    width: 55px;
}

.pause-overlay-root {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;

    display: flex;
    z-index: 100000000;
    display: flex;
    justify-content: center;
    align-items: center;

}

.pause-overlay-root.open {
    animation: pause-overlay-in 0.4s ease-in forwards;
}

.pause-overlay-root.close {
    animation: pause-overlay-out 3.5s ease-out forwards;
}

.pause-overlay-root.close-fast {
    animation: pause-overlay-out 0.35s ease-out forwards;
}

@keyframes pause-overlay-in {
    0% {
        background-color: rgba(0, 0, 0, 0.0);
        backdrop-filter: blur(0px);
    }

    100% {
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(17px);
    }
}

@keyframes pause-overlay-out {
    0% {
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(17px);
    }

    80% {
        background-color: rgba(0, 0, 0, 0.0);
        backdrop-filter: blur(0px);

    }

    100% {
        display: none;
    }
}
</style>