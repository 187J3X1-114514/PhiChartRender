import { Application } from "pixi.js"
import { ChartData } from "../chart/chartinfo"
import { ResourceManger } from "../resource"
import { PhiAssets } from "../resource/resource_pack"
import { PrprExtra } from "../prpr/prpr"

export interface GameParams {
    app: Application
    render: {
        width?: number,
        height?: number,
        resolution?: number,
        autoDensity?: boolean,
        antialias?: boolean,
        view?: HTMLCanvasElement,
        resizeTo?: HTMLElement
    },
    chart: ChartData,
    assets: PhiAssets,
    effects?: PrprExtra,
    zipFiles?: ResourceManger,
    settings: {
        audioOffset?: number,
        hitsound?: boolean,
        hitsoundVolume?: number,
        speed?: number,
        noteScale?: number,
        bgDim?: number,
        multiNoteHL?: boolean,
        showInputPoint?: boolean,
        challengeMode?: boolean,
        autoPlay?: boolean,
        showFPS?: boolean,
        showAPStatus?: boolean,
        shader?: boolean
    }

}
export interface GameSettings {
    resolution: number,
    noteScale: number,
    bgDim: number,
    offset: number,
    speed: number,
    showFPS: boolean,
    showInputPoint: boolean,
    multiNoteHL: boolean,
    showAPStatus: boolean,
    challengeMode: boolean,
    autoPlay: boolean,
    shader: boolean
};

export interface SizerData {

    shaderScreenSize: number[]

    width: number
    height: number
    widthPercent: number
    widthOffset: number

    widerScreen: boolean

    startX: number
    endX: number
    startY: number
    endY: number

    noteSpeed: number
    noteScale: number
    noteWidth: number
    lineScale: number
    heightPercent: number
    textureScale: number
    baseFontSize: number

    lineHeightScale: number
    lineWidthScale: number
}