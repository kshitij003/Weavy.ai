import { task, logger } from "@trigger.dev/sdk/v3";
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Configure ffmpeg - we rely on the system ffmpeg installed via trigger.config.ts
// which puts binaries in the PATH. fluent-ffmpeg will find them automatically.

export const cropImage = task({
    id: "crop-image",
    maxDuration: 300,
    run: async (payload: { image: string; x: number; y: number; width: number; height: number }, { ctx }) => {
        logger.log("Starting Crop Image task (Native FFmpeg)", { payload });

        const { image, x, y, width, height } = payload;
        const tmpDir = os.tmpdir();
        const inputPath = path.join(tmpDir, `${uuidv4()}_input.png`);
        const outputPath = path.join(tmpDir, `${uuidv4()}_output.png`);

        try {
            // 1. Save input image
            if (image.startsWith('data:')) {
                const base64Data = image.split(',')[1];
                await fs.writeFile(inputPath, Buffer.from(base64Data, 'base64'));
            } else if (image.startsWith('http')) {
                const response = await fetch(image);
                const arrayBuffer = await response.arrayBuffer();
                await fs.writeFile(inputPath, Buffer.from(arrayBuffer));
            } else {
                // Assume local path if not http/data
                if (image.startsWith('/') || image.match(/^[a-zA-Z]:\\/)) {
                    await fs.copyFile(image, inputPath);
                } else {
                    throw new Error('Invalid image format');
                }
            }

            // 2. Get dimensions
            const metadata = await new Promise<any>((resolve, reject) => {
                ffmpeg.ffprobe(inputPath, (err: any, data: any) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            });

            const stream = metadata.streams.find((s: any) => s.codec_type === 'video' || s.codec_type === 'audio' ? false : true) || metadata.streams[0];
            const imgWidth = stream?.width || 0;
            const imgHeight = stream?.height || 0;

            if (!imgWidth || !imgHeight) throw new Error("Could not determine image dimensions");

            // 3. Calculate crop
            const cropX = Math.floor((x / 100) * imgWidth);
            const cropY = Math.floor((y / 100) * imgHeight);
            const cropW = Math.floor((width / 100) * imgWidth);
            const cropH = Math.floor((height / 100) * imgHeight);

            // 4. Run FFmpeg
            await new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .videoFilters(`crop=${cropW}:${cropH}:${cropX}:${cropY}`)
                    .output(outputPath)
                    .on('end', resolve)
                    .on('error', reject)
                    .run();
            });

            // 5. Read output
            const outputBuffer = await fs.readFile(outputPath);
            const base64Output = `data:image/png;base64,${outputBuffer.toString('base64')}`;

            return {
                image: base64Output,
            };

        } catch (error: any) {
            logger.error("Crop task failed", { error: error.message });
            throw error;
        } finally {
            await fs.unlink(inputPath).catch(() => { });
            await fs.unlink(outputPath).catch(() => { });
        }
    },
});
