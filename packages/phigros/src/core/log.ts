import { Logger } from "tslog"
import { ON_TAURI } from "../ui/tauri";
import {info,debug,warn,error} from '@tauri-apps/plugin-log';
//export const LOGS: string[] = []
export function newLogger(name: string) {
    let logg = new Logger({ "name": name, prettyLogTemplate: "[{{yyyy}}-{{mm}}-{{dd}} {{hh}}:{{MM}}:{{ss}}][{{logLevelName}}]({{name}}) " })
    logg.error
    logg.attachTransport((log) => {
        let __log = ""
        let log_list = []
        for (let _ in log) {
            if (!Number.isNaN(parseInt(_))) {
                log_list.push(log[_])
            }
        }
        __log = `(${log._meta.name}) ${log_list.join(" ")}`
        //LOGS.push(__log)
        if (ON_TAURI){
            switch (log._meta.logLevelName){
                case "DEBUG":
                    debug(__log)
                    break
                case "INFO":
                    info(__log)
                    break
                case "WARN":
                    warn(__log)
                    break
                case "ERROR":
                    error(__log)
                    break
                case "FATAL":
                    error("!!! "+__log)
                    break
            }
            
        }
    })
    return logg
}