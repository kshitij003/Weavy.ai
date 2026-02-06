"use server";

import { tasks, runs } from "@trigger.dev/sdk/v3";
import type { cropImage } from "@/trigger/crop-image";

export async function runCropImage(payload: {
    image: string;
    x: number;
    y: number;
    width: number;
    height: number;
}, wait: boolean = true) {
    try {
        const handle = await tasks.trigger<typeof cropImage>("crop-image", payload);

        if (!wait) {
            return { success: true, handleId: handle.id, status: "QUEUED" };
        }

        // Manual Polling
        let run = await runs.retrieve(handle.id);

        while (
            run.status === "QUEUED" ||
            run.status === "EXECUTING" ||
            run.status === "DEQUEUED"
        ) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            run = await runs.retrieve(handle.id);
        }

        if (run.status === "COMPLETED") {
            return { success: true, output: run.output.image };
        } else {
            return { success: false, error: `Task failed with status: ${run.status}` };
        }
    } catch (error: any) {
        console.error("Failed to trigger Crop execution:", error);
        return { success: false, error: error.message || "Failed to trigger execution" };
    }
}
