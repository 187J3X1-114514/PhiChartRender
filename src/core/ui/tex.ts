import { Texture } from "pixi.js";

export const pauseButton = (() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const buttonWidth = 12
    const width = 34
    const height = 37
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, buttonWidth, height);
    ctx.fillRect(width - buttonWidth, 0, buttonWidth, height);

    const result = Texture.from(canvas);

    return result;
})();