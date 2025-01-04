import * as MP4Muxer from "mp4-muxer";
import { AVC } from "media-codecs";
import { estimateBitRate } from "./utils";

export class WebCodecsEncoder {
    public encoderOptions: any;
    public muxer?: MP4Muxer.Muxer<MP4Muxer.ArrayBufferTarget>;
    public width?: number;
    public height?: number;
    public encoder?: VideoEncoder;
    public frameRate: number = 60;
    public groupOfPictures: number = 20;
    private flushFrequency: number = 10;

    async init() {
        const codec = AVC.getCodec({ profile: "High", level: "5.2" })
        const CCCC = codec.split(".")[0];
        const muxer = MP4Muxer;
        this.muxer = new muxer.Muxer({
            target: new muxer.ArrayBufferTarget(),
            video: {
                codec:
                    CCCC.startsWith("hev") || CCCC.startsWith("hvc")
                        ? "hevc"
                        : "avc",
                width: this.width!,
                height: this.height!,
            },
            firstTimestampBehavior: "offset", // "strict" | "offset" | "permissive"
            fastStart: "in-memory",
        });

        this.encoder = new VideoEncoder({
            output: (chunk, meta) => this.muxer!.addVideoChunk(chunk, meta),
            error: (e) => console.error(e),
        });

        const config = {
            width: this.width,
            height: this.height,
            framerate: this.frameRate,
            bitrate: estimateBitRate(
                this.width!,
                this.height!,
                this.frameRate
            ),
            ...this.encoderOptions,
            codec,
        };

        this.encoder.configure(config);
        if (!(await VideoEncoder.isConfigSupported(config)).supported) {
            throw new Error(
                `canvas-record: Unsupported VideoEncoder config\n ${JSON.stringify(
                    config
                )}`
            );
        }
    }

    async encode(frame: VideoFrame, number: number) {
        const keyFrame = number % this.groupOfPictures === 0;

        this.encoder!.encode(frame, { keyFrame });
        frame.close();
        if (this.flushFrequency && (number + 1) % this.flushFrequency === 0) {
            await this.encoder!.flush();
        }
    }

    async stop() {
        await this.encoder!.flush();
        this.muxer!.finalize();
        const buffer = this.muxer!.target?.buffer;
        return buffer;
    }


}