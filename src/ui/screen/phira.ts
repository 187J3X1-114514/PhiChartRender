import { Button, Card, Select, MenuItem } from "mdui";
import { ResourceManager } from "../../core/resource";
import { account, app, reqLogin, ResPack } from "../main";
import { PlayS } from "../play/play";
import { BaseScreen } from "./base";
import { ChartPage } from "../phira/chart/chart";

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