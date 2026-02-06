"use server";

import { runs } from "@trigger.dev/sdk/v3";

export async function checkTaskStatus(handleId: string) {
    try {
        const run = await runs.retrieve(handleId);

        if (run.status === "COMPLETED") {
            return {
                status: "COMPLETED",
                output: run.output ? (run.output.image || run.output.text || run.output) : null
            };
        } else if (run.status === "FAILED" || run.status === "CANCELED" || run.status === "TIMED_OUT" || run.status === "CRASHED") {
            return { status: "FAILED", error: run.error?.message || `Task failed with status: ${run.status}` };
        } else {
            return { status: "RUNNING" }; // QUEUED, EXECUTING, DEQUEUED, WAITING_FOR_DEPLOY
        }

    } catch (error: any) {
        console.error("Failed to check task status:", error);
        return { status: "FAILED", error: error.message };
    }
}
