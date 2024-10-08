export abstract class BaseScreen {
    public root: HTMLDivElement = document.createElement("div")
    protected parent:HTMLElement
    constructor(parentEl:HTMLElement){
        this.parent = parentEl
    }
    abstract create(): void;
    abstract destroy(): void;
    abstract addToPage(): void;
}