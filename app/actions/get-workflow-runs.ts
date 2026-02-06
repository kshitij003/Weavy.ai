"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getWorkflowRuns(userId: string) {
    // Verify auth
    const user = await auth();

    if (!user.userId || user.userId !== userId) {
        // Allow if user matches?
        if (!user.userId) return [];
        // If requesting different user, deny?
        if (user.userId !== userId) {
            console.error("Unauthorized history access attempt");
            return [];
        }
    }

    try {
        const runs = await db.workflowRun.findMany({
            where: { userId },
            include: { steps: true },
            orderBy: { startedAt: 'desc' },
            take: 50 // Limit to last 50 runs
        });

        return runs;
    } catch (error) {
        console.error("Failed to fetch workflow runs:", error);
        return [];
    }
}
