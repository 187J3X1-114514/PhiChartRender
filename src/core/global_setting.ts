import { checkInfoData, getInfoData, setInfoData } from "@/ui/data"

export interface GlobalSetting {
    backgroundResolution?: number
    noteTextureResolution?: number
    shouldDestroyNoteSprite?: boolean
    loadCompressedPackageMethod?: "jszip" | "7z-wasm" | "libarchive"
    maxHitParticleCount?: number
    maxHitSoundEffectCount?: number
}

export var GlobalSettings: GlobalSetting = {

}

const DefaultGlobalSettings: GlobalSetting = {
    backgroundResolution: 0.7,
    noteTextureResolution: 0.8,
    shouldDestroyNoteSprite: true,
    loadCompressedPackageMethod: "7z-wasm",
    maxHitParticleCount: 1500,
    maxHitSoundEffectCount: 1000
}

export async function saveGlobalSetting() {
    await setInfoData("GlobalSetting", JSON.stringify(GlobalSettings))
}

export async function loadGlobalSetting() {
    if (await checkInfoData("GlobalSetting")) {
        GlobalSettings = {
            ...DefaultGlobalSettings,
            ...JSON.parse(await getInfoData("GlobalSetting") as string)
        }
    } else {
        GlobalSettings = DefaultGlobalSettings
    }
}

await loadGlobalSetting()