async function mergeAudioBuffers(
    context: AudioContext,
    buffer1: AudioBuffer,
    buffer2: AudioBuffer,
    insertTime: number
): Promise<AudioBuffer> {
    const outputChannels = Math.max(buffer1.numberOfChannels, buffer2.numberOfChannels);
    const outputLength = Math.max(buffer1.length, insertTime * context.sampleRate + buffer2.length);
    const outputSampleRate = buffer1.sampleRate;

    const outputBuffer = context.createBuffer(outputChannels, outputLength, outputSampleRate);

    for (let channel = 0; channel < outputChannels; channel++) {
        const outputData = outputBuffer.getChannelData(channel);
        const buffer1Data = buffer1.getChannelData(channel % buffer1.numberOfChannels);
        const buffer2Data = buffer2.getChannelData(channel % buffer2.numberOfChannels);

        for (let i = 0; i < buffer1.length; i++) {
            outputData[i] = buffer1Data[i];
        }

        const insertSample = Math.floor(insertTime * context.sampleRate);
        for (let i = 0; i < buffer2.length; i++) {
            outputData[insertSample + i] += buffer2Data[i];
        }
    }

    return outputBuffer;
}