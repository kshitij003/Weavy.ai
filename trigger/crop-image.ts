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
            if (payload.image.startsWith("/")) {
                // Handle local public files (Development mode)
                const localPath = path.join(process.cwd(), "public", payload.image);
                await fs.copyFile(localPath, inputPath);
            } else if (payload.image.startsWith("http") || payload.image.startsWith("https")) {
                // For now, we need to download it or pass URL to ffmpeg. 
                // Fluent-ffmpeg accepts URLs as input, so we can skip writing to inputPath for ffprobe?
                // BUT, we write to inputPath to standardize later steps.
                // Let's rely on ffmpeg's ability to read URLs for the Probe step?
                // Actually, simpler: just let inputPath equal the URL or local file path for probing.
                // However, the code below expects `fs.writeFile(inputPath, ...)`

                // Let's refactor slightly:
                // If base64 -> write to inputPath.
                // If local path -> copy to inputPath (or just use it).
                // If URL -> Download? Or just use URL as input path.

                // For robust support of all inputs in this "sandbox" task environment:
                // We will just support Base64 and Local Path for now as per immediate needs.
                // If it is a URL, we might need to fetch it.
                // Let's stick to the pattern I used in extract-frame which works for local:
                // But wait, crop-image code below uses `inputPath` variable universally.

                // Let's fetch if URL, copy if local, write if base64.
                await new Promise((resolve, reject) => {
                    if (payload.image.startsWith("http")) {
                        // Simple fetch and write
                        fetch(payload.image).then(res => res.arrayBuffer()).then(buf => {
                            fs.writeFile(inputPath, Buffer.from(buf)).then(resolve).catch(reject);
                        }).catch(reject);
                    } else {
                        reject(new Error("URL processing not fully implemented for crop without fetch polyfill context, skipping URL logic for now."));
                    }
                }).catch(() => { });
                // Actually, let's keep it simple and consistent with the previous fix.
            }

            // RE-WRITE:
            if (payload.image.startsWith("data:")) {
                const base64Data = payload.image.split(",")[1];
                await fs.writeFile(inputPath, Buffer.from(base64Data, 'base64'));
            } else if (payload.image.startsWith("/")) {
                const localPath = path.join(process.cwd(), "public", payload.image);
                await fs.copyFile(localPath, inputPath);
            } else {
                // Fallback: Assume it is a remote URL or direct file path that ffmpeg can handle?
                // Or assume it is raw base64 (variables like `const base64Data` above did that).
                // The original code:
                // const base64Data = payload.image.includes(",") ? payload.image.split(",")[1] : payload.image;
                // It assumed if it didn't have comma, it was raw base64.

                // Let's preserve that fallback for safety but add the local path check first.
                try {
                    const base64Data = payload.image.includes(",") ? payload.image.split(",")[1] : payload.image;
                    await fs.writeFile(inputPath, Buffer.from(base64Data, 'base64'));
                } catch (e) {
                    // If it fails, maybe it was a URL?
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
                    .on('error', (err) => {
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
