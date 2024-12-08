import { BaseAnim, calculateResult } from "./base";
import { Event } from "./type";

export class FloatAnim extends BaseAnim {
    public events: Event[] = []
    public originValue: number = 0
    public eventIndex: number = 0
    calculate(currentTime: number): calculateResult<number> {
        let result = this.valueCalculator(
            this.events,
            currentTime,
            this.originValue,
            this.eventIndex
        )
        if (!result.notDefault) {
            this.eventIndex = result.eventIndex
        }
        return result
    }
    push(event: Event) {
        this.events.push(event)
    }
}