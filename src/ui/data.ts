import localForage from "localforage";
import { newLogger } from "../core/log";
import { I18N } from "./i18n";
import { BaseChartInfo } from "@/core/chart/chartinfo";

const log = newLogger("Database")
localForage.config({
    driver: localForage.INDEXEDDB,
    name: 'USERDATA',
    version: 1.0,
    size: 200000000,
    storeName: 'keyvaluepairs',
    description: 'user data'
})
export const UserInfoDB = localForage.createInstance({
    driver: localForage.LOCALSTORAGE,
    name: 'USERINFO',
    version: 1.0,
    size: 2000000,
    storeName: 'keyvaluepairs',
    description: 'user info'
})
export const ChartDataDB = localForage.createInstance({
    driver: localForage.INDEXEDDB,
    name: 'ChartDATA',
    version: 1.0,
    size: 200000000,
    storeName: 'keyvaluepairs',
    description: 'ChartDATA'

})
export const CacheDataDB = localForage.createInstance({
    driver: localForage.INDEXEDDB,
    name: 'CacheDATA',
    version: 1.0,
    size: 100000000,
    storeName: 'keyvaluepairs',
    description: 'CacheDATA'

})


export async function checkCacheDATA(name: string) {
    return (await CacheDataDB.keys()).includes(`CacheDATA+${name}`)
}

export async function addCacheDATA(name: string, data: any) {
    return new Promise((r) => {
        CacheDataDB.setItem(`CacheDATA+${name}`, data, (e) => {
            log.info(`${I18N.get("log.try_cache_file")}: ${name}`)
            if (e != null) log.warn(`${I18N.get("log.try_cache_file_error")}：${e}`);
            r(null)
        })
    })
}
export async function getCacheDATA(name: string): Promise<any> {
    return new Promise((r) => {
        CacheDataDB.getItem(`CacheDATA+${name}`, (e, v) => {
            log.info(`${I18N.get("log.try_get_file")}: ${name}`)
            if (e != null) log.warn(`${I18N.get("log.try_get_file_error")}：${e}`);
            r(v as Blob)
        })
    })
}

export async function getOrCreateCacheDATA(url: string, other?: RequestInit): Promise<Blob> {
    if (await checkCacheDATA(url)) {
        return getCacheDATA(url)
    } else {
        let bl = await (await fetch(url, other)).blob()
        await addCacheDATA(url, bl)
        return bl
    }
}

export async function getOrCreateCacheDATACallback(url: string, callback: (url: string) => Promise<Blob>): Promise<Blob> {
    if (await checkCacheDATA(url)) {
        return getCacheDATA(url)
    } else {
        let bl = await callback(url)
        await addCacheDATA(url, bl)
        return bl
    }
}

export async function getInfoData(key: string): Promise<string> {
    return new Promise((r) => {
        UserInfoDB.getItem(key, (e, v) => {
            if (e != null) log.warn(`${I18N.get("log.try_get_userinfo_error")}${key}：${e}`);
            r(v as string)
        })
    })
}

export async function setInfoData(key: string, value: string) {
    return new Promise((r) => {
        UserInfoDB.setItem(key, value, (e) => {
            if (e != null) log.warn(`${I18N.get("log.try_cache_userinfo_error")}${key}：${e}`);
            r(null)
        })
    })
}

export async function checkInfoData(key: string) {
    return (await UserInfoDB.keys()).includes(key)
}

export async function addChartByID(id: string, chart: Blob) {
    return new Promise((r) => {
        ChartDataDB.setItem(`CHART-ID+${id}`, chart, (e) => {
            log.info(`${I18N.get("log.try_cache_chart")}: ${id}`)
            if (e != null) log.warn(`${I18N.get("log.try_cache_chart_error")}：${e}`);
            r(null)
        })
    })
}
export async function getChartByID(id: string): Promise<Blob> {
    return new Promise((r) => {
        ChartDataDB.getItem(`CHART-ID+${id}`, (e, v) => {
            log.info(`${I18N.get("log.try_get_chart")}: ${id}`)
            if (e != null) log.warn(`${I18N.get("log.try_get_chart_error")}：${e}`);
            r(v as Blob)
        })
    })
}

export async function removeChartByID(id: string) {
    return new Promise((r) => {
        ChartDataDB.removeItem(`CHART-ID+${id}`, (e) => {
            r(null)
        })
    })
}

export async function checkChartByID(id: string) {
    CacheChartInfo = await getAllChartInfo()
    return CacheChartInfo[id] != undefined
}

export async function addChartInfo(info: BaseChartInfo, id: string | number) {
    CacheChartInfo[id] = info as any
    await saveAllChartInfo()
}

interface ChartInfo {
    name: string
    music: string
    illustration: string
    chart: string
    charter: string
    level: string
}

const CHARTINFO_KEY = "CHARTINFO"

export async function getAllChartInfo(): Promise<Record<string, ChartInfo>> {
    if (await checkInfoData(CHARTINFO_KEY)) {
        return JSON.parse(await getInfoData(CHARTINFO_KEY))
    } else {
        return {}
    }
}

export async function saveAllChartInfo() {
    await setInfoData(CHARTINFO_KEY, JSON.stringify(CacheChartInfo))
}


export var CacheChartInfo = await getAllChartInfo()
log.info(I18N.get("log.init_database_done"))