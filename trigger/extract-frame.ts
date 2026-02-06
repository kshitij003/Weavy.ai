import { task, logger } from "@trigger.dev/sdk/v3";
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Configure ffmpeg - we rely on the system ffmpeg installed via trigger.config.ts
// or local ffmpeg if available in PATH.

export const extractFrame = task({
    id: "extract-frame",
    maxDuration: 300,
    run: async (payload: { video: string; timestamp: number; unit: "seconds" | "percentage" }, { ctx }) => {
        logger.log("Starting Extract Frame task (Native FFmpeg)", { payload });

        const { video, timestamp, unit } = payload;
        const tmpDir = os.tmpdir();
        const inputPath = path.join(tmpDir, `${uuidv4()}_input.mp4`);
        const outputPath = path.join(tmpDir, `${uuidv4()}_output.png`);

        try {
            // 1. Save input video
            if (video.startsWith('data:')) {
                const base64Data = video.split(',')[1];
                await fs.writeFile(inputPath, Buffer.from(base64Data, 'base64'));
            } else if (video.startsWith('http')) {
                const response = await fetch(video);
                const arrayBuffer = await response.arrayBuffer();
                await fs.writeFile(inputPath, Buffer.from(arrayBuffer));
            } else {
                // Assume local
                if (video.startsWith('/') || video.match(/^[a-zA-Z]:\\/)) {
                    await fs.copyFile(video, inputPath);
                } else {
                    throw new Error('Invalid video format');
                }
            }

            // 2. Get duration if needed
            let seekTime = timestamp;
            if (unit === 'percentage') {
                const metadata = await new Promise<any>((resolve, reject) => {
                    ffmpeg.ffprobe(inputPath, (err: any, data: any) => {
                        if (err) reject(err);
                        else resolve(data);
                    });
                });

                const duration = metadata.format.duration;
                if (!duration) throw new Error("Could not determine video duration");
                seekTime = (timestamp / 100) * duration;
            }

            // 3. Extract frame
            await new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .seekInput(seekTime)
                    .frames(1)
                    .output(outputPath)
                    .on('end', resolve)
                    .on('error', reject)
                    .run();
            });

            // 4. Read output
            const outputBuffer = await fs.readFile(outputPath);
            const base64Output = `data:image/png;base64,${outputBuffer.toString('base64')}`;

            return {
                image: base64Output,
            };

        } catch (error: any) {
            logger.error("Extract Frame task failed", { error: error.message });
            throw error;
        } finally {
            await fs.unlink(inputPath).catch(() => { });
            await fs.unlink(outputPath).catch(() => { });
        }
    },
});
