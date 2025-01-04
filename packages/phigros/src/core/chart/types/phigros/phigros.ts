import { judgeLine } from "./line"

export interface PhigrosOfficialChart {
    formatVersion: number
    offset: number
    judgeLineList: judgeLine[]
}