import { task, logger } from "@trigger.dev/sdk/v3";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";

ffmpeg.setFfmpegPath(ffmpegPath!);
ffmpeg.setFfprobePath(ffprobeStatic.path);

export const extractFrame = task({
    id: "extract-frame",
    maxDuration: 300,
    run: async (payload: { video: string; timestamp: number; unit: "seconds" | "percentage" }, { ctx }) => {
        logger.log("Starting Extract Frame task", { payload });

        const tmpDir = os.tmpdir();
        const inputPath = path.join(tmpDir, `${uuidv4()}_input.mp4`);
        const outputPath = path.join(tmpDir, `${uuidv4()}_output.png`);

        try {
            // 1. Download/Save Video. 
            // payload.video is likely a Blob URL which won't work server-side if it's strictly local.
            // BUT, if it's a data URL or a public URL it works.
            // However, VideoNode creates `URL.createObjectURL(file)`. This is a browser-local blob: URI.
            // This CANNOT be fetched by the server. 
            // The User needs to upload the video first (e.g. to Transloadit as per comment in VideoNode, or passed as base64).
            // For this implementation, since we don't have a real upload server, we must rely on the user passing base64 or a real URL.
            // 
            // WAIT. VideoNode sets preview = objectUrl. 
            // If the user wants to test this, they need a real URL. 
            // OR we can convert the file to base64 in VideoNode before sending.
            // But VideoNode currently only does objectURL.
            // 
            // Assumption: The user will provide a publicly accessible URL in the TextNode or input field for now, 
            // OR we need to update VideoNode to read as DataURL (Base64) to support "local" files passed to server.
            // Given the constraints and previous CropNode pattern (which used base64), 
            // let's update VideoNode to store DataURL instead of ObjectURL? 
            // ObjectURL is efficient for preview, DataURL is heavy but portable to server.
            // 
            // Let's support both: if starts with "data:", write to file. If "http", pass url to ffmpeg directly.

            let inputSource = inputPath; // default to local file
            if (payload.video.startsWith("data:")) {
                const base64Data = payload.video.split(",")[1];
                await fs.writeFile(inputPath, Buffer.from(base64Data, 'base64'));
            } else if (payload.video.startsWith("http") || payload.video.startsWith("https")) {
                inputSource = payload.video; // FFmpeg supports URLs
            } else if (payload.video.startsWith("/")) {
                // Handle local public files (Development mode)
                const localPath = path.join(process.cwd(), "public", payload.video);

                // ✅ Check if file exists before using it
                try {
                    await fs.access(localPath);
                    inputSource = localPath;
                } catch (err) {
                    throw new Error(`Video file not found in public directory: ${payload.video}. Make sure the file exists or use a base64 data URL instead.`);
                }
            } else {
                throw new Error("Invalid video source. Must be a Data URL, HTTP URL, or local public path (starting with /).");
            }

            // 2. Calculate Timestamp if percentage
            let seekTime = payload.timestamp;
            if (payload.unit === "percentage") {
                const duration = await new Promise<number>((resolve, reject) => {
                    ffmpeg.ffprobe(inputSource, (err: any, metadata: any) => {
                        if (err) reject(err);
                        else {
                            const formatDuration = metadata.format.duration;
                            if (formatDuration) resolve(formatDuration);
                            else reject(new Error("Could not determine video duration"));
                        }
                    });
                });
                seekTime = (payload.timestamp / 100) * duration;
            }

            logger.log("Seeking to", { seekTime });

            // 3. Extract Frame
            await new Promise((resolve, reject) => {
                ffmpeg(inputSource)
                    .seekInput(seekTime)
                    .frames(1)
                    .on('end', resolve)
                    .on('error', (err: any) => {
                        logger.error("FFmpeg extract error", { err });
                        reject(err);
                    })
                    .save(outputPath);
            });

            // 4. Read Output
            const outputBuffer = await fs.readFile(outputPath);
            const base64Output = `data:image/png;base64,${outputBuffer.toString('base64')}`;

            return {
                image: base64Output,
            };

        } catch (error) {
            logger.error("Extract Frame task failed", { error });
            throw error;
        } finally {
            // Cleanup temp input if it was created
            try {
                if (payload.video.startsWith("data:")) {
                    await fs.unlink(inputPath).catch(() => { });
                }
                await fs.unlink(outputPath).catch(() => { });
            } catch (e) {
                // ignore
            }
        }
    },
});
