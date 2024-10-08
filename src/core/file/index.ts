import { Archive, loadZipUse7zWASM,loadZipUseLibarchivejs,loadZipUseJSZip } from './zip'
import {File, FileType} from './file'
const loadZip = loadZipUseJSZip
export {
    Archive as Zip, loadZip, File, FileType
}