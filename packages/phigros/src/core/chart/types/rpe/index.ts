type RPETime = [number, number, number];
type RPEUIElement = "bar" | "pause" | "combonumber" | "combo" | "score" | "name" | "level"
interface RPEBpmItem {
    bpm: number;
    startTime: RPETime;
}

interface RPEEvent<T = number> {
    easingLeft: number;
    easingRight: number;
    bezier: number;
    bezierPoints: [number, number, number, number];
    easingType: number;
    start: T;
    end: T;
    startTime: RPETime;
    endTime: RPETime;
}

interface RPECtrlEvent {
    easing: number;
    x: number;
    value: Record<string, number>;
}

interface RPESpeedEvent {
    startTime: RPETime;
    endTime: RPETime;
    start: number;
    end: number;
}

interface RPEEventLayer extends Record<string, RPEEvent[] | RPESpeedEvent[]> {
    alphaEvents: RPEEvent[];
    moveXEvents: RPEEvent[];
    moveYEvents: RPEEvent[];
    rotateEvents: RPEEvent[];
    speedEvents: RPESpeedEvent[];
}

interface RGBColor {
    r: number;
    g: number;
    b: number;
}

interface RPEExtendedEvents {
    colorEvents?: RPEEvent<RGBColor>[];
    textEvents?: RPEEvent<string>[];
    scaleXEvents?: RPEEvent[];
    scaleYEvents?: RPEEvent[];
    inclineEvents?: RPEEvent[];
    paintEvents?: RPEEvent[];
    gifEvents?: RPEEvent[];
}

interface RPENote {
    type: number;
    above: number;
    startTime: RPETime;
    endTime: RPETime;
    positionX: number;
    yOffset: number;
    alpha: number;
    hitsound?: string;
    size: number;
    speed: number;
    isFake: number;
    visibleTime: number;
}

interface RPEJudgeLine {
    Name: string;
    Texture: string;
    father: number;
    eventLayers: (RPEEventLayer | null)[];
    extended: RPEExtendedEvents;
    notes: RPENote[];
    isCover: number;
    zOrder: number;
    attachUI: RPEUIElement;
    posControl: RPECtrlEvent[];
    sizeControl: RPECtrlEvent[];
    alphaControl: RPECtrlEvent[];
    yControl: RPECtrlEvent[];
}

interface RPEMetadata {
    offset: number;
    RPEVersion: number;
    background: string;
    charter: string;
    composer: string;
    id: string;
    level: string;
    name: string;
    song: string;

}

interface RPEChart {
    META: RPEMetadata;
    BPMList: RPEBpmItem[];
    judgeLineList: RPEJudgeLine[];
}

export {
    RPEChart,
    RPEJudgeLine,
    RPENote,
    RPEExtendedEvents,
    RPEEventLayer,
    RPEEvent,
    RPESpeedEvent,
    RPECtrlEvent,
    RGBColor,
    RPETime,
    RPEUIElement,
    RPEBpmItem
}