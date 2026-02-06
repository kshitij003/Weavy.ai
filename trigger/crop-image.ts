import { task, logger } from "@trigger.dev/sdk/v3";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";

export const cropImage = task({
    id: "crop-image",
    maxDuration: 300,
    run: async (payload: { image: string; x: number; y: number; width: number; height: number }, { ctx }) => {
        logger.log("Starting Crop Image task (ffmpeg.wasm)", { payload });

        const tmpDir = os.tmpdir();
        const inputPath = path.join(tmpDir, `${uuidv4()}_input.png`);
        const outputPath = path.join(tmpDir, `${uuidv4()}_output.png`);

        try {
            // 1. Parse and Save Input Image
            // RE-WRITE: Consolidated logic
            if (payload.image.startsWith("data:")) {
                // Handle base64 data URLs
                const base64Data = payload.image.split(",")[1];
                await fs.writeFile(inputPath, Buffer.from(base64Data, 'base64'));
            } else if (payload.image.startsWith("/")) {
                // Handle local public files (Development mode)
                const localPath = path.join(process.cwd(), "public", payload.image);

                // ✅ Check if file exists before attempting to copy
                try {
                    await fs.access(localPath);
                    await fs.copyFile(localPath, inputPath);
                } catch (err) {
                    throw new Error(`File not found in public directory: ${payload.image}. Make sure the file exists or use a base64 data URL instead.`);
                }
            } else if (payload.image.startsWith("http") || payload.image.startsWith("https")) {
                // Handle HTTP(S) URLs - fetch and save
                const response = await fetch(payload.image);
                if (!response.ok) {
                    throw new Error(`Failed to fetch image from URL: ${payload.image}`);
                }
                const arrayBuffer = await response.arrayBuffer();
                await fs.writeFile(inputPath, Buffer.from(arrayBuffer));
            } else {
                // Fallback: Try treating as raw base64 (without data: prefix)
                try {
                    const base64Data = payload.image.includes(",") ? payload.image.split(",")[1] : payload.image;
                    await fs.writeFile(inputPath, Buffer.from(base64Data, 'base64'));
                } catch (e) {
                    throw new Error(`Invalid image format. Expected data URL, HTTP URL, local path (starting with /), or base64 string. Received: ${payload.image.substring(0, 50)}...`);
                }
            }

            // 2. Initialize FFmpeg.wasm
            const ffmpeg = new FFmpeg();
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });

            logger.log("FFmpeg.wasm loaded successfully");

            // 3. Read input file and write to FFmpeg virtual filesystem
            const inputData = await fs.readFile(inputPath);
            await ffmpeg.writeFile('input.png', inputData);

            // 4. Calculate Crop Parameters (as percentages to pixels)
            // For simplicity with ffmpeg.wasm, we'll use the scale filter
            // First get dimensions - we'll assume standard dimensions or use a probe
            // For now, let's use the percentage directly in the crop filter

            const xPx = payload.x;
            const yPx = payload.y;
            const wPx = payload.width;
            const hPx = payload.height;

            logger.log("Crop params (percentages)", { xPx, yPx, wPx, hPx });

            // 5. Run FFmpeg crop command
            // crop filter syntax: crop=w:h:x:y (all in pixels or use iw/ih for input width/height)
            const cropFilter = `crop=iw*${wPx / 100}:ih*${hPx / 100}:iw*${xPx / 100}:ih*${yPx / 100}`;

            await ffmpeg.exec(['-i', 'input.png', '-vf', cropFilter, 'output.png']);

            logger.log("FFmpeg.wasm crop completed");

            // 6. Read output from FFmpeg virtual filesystem
            const outputData = await ffmpeg.readFile('output.png');
            const base64Output = `data:image/png;base64,${Buffer.from(outputData as Uint8Array).toString('base64')}`;

            return {
                image: base64Output,
            };

        } catch (error) {
            logger.error("FFmpeg.wasm Crop task failed", { error });
            throw error;
        } finally {
            // Cleanup
            try {
                await fs.unlink(inputPath).catch(() => { });
                await fs.unlink(outputPath).catch(() => { });
            } catch (e) {
                // ignore cleanup errors
            }
        }
    },
});
