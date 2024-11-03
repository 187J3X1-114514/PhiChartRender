export const STATUSTEXT = document.createElement("span")
document.body.append(STATUSTEXT)
STATUSTEXT.classList.toggle("status-text-onload")

export class StatusManager{
    private curStatus:string = ""
    private curStatusInfo:string = ""
    constructor(){}
    getStatus(){
        return this.curStatus
    }
    getStatusInfo(){
        return this.curStatusInfo
    }
    setStatus(str:string){
        
        this.callback()
        this.curStatus = str
    }
    setStatusInfo(str:string){
        this.callback()
        this.curStatusInfo = str
    }

    private buildStr(){
        return `${this.curStatus} ${this.curStatusInfo}`
    }

    private callback(){
        let str = this.buildStr()
        //STATUSTEXT.innerText = str
    }
}

export const STATUS = new StatusManager();
(self as any).STATUS = STATUS