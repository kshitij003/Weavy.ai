import { task, logger } from "@trigger.dev/sdk/v3";

export const extractFrame = task({
    id: "extract-frame",
    maxDuration: 300,
    run: async (payload: { video: string; timestamp: number; unit: "seconds" | "percentage" }, { ctx }) => {
        logger.log("Starting Extract Frame task (External Worker)", { payload });

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
                const errorText = await response.text();
                throw new Error(`Worker failed: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            return {
                image: data.image, // Expecting base64 data URI
            };

        } catch (error: any) {
            logger.error("Extract Frame task failed", { error: error.message });
            throw error;
        }
    },
});
