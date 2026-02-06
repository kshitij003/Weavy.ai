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

            // 4. Calculate seek time - extract duration if needed
            let seekTime = payload.timestamp;

            if (payload.unit === "percentage") {
                // Extract duration using ffmpeg.wasm logging
                logger.log("Extracting video duration for percentage calculation");

                const logs: string[] = [];
                ffmpeg.on("log", ({ message }: { message: string }) => {
                    logs.push(message);
                });

                // Run ffmpeg -i to get metadata (will "fail" but output metadata to logs)
                try {
                    await ffmpeg.exec(['-i', 'input.mp4']);
                } catch (e) {
                    // Expected to "fail" - we just need the logs
                }

                // Parse duration from logs
                const metaLog = logs.join("\n");
                const durationMatch = metaLog.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);

                if (!durationMatch) {
                    throw new Error("Could not extract video duration from metadata");
                }

                const [, hours, minutes, seconds] = durationMatch;
                const durationInSeconds =
                    Number(hours) * 3600 +
                    Number(minutes) * 60 +
                    Number(seconds);

                seekTime = (payload.timestamp / 100) * durationInSeconds;
                logger.log("Calculated seek time from percentage", {
                    percentage: payload.timestamp,
                    duration: durationInSeconds,
                    seekTime
                });
            }

            logger.log("Extracting frame", { seekTime, unit: payload.unit });

            // 5. Extract frame using FFmpeg
            await ffmpeg.exec([
                '-ss', seekTime.toString(),
                '-i', 'input.mp4',
                '-frames:v', '1',
                'output.png'
            ]);

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
