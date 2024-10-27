import '/assets/error.jpg?url'
export async function printImage(scale: number = 1, callback?: () => any, url: string = "assets/error.jpg") {
    await new Promise((r) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
            const c = document.createElement('canvas')
            const ctx = c.getContext('2d')
            if (ctx) {
                c.width = img.width
                c.height = img.height
                ctx.fillStyle = "red";
                ctx.fillRect(0, 0, c.width, c.height);
                ctx.drawImage(img, 0, 0)
                const dataUri = c.toDataURL('image/png')

                console.log(`%c sup?`,
                    `
                font-size: 1px;
                padding: ${Math.floor((img.height * scale) / 2)}px ${Math.floor((img.width * scale) / 2)}px;
                background-image: url(${dataUri});
                background-repeat: no-repeat;
                background-size: ${img.width * scale}px ${img.height * scale}px;
                color: transparent;
              `
                )
                r(null);
                (callback ? callback : () => { })()
            }
        }
        img.src = url
    })
}

export function deepCopy<T>(instance: T): T {
    if (instance == null) {
        return instance;
    }
    if (instance instanceof Date) {
        return new Date(instance.getTime()) as any;
    }

    if (instance instanceof Array) {
        var cloneArr = [] as any[];
        (instance as any[]).forEach((value) => { cloneArr.push(value) });
        return cloneArr.map((value: any) => deepCopy<any>(value)) as any;
    }
    if (instance instanceof Object) {
        var copyInstance = {
            ...(instance as { [key: string]: any }
            )
        } as { [key: string]: any };
        for (var attr in instance) {
            if ((instance as Object).hasOwnProperty(attr))
                copyInstance[attr] = deepCopy<any>((instance as any)[attr]);
        }
        return copyInstance as T;
    }
    return instance;
}