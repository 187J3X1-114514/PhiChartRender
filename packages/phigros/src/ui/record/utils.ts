
export const estimateBitRate = (
    width: number,
    height: number,
    frameRate = 30,
    motionRank = 4,
    bitrateMode = "variable",
) =>
    Math.round(
        (width *
            height *
            frameRate *
            motionRank *
            0.07 *
            (bitrateMode === "variable" ? 0.75 : 1)) /
        1_000_000,
    ) * 1_000_000;

export const downloadBlob = (filename: string, blobPart: BlobPart[] | undefined, mimeType: any) => {
    let link;
    link ||= document.createElement("a");
    link.download = filename;

    const blob = new Blob(blobPart, { type: mimeType });
    const url = URL.createObjectURL(blob);
    link.href = url;

    const event = new MouseEvent("click");
    link.dispatchEvent(event);

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1);
};