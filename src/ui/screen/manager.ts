import { BaseScreen } from "./base";
import { LocalScreen } from "./local";

export class ScreenManager {
    public screen: BaseScreen = undefined as any
    public root: HTMLElement = undefined as any
    private constructor() { }
    static async init(root: HTMLElement) {
        let _ = new this()
        _.root = root
        await _.change(new LocalScreen(_.root))
        return _
    }
    async change(screen: BaseScreen,onclose:()=>void=()=>{}) {
        if (this.screen != undefined) {
            await this.screen.close()
        }
        await onclose()
        this.screen = screen
        await this.screen.create()
        this.screen.root.classList.add("push-in-y")
        this.screen.addToPage()
        setTimeout(() => {
            this.screen!.root.classList.remove("push-in-y")
        }, 400)
    }
}