import { Button, Card, Select, MenuItem } from "mdui";
import { ResourceManager } from "../../core/resource";
import { account, app, reqLogin, ResPack } from "../main";
import { PlayS } from "../play/play";
import { BaseScreen } from "./base";
import { ChartPage } from "../phira/chart/chart";

export class PhiraScreen extends BaseScreen {
    private resManger?: ResourceManager

    async create(): Promise<void> {
        await reqLogin()
        let api = account!
        await ChartPage.create(api, this.root)
    }
    destroy(): void {
        this.resManger?.destroy()
        delete this.resManger
    }
    addToPage(): void {
        this.parent.appendChild(this.root)
    }

}