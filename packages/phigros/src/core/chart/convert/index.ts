import Official from './official';
import PhiEdit from './phiedit';
import RePhiEdit from './rephiedit';
import { newLogger } from '../../log'
export const chart_log = newLogger("Chart")
export {
    Official,
    PhiEdit,
    RePhiEdit
};

export default function autoParseChart(data: string | Object) {
    var chart
    var type = "phi"
    var error
    try {
        if (typeof data === "object") {
            if (data.hasOwnProperty("formatVersion")) {
                chart = Official(data as any)
            } else if (data.hasOwnProperty("META")) {
                type = "rpe"
                chart = RePhiEdit(data as any)
            }
        } else if (!isNaN(parseFloat(data.split("\n")[0]))) {
            type = "pec"
            chart = PhiEdit(data)
        }
    } catch (e) {
        chart = null
        error = e
    }
    if (chart === null) {
        throw new Error(`TYPE:${type} SRC:${data}的铺面解析失败: ${error}`)
    }
    return { chart, type }
}