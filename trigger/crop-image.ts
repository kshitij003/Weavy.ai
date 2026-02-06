import { task, logger } from "@trigger.dev/sdk/v3";

export const cropImage = task({
    id: "crop-image",
    maxDuration: 300,
    run: async (payload: { image: string; x: number; y: number; width: number; height: number }, { ctx }) => {
        logger.log("Starting Crop Image task (External Worker)", { payload });

        // Use environment variable for the worker URL, default to localhost for dev
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
                const errorText = await response.text();
                throw new Error(`Worker failed: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            return {
                image: data.image, // Expecting base64 data URI
            };

        } catch (error: any) {
            logger.error("Crop task failed", { error: error.message });
            throw error;
        }
    },
});
