import type { judgeLineData } from "./judgeLine"

export interface officialChartData {
    formatVersion: number
    offset: number
    judgeLineList: judgeLineData[]
}