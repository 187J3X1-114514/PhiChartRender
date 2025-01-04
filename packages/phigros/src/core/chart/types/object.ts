import { PhiAssets } from "../../resource/resource_pack"
import { Vec2 } from "./data"

export interface Resizable {
    resize(size: SizeData): void
}

export interface Destroyable {
    destory(): void
}

export interface Creatable {
    create(assets: PhiAssets): void
}

export interface Renderable extends Resizable, Destroyable, Creatable { }

export interface SizeData {
    size: Vec2<number>
    lineScale: Vec2<number>
}