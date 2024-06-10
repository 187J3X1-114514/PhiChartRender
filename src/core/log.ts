import { Logger } from "tslog"
export function newLogger(name:string){
    return new Logger({"name":name,prettyLogTemplate:"[{{yyyy}}-{{mm}}-{{dd}} {{hh}}:{{MM}}:{{ss}}][{{logLevelName}}]({{name}}) "})
}