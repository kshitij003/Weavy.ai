import { task, logger } from "@trigger.dev/sdk/v3";

export const extractFrame = task({
    id: "extract-frame",
    maxDuration: 300,
    run: async (payload: { video: string; timestamp: number; unit: "seconds" | "percentage" }, { ctx }) => {
        logger.log("Starting Extract Frame task (External FFmpeg Worker)", { payload });

        const workerUrl = process.env.FFMPEG_WORKER_URL || "http://localhost:3000";

        try {
            const response = await fetch(`${workerUrl}/frame`, {
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
            logger.log("Frame extraction completed successfully");

            return {
                image: result.image,
            };

        } catch (error) {
            logger.error("Extract Frame task failed", { error });
            throw error;
        }
    },
});
