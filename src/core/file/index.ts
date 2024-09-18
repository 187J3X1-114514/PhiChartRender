import { Archive, loadZipUse7zWASM,loadZipUseLibarchivejs } from './zip'
import {File, FileType} from './file'
const loadZip = loadZipUse7zWASM
export {
    Archive as Zip, loadZip, File, FileType
}