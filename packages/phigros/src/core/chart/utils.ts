function isIntersect(
    line1: [[number, number], [number, number]],
    line2: [[number, number], [number, number]]
): boolean {
    return !(
        Math.max(line1[0][0], line1[1][0]) < Math.min(line2[0][0], line2[1][0]) ||
        Math.max(line2[0][0], line2[1][0]) < Math.min(line1[0][0], line1[1][0]) ||
        Math.max(line1[0][1], line1[1][1]) < Math.min(line2[0][1], line2[1][1]) ||
        Math.max(line2[0][1], line2[1][1]) < Math.min(line1[0][1], line1[1][1])
    );
}

function batchIsIntersect(
    linesGroup1: Array<[[number, number], [number, number]]>,
    linesGroup2: Array<[[number, number], [number, number]]>
): boolean {
    for (const line1 of linesGroup1) {
        for (const line2 of linesGroup2) {
            if (isIntersect(line1, line2)) {
                return true;
            }
        }
    }
    return false;
}

function pointInPolygon(polygon: Array<[number, number]>, point: [number, number]): boolean {
    let n = polygon.length;
    let j = n - 1;
    let res = false;
    for (let i = 0; i < n; i++) {
        if (
            (polygon[i][1] > point[1]) !== (polygon[j][1] > point[1]) &&
            point[0] < (polygon[j][0] - polygon[i][0]) * (point[1] - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0]
        ) {
            res = !res;
        }
        j = i;
    }
    return res;
}

function getScreenRect(w: number, h: number): Array<[[number, number], [number, number]]> {
    return [
        [[0, 0], [w, 0]], [[0, 0], [0, h]],
        [[w, 0], [w, h]], [[0, h], [w, h]]
    ];
}

function getScreenPoints(w: number, h: number): Array<[number, number]> {
    return [[0, 0], [w, 0], [w, h], [0, h]];
}

function polygon2Lines(polygon: Array<[number, number]>): Array<[[number, number], [number, number]]> {
    return polygon.map((point, i) => [point, polygon[(i + 1) % polygon.length]]);
}

function polygonIntersect(p1: Array<[number, number]>, p2: Array<[number, number]>): boolean {
    return (
        batchIsIntersect(polygon2Lines(p1), polygon2Lines(p2)) ||
        p2.some(point => pointInPolygon(p1, point)) ||
        p1.some(point => pointInPolygon(p2, point))
    );
}

function polygonInScreen(w: number, h: number, polygon: Array<[number, number]>): boolean {
    return polygonIntersect(getScreenPoints(w, h), polygon);
}

export function noteCanRender(
    w: number, h: number,
    note_max_size_half: number,
    x: number, y: number,
    hold_points: [
        [number, number],
        [number, number],
        [number, number],
        [number, number]
    ] | null = null
): boolean {
    let lt: [number, number], rt: [number, number], rb: [number, number], lb: [number, number];
    if (hold_points === null) { // type != hold
        lt = [x - note_max_size_half, y - note_max_size_half];
        rt = [x + note_max_size_half, y - note_max_size_half];
        rb = [x + note_max_size_half, y + note_max_size_half];
        lb = [x - note_max_size_half, y + note_max_size_half];
    } else {
        [lt, rt, rb, lb] = hold_points;
    }

    return polygonInScreen(w, h, [lt, rt, rb, lb]);
}

export function conimgsize(w: number, h: number, sw: number, sh: number): [number, number] {
    const RPE_WIDTH = 1350
    const rw = w / RPE_WIDTH * sw
    return [rw, rw / w * h]
}