export interface Vec2<T> {
    x: T
    y: T
}

export interface Vec3<T> {
    x: T
    y: T
    z: T
}

export function Vec2<T>(x: T, y: T) {
    return {
        x: x,
        y: y
    } as Vec2<T>
}

export function Vec3<T>(x: T, y: T, z: T) {
    return {
        x: x,
        y: y,
        z: z
    } as Vec3<T>
}