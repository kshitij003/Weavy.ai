"use server";

import { db } from "@/lib/db";
import { WorkflowRunSchema } from "@/lib/schemas/workflow";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

export async function saveWorkflowRun(data: z.infer<typeof WorkflowRunSchema>) {
    console.log("Received workflow save request for user:", data.userId);

    // 1. Validate Input
    const validation = WorkflowRunSchema.safeParse(data);

    if (!validation.success) {
        console.error("Invalid workflow run data:", validation.error);
        return { success: false, error: "Invalid data" };
    }

    const { userId, steps, ...runData } = validation.data;

    // 2. Validate User Authentication
    // We expect userId to be passed, but we should verify it matches the authenticated user
    // to prevent spoofing, OR we just trust it if it's called from a trusted context.
    // Since this is a server action called by the client, we MUST verify auth.
    const user = await auth();

    if (!user.userId) {
        return { success: false, error: "Unauthorized" };
    }

    if (user.userId !== userId) {
        // Mismatch? For now, we arguably should reject. 
        // But if the client passed the wrong ID, we can just override it with the real one.
        console.warn(`User ID mismatch. Client: ${userId}, Server: ${user.userId}. Using Server ID.`);
    }

    try {
        console.log("Attempting to save workflow run to DB with steps:", steps.length);
        const run = await db.workflowRun.create({
            data: {
                ...runData,
                userId: user.userId, // Enforce server-side user ID
                steps: {
                    create: steps.map(step => ({
                        nodeId: step.nodeId,
                        nodeType: step.nodeType,
                        nodeLabel: step.nodeLabel,
                        status: step.status,
                        startedAt: step.startedAt,
                        endedAt: step.endedAt,
                        duration: step.duration,
                        inputs: step.inputs ?? undefined, // Handle nulls for Prisma Json
                        outputs: step.outputs ?? undefined,
                        error: step.error
                    }))
                }
            }
        });

        console.log("Successfully saved workflow run:", run.id);
        return { success: true, runId: run.id };
    } catch (error) {
        console.error("Failed to save workflow run:", error);
        return { success: false, error: "Database error" };
    }
}
