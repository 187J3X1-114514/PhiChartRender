import utils from "../../core/chart/convert/utils";
import { Button } from "mdui";

function clamp(value: number) {
    return Math.min(1, Math.max(0, value));
}

export const Easing = [
    (x: number): number => x, //1
    (x: number): number => Math.sin(x * Math.PI / 2), //2
    (x: number): number => 1 - Math.cos(x * Math.PI / 2), //3
    (x: number): number => 1 - (x - 1) ** 2, //4
    (x: number): number => x ** 2, //5
    (x: number): number => (1 - Math.cos(x * Math.PI)) / 2, //6
    (x: number): number => ((x *= 2) < 1 ? x ** 2 : -((x - 2) ** 2 - 2)) / 2, //7
    (x: number): number => 1 + (x - 1) ** 3, //8
    (x: number): number => x ** 3, //9
    (x: number): number => 1 - (x - 1) ** 4, //10
    (x: number): number => x ** 4, //11
    (x: number): number => ((x *= 2) < 1 ? x ** 3 : ((x - 2) ** 3 + 2)) / 2, //12
    (x: number): number => ((x *= 2) < 1 ? x ** 4 : -((x - 2) ** 4 - 2)) / 2, //13
    (x: number): number => 1 + (x - 1) ** 5, //14
    (x: number): number => x ** 5, //15
    (x: number): number => 1 - 2 ** (-10 * x), //16
    (x: number): number => 2 ** (10 * (x - 1)), //17
    (x: number): number => Math.sqrt(1 - (x - 1) ** 2), //18
    (x: number): number => 1 - Math.sqrt(1 - x ** 2), //19
    (x: number): number => (2.70158 * x - 1) * (x - 1) ** 2 + 1, //20
    (x: number): number => (2.70158 * x - 1.70158) * x ** 2, //21
    (x: number): number => ((x *= 2) < 1 ? (1 - Math.sqrt(1 - x ** 2)) : (Math.sqrt(1 - (x - 2) ** 2) + 1)) / 2, //22
    (x: number): number => x < 0.5 ? (14.379638 * x - 5.189819) * x ** 2 : (14.379638 * x - 9.189819) * (x - 1) ** 2 + 1, //23
    (x: number): number => 1 - 2 ** (-10 * x) * Math.cos(x * Math.PI / .15), //24
    (x: number): number => 2 ** (10 * (x - 1)) * Math.cos((x - 1) * Math.PI / .15), //25
    (x: number): number => ((x *= 11) < 4 ? x ** 2 : x < 8 ? (x - 6) ** 2 + 12 : x < 10 ? (x - 9) ** 2 + 15 : (x - 10.5) ** 2 + 15.75) / 16, //26
    (x: number): number => 1 - Easing[25](1 - x), //27
    (x: number): number => (x *= 2) < 1 ? Easing[25](x) / 2 : Easing[26](x - 1) / 2 + .5, //28
    (x: number): number => x < 0.5 ? 2 ** (20 * x - 11) * Math.sin((160 * x + 1) * Math.PI / 18) : 1 - 2 ** (9 - 20 * x) * Math.sin((160 * x + 1) * Math.PI / 18) //29
];
export interface keyframe {
    duration: number
    start: number
    end: number
    easing: number

}
export function genAnimation(e: Element, keyframe: keyframe, name: string) {
    const data = keyframe
    const event = {
        "startTime": 0,
        "endTime": 1,
        "easingType": data.easing,
        "start": data.start,
        "end": data.end
    }
    const events = utils.calculateEventEase(event, Easing)
    const keyframes: any[] = []
    events.forEach((v) => {
        v.startTime = clamp(v.startTime)
        v.endTime = clamp(v.endTime)
        let keyframe: { [key: string]: any } = {}
        keyframe[name] = v.start
        keyframe["offset"] = v.startTime
        keyframes.push(keyframe)
    })
    keyframes.push((() => {
        let v = events.pop()!
        v.startTime = clamp(v.startTime)
        v.endTime = clamp(v.endTime)
        let keyframe: { [key: string]: any } = {}
        keyframe[name] = v.end
        keyframe["offset"] = v.endTime
        return keyframe
    })())
    return new Animation(new KeyframeEffect(e, keyframes, {
        duration: keyframe.duration, fill: 'forwards'
    }), document.timeline)
}
export function genDialogBtn(variant: "elevated" | "filled" | "tonal" | "outlined" | "text") {
    let btn = new Button()
    btn.slot = "action"
    btn.variant = variant
    return btn
}