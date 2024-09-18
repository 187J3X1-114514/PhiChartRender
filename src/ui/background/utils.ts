export async function genNoise(width:number,height:number) {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")!
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            ctx.fillStyle = `rgb(${(255*Math.random()).toFixed()},${(255*Math.random()).toFixed()},${(255*Math.random()).toFixed()})`
            ctx.fillRect(x,y,1,1)
        }
    }
    return await createImageBitmap(canvas)
}