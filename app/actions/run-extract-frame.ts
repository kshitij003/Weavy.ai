"use server";

import { tasks, runs } from "@trigger.dev/sdk/v3";
import type { extractFrame } from "@/trigger/extract-frame";

export async function runExtractFrame(payload: {
    video: string;
    timestamp: number;
    unit: "seconds" | "percentage";
}, wait: boolean = true) {
    try {
        const handle = await tasks.trigger<typeof extractFrame>("extract-frame", payload);

        if (!wait) {
            return { success: true, handleId: handle.id, status: "QUEUED" };
        }

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
        console.error("Failed to trigger Extract Frame execution:", error);
        return { success: false, error: error.message || "Failed to trigger execution" };
    }
}
