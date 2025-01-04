export default class JudgePoint {
    x: number
    y: number
    input: { x: number, y: number, isFlicked: boolean }
    type: number
    constructor(input: { x: number, y: number, isFlicked: boolean }, type = 1) {
        this.x = input.x;
        this.y = input.y;
        this.input = input;
        this.type = type; // 1: tap, 2: flick, 3: hold
    }

    isInArea(x: number, y: number, cosr: number, sinr: number, hw: number) {
        return Math.abs((this.x - x) * cosr + (this.y - y) * sinr) <= hw;
    }
}