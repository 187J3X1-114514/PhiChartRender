export interface UISettings{
    scale:{
        Pause: number,
        ComboNumber: number,
        Combo: number,
        Score: number,
        Name: number,
        Level: number
    },
    pos:{
        x:{
            Pause: number,
            ComboNumber: number,
            Combo: number,
            Score: number,
            Name: number,
            Level: number
        }
        ,y:{
            Pause: number,
            ComboNumber: number,
            Combo: number,
            Score: number,
            Name: number,
            Level: number
        }
    },
    offset:{
        x:{
            Pause: number,
            ComboNumber: number,
            Combo: number,
            Score: number,
            Name: number,
            Level: number
        }
        ,y:{
            Pause: number,
            ComboNumber: number,
            Combo: number,
            Score: number,
            Name: number,
            Level: number
        }
    }
}
export interface UIElementSettings{
    offsetX:number
    offsetY:number
    X:number
    Y:number
    scaleX:number
    scaleY:number
}

export enum attachUI {
    Pause,
    ComboNumber,
    Combo,
    Score,
    Name,
    Level,
}

export abstract class baseUIManger{
    abstract getUIElementSettings(type:attachUI):UIElementSettings
}