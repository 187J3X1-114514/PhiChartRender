import { Button, Checkbox, CircularProgress, Dialog, TextField } from "mdui";
import { PhiraAPI } from "../../api/phira";
export async function aChart(id: number) {

}

let a = {
    id: 19508,
    name: "Ours",
    level: "IN Lv.14",
    charter: "Ours（vitaminb＆唯空wekon）",
    composer: "*Luna feat.初音ミク",
    illustrator: "",
    description: "B站:没有营养的维生素b＆唯空wekon\n高考纪念谱，希望大家喜欢！\n手元及屏元需同时@我们两位谱师\nps:那两个移动hold是全屏判定",
    illustration: "https://api.phira.cn/files/363219b3-37b5-47b4-9319-b70cb1f9e2e3",
    preview: "https://api.phira.cn/files/4ec5e086-9335-46d1-b983-c8157f82118f",
    file: "https://api.phira.cn/files/7740f9c2-527d-412d-b0d6-75fb392d25f3",
    uploader: 30,
    tags: [
        "regular"
    ],
    created: "2024-05-04T12:08:47.669191Z",
    updated: "2024-05-04T15:38:15.823452Z",
    chartUpdated: "2024-05-04T12:08:47.669191Z"
}

class ChartPage {
    public chart: PhiraAPIChartInfo[] = []
    public api:PhiraAPI
    private constructor(){}
    static async create(api:PhiraAPI){
        let chartPage = new this()
        chartPage.api = api
        let charts = PhiraAPI
    }
}