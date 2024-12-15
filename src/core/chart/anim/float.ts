import { BaseAnim, calculateResult } from "./base";
import { Event } from "./type";

export class FloatAnim extends BaseAnim {
    public events: Event[] = []
    public originValue?: number
    public eventIndex: number = 0
    public lastResult?: calculateResult<number>
    calculate(currentTime: number): calculateResult<number> {
        let result = this.valueCalculator(
            this.events,
            currentTime,
            this.originValue != undefined ? this.originValue : this.lastResult?.value,
            this.eventIndex
        )
        if (!result.notDefault) {
            this.eventIndex = result.eventIndex
            this.lastResult = result
        }
        return result
    }
    push(event: Event) {
        this.events.push(event)
    }
}