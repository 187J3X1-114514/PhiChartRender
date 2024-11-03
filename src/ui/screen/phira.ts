import { ResourceManager } from "../../core/resource";
import { BaseScreen } from "./base";
import { ChartPage } from "../phira/chart/chart";
import { account } from "../App.vue";

export class PhiraChartScreen extends BaseScreen {
    private resManger?: ResourceManager
    public chartPage?:ChartPage

    async create(): Promise<void> {
        let api = account!
        this.chartPage = ChartPage.create(api, this.root)
        this.chartPage.searchChart()
    }
    destroy(): void {
        this.chartPage!.remove()
        this.resManger?.destroy()
        delete this.resManger
    }
    addToPage(): void {
        this.parent.appendChild(this.root)
    }

}