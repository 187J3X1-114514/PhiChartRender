import * as pixi from 'pixi.js'
import { File } from "../file"
export async function loadTextures(src: string | HTMLImageElement | File, resolution: number = 1): Promise<pixi.Texture> {
    var texture: pixi.Texture
    if (src instanceof HTMLImageElement) {
        texture = await pixi.Assets.load({
            src: src.src,
            format: src.src.includes('.') ? src.src.split(".")[src.src.split(".").length - 1] : undefined,
            loadParser: 'loadTextures'
        })
    } else if (src instanceof File) {
        texture = await pixi.Assets.load({
            src: URL.createObjectURL(await src.getBlob()),
            format: src.name.split(".")[src.name.split(".").length - 1],
            loadParser: 'loadTextures'
        })
    } else if (typeof src === 'string') {
        texture = await pixi.Assets.load({
            src: src,
            format: "png",
            loadParser: 'loadTextures'
        })
    } else {
        texture = await pixi.Assets.load("")
    }

    texture.source.resolution = resolution
    return texture
}
export async function loadText(file: File) {
    return await (await file.getBlob()).text()
}
//可解压的文件类型
const SFILES = [
    "7z",
    "apfs",
    "apm",
    "ar",
    "a",
    "deb",
    "udeb",
    "lib",
    "arj",
    "b64",
    "bz2",
    "bzip2",
    "tbz2",
    "tbz",
    "cab",
    "chm",
    "chi",
    "chq",
    "chw",
    "msi",
    "msp",
    "doc",
    "xls",
    "ppt",
    "obj",
    "cpio",
    "cramfs",
    "dmg",
    "elf",
    "ext",
    "ext2",
    "ext3",
    "ext4",
    "img",
    "fat",
    "flv",
    "gpt",
    "mbr",
    "gz",
    "gzip",
    "tgz",
    "tpz",
    "apk",
    "hfs",
    "hfsx",
    "hxs",
    "hxi",
    "hxr",
    "hxq",
    "hxw",
    "lit",
    "ihex",
    "iso",
    "lp",
    "lzh",
    "lha",
    "lzma",
    "lzma86",
    "mbr",
    "macho",
    "mslz",
    "mub",
    "ntfs",
    "nsis",
    "exe",
    "dll",
    "sys",
    "pmd",
    "qcow",
    "qcow2",
    "qcow2c",
    "rar",
    "r00",
    "rpm",
    "swf",
    "swfc",
    "simg",
    "001",
    "squashfs",
    "tar",
    "ova",
    "te",
    "scap",
    "uefif",
    "udf",
    "vdi",
    "vhd",
    "vhdx",
    "avhdx",
    "vmdk",
    "wim",
    "swm",
    "esd",
    "ppkg",
    "xar",
    "pkg",
    "xip",
    "xz",
    "txz",
    "z",
    "taz",
    "zip",
    "z01",
    "zipx",
    "jar",
    "xpi",
    "odt",
    "ods",
    "docx",
    "xlsx",
    "epub",
    "ipa",
    "apk",
    "appx",
    "zst",
    "tzst",
    "pez"
]

export function isArchive(name: string | undefined) {
    if (name) {
        if (SFILES.includes(name.toLowerCase())) {
            return true
        }
        return false
    }
    else {
        return false
    }
}