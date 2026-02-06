import { task, logger } from "@trigger.dev/sdk/v3";

export const cropImage = task({
    id: "crop-image",
    maxDuration: 300,
    run: async (payload: { image: string; x: number; y: number; width: number; height: number }, { ctx }) => {
        logger.log("Starting Crop Image task (External FFmpeg Worker)", { payload });

        const workerUrl = process.env.FFMPEG_WORKER_URL || "http://localhost:3000";

        try {
            const response = await fetch(`${workerUrl}/crop`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`FFmpeg worker failed: ${error.error || response.statusText}`);
            }

            const result = await response.json();
            logger.log("Crop completed successfully");

            return {
                image: result.image,
            };

        } catch (error) {
            logger.error("Crop task failed", { error });
            throw error;
        }
    },
});
