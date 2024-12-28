import { Archive, loadZipUse7zWASM, loadZipUseLibarchivejs, loadZipUseJSZip } from './zip'
import { File, FileType } from './file'
import { GlobalSettings } from '../global_setting'
console.log("使用"+GlobalSettings.loadCompressedPackageMethod!+"解压")
var loadZip: (name: string, file: Blob | ArrayBuffer) => Promise<Archive>
switch (GlobalSettings.loadCompressedPackageMethod!) {
    case 'jszip':
        
        loadZip = loadZipUseJSZip
        break
    case '7z-wasm':
        loadZip = loadZipUse7zWASM
        break
    case 'libarchive':
        loadZip = loadZipUseLibarchivejs
        break
    default:
        loadZip = loadZipUseJSZip
        break
}


export {
    Archive as Zip, loadZip, File, FileType
}