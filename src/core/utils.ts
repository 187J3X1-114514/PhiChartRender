import '/assets/error.jpg?url'
export async function printImage(scale:number = 1,callback?:()=>any,url: string = "assets/error.jpg") {
    await new Promise((r)=>{
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
                (callback?callback:()=>{})()
            }
        }
        img.src = url
    })
}