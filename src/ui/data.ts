import localForage from "localforage";
import { newLogger } from "../core/log";

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
log.info("初始化数据库完成")
export async function addChartByPhiraID(id: number, chart: Blob) {
    return new Promise((r) => {
        ChartDataDB.setItem(`PHIRA-CHART-ID+${id}`, chart, (e) => {
            log.info(`尝试缓存铺面: ${id}`)
            if (e != null) log.warn(`尝试缓存铺面时发生错误：${e}`);
            r(null)
        })
    })
}
export async function getChartByPhiraID(id: number): Promise<Blob> {
    return new Promise((r) => {
        ChartDataDB.getItem(`PHIRA-CHART-ID+${id}`, (e, v) => {
            log.info(`尝试获取铺面: ${id}`)
            if (e != null) log.warn(`尝试获取铺面时发生错误：${e}`);
            r(v as Blob)
        })
    })
}
export async function checkChartByPhiraID(id: number) {
    return (await ChartDataDB.keys()).includes(`PHIRA-CHART-ID+${id}`)
}


export async function checkCacheDATA(name: string) {
    return (await CacheDataDB.keys()).includes(`CacheDATA+${name}`)
}

export async function addCacheDATA(name: string, data: any) {
    return new Promise((r) => {
        CacheDataDB.setItem(`CacheDATA+${name}`, data, (e) => {
            log.info(`尝试缓存文件: ${name}`)
            if (e != null) log.warn(`尝试缓存文件时发生错误：${e}`);
            r(null)
        })
    })
}
export async function getCacheDATA(name: string): Promise<any> {
    return new Promise((r) => {
        CacheDataDB.getItem(`CacheDATA+${name}`, (e, v) => {
            log.info(`尝试获取缓存文件: ${name}`)
            if (e != null) log.warn(`尝试获取缓存文件时发生错误：${e}`);
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

export async function getOrCreateCacheDATACallback(url: string, callback: (url:string)=>Promise<Blob>): Promise<Blob> {
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
            if (e != null) log.warn(`尝试获取用户信息时时发生错误${key}：${e}`);
            r(v as string)
        })
    })
}

export async function setInfoData(key: string, value: string) {
    return new Promise((r) => {
        UserInfoDB.setItem(key, value, (e) => {
            if (e != null) log.warn(`尝试存储用户信息时时发生错误${key}：${e}`);
            r(null)
        })
    })
}

export async function checkInfoData(key: string) {
    return (await UserInfoDB.keys()).includes(key)
}