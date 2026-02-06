"use server";

import { tasks, runs } from "@trigger.dev/sdk/v3";
import type { generateContent } from "@/trigger/generate-content";

export async function runLlmGeneration(payload: {
    systemPrompt?: string;
    userPrompt: string;
    image?: string;
}, wait: boolean = true) {
    try {
        const handle = await tasks.trigger<typeof generateContent>("generate-content", payload);

        if (!wait) {
            return { success: true, handleId: handle.id, status: "QUEUED" };
        }

        // Manual polling since triggerAndPoll might be unavailable
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
            return { success: true, output: run.output.text };
        } else {
            return { success: false, error: `Task failed with status: ${run.status}` };
        }
    } catch (error: any) {
        console.error("Failed to trigger LLM execution:", error);
        return { success: false, error: error.message || "Failed to trigger execution" };
    }
}
