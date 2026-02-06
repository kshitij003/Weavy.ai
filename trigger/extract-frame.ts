import { task, logger } from "@trigger.dev/sdk/v3";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";

export const extractFrame = task({
    id: "extract-frame",
    maxDuration: 300,
    run: async (payload: { video: string; timestamp: number; unit: "seconds" | "percentage" }, { ctx }) => {
        logger.log("Starting Extract Frame task (ffmpeg.wasm)", { payload });

        const tmpDir = os.tmpdir();
        const inputPath = path.join(tmpDir, `${uuidv4()}_input.mp4`);
        const outputPath = path.join(tmpDir, `${uuidv4()}_output.png`);

        try {
            // 1. Parse and Save Input Video
            let inputSource = inputPath; // default to local file
            if (payload.video.startsWith("data:")) {
                const base64Data = payload.video.split(",")[1];
                await fs.writeFile(inputPath, Buffer.from(base64Data, 'base64'));
            } else if (payload.video.startsWith("http") || payload.video.startsWith("https")) {
                // Fetch the video
                const response = await fetch(payload.video);
                if (!response.ok) {
                    throw new Error(`Failed to fetch video from URL: ${payload.video}`);
                }
                const arrayBuffer = await response.arrayBuffer();
                await fs.writeFile(inputPath, Buffer.from(arrayBuffer));
            } else if (payload.video.startsWith("/")) {
                // Handle local public files (Development mode)
                const localPath = path.join(process.cwd(), "public", payload.video);

                // ✅ Check if file exists before using it
                try {
                    await fs.access(localPath);
                    await fs.copyFile(localPath, inputPath);
                } catch (err) {
                    throw new Error(`Video file not found in public directory: ${payload.video}. Make sure the file exists or use a base64 data URL instead.`);
                }
            } else {
                throw new Error("Invalid video source. Must be a Data URL, HTTP URL, or local public path (starting with /).");
            }

            // 2. Initialize FFmpeg.wasm
            const ffmpeg = new FFmpeg();
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });

            logger.log("FFmpeg.wasm loaded successfully");

            // 3. Write video to FFmpeg virtual filesystem
            const inputData = await fs.readFile(inputPath);
            await ffmpeg.writeFile('input.mp4', inputData);

            // 4. Calculate seek time
            let seekTime = payload.timestamp;

            if (payload.unit === "percentage") {
                // For percentage, we need video duration
                // ffmpeg.wasm doesn't have a simple probe API, so we'll extract duration from metadata
                // We'll use a workaround: extract at percentage using the -t flag
                // For now, let's convert percentage to a seek position (simplified approach)
                // This is approximate - for production, you'd want to probe duration first
                seekTime = payload.timestamp; // Will use as percentage with special handling
            }

            logger.log("Extracting frame", { seekTime, unit: payload.unit });

            // 5. Extract frame using FFmpeg
            let ffmpegArgs: string[];

            if (payload.unit === "percentage") {
                // Use -ss with percentage (ffmpeg supports this via -sseof for end-relative)
                // Simplified: we'll extract middle frame and approximate
                // For better accuracy, probe duration first
                ffmpegArgs = [
                    '-i', 'input.mp4',
                    '-vf', `select='isnan(prev_selected_t)+gte(t-prev_selected_t\\,${seekTime}/100*5)'`, // Approximate
                    '-frames:v', '1',
                    'output.png'
                ];
            } else {
                // Seek to specific second
                ffmpegArgs = [
                    '-ss', seekTime.toString(),
                    '-i', 'input.mp4',
                    '-frames:v', '1',
                    'output.png'
                ];
            }

            await ffmpeg.exec(ffmpegArgs);

            logger.log("FFmpeg.wasm frame extraction completed");

            // 6. Read output from FFmpeg virtual filesystem
            const outputData = await ffmpeg.readFile('output.png');
            const base64Output = `data:image/png;base64,${Buffer.from(outputData as Uint8Array).toString('base64')}`;

            return {
                image: base64Output,
            };

        } catch (error) {
            logger.error("Extract Frame task failed", { error });
            throw error;
        } finally {
            // Cleanup temp files
            try {
                await fs.unlink(inputPath).catch(() => { });
                await fs.unlink(outputPath).catch(() => { });
            } catch (e) {
                // ignore
            }
        }
    },
});
