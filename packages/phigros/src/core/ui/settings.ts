import type { UISettings } from "../types/ui"
export const defaultUISettings = {
    scale: {
        Pause: 0.85,
        ComboNumber: 1.0,
        Combo: 0.95,
        Score: 1.0,
        Name: 1.0,
        Level: 1.0
    },
    pos: {
        x: {
            Pause: 0.024,
            ComboNumber: 0.5,
            Combo: 0.5,
            Score: 0.02,
            Name: 0.023,
            Level: 0.023
        }
        , y: {
            Pause: 0.043,
            ComboNumber: 0.05,
            Combo: 0.087,
            Score: 0.046,
            Name: 0.036,
            Level: 0.036
        }
    },
    offset: {
        x: {
            Pause: 0.0,
            ComboNumber: 0.0,
            Combo: 0.0,
            Score: 0.0,
            Name: 0.0,
            Level: 0.0
        }
        , y: {
            Pause: 0.0,
            ComboNumber: 0.0,
            Combo: 0.0,
            Score: 0.0,
            Name: 0.0,
            Level: 0.0
        }
    }
} as UISettings