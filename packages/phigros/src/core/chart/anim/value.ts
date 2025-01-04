import { BaseAnim, calculateResult } from "./base";
import { ValueEvent } from "./type";

export class ValueAnim extends BaseAnim {
    public events: ValueEvent[] = []
    public originValue: number = 0
    public eventIndex: number = 0
    calculate(currentTime: number, defaultValue: number = 1): calculateResult<any> {
        let result: calculateResult<any> = {
            value: defaultValue,
            notDefault: false,
            eventIndex: this.eventIndex
        }
        for (let i = 0, length = this.eventIndex; i < length; i++) {
            let event = this.events[i]
            if (event.endTime < currentTime) continue
            if (event.startTime > currentTime) break

            result.value = event.value!
            result.notDefault = true
            result.eventIndex = i
        }
        this.eventIndex = result.eventIndex
        return result

    }
    push(event: ValueEvent) {
        this.events.push(event)
    }
}