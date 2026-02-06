import { task, logger } from "@trigger.dev/sdk/v3";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
// Note: Using ffprobe bundled with ffmpeg package
ffmpeg.setFfprobePath(ffmpegInstaller.path.replace('ffmpeg', 'ffprobe'));

export const cropImage = task({
    id: "crop-image",
    maxDuration: 300,
    run: async (payload: { image: string; x: number; y: number; width: number; height: number }, { ctx }) => {
        logger.log("Starting Crop Image task (FFmpeg)", { payload });

        const tmpDir = os.tmpdir();
        // ffmpeg on windows can be picky about paths.
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

            // 2. Get Image Metadata (Dimensions)
            const dimensions = await new Promise<{ width: number, height: number }>((resolve, reject) => {
                ffmpeg.ffprobe(inputPath, (err: any, metadata: any) => {
                    if (err) reject(err);
                    else {
                        const stream = metadata.streams.find((s: any) => s.width && s.height);
                        if (stream && stream.width && stream.height) {
                            resolve({ width: stream.width, height: stream.height });
                        } else {
                            reject(new Error("Could not determine dimensions"));
                        }
                    }
                });
            });

            const { width: imgW, height: imgH } = dimensions;

            // Calculate Crop Parameters
            const xPx = Math.round((payload.x / 100) * imgW);
            const yPx = Math.round((payload.y / 100) * imgH);
            const wPx = Math.round((payload.width / 100) * imgW);
            const hPx = Math.round((payload.height / 100) * imgH);

            // Validate
            const finalX = Math.max(0, xPx);
            const finalY = Math.max(0, yPx);
            const finalW = Math.min(wPx, imgW - finalX);
            const finalH = Math.min(hPx, imgH - finalY);

            logger.log("FFmpeg Crop Params", { finalW, finalH, finalX, finalY });

            // 3. Run FFmpeg Crop
            await new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .outputOptions([
                        `-vf crop=${finalW}:${finalH}:${finalX}:${finalY}`
                    ])
                    .on('end', resolve)
                    .on('error', (err: any) => {
                        logger.error("FFmpeg error", { err });
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
            logger.error("FFmpeg Crop task failed", { error });
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
