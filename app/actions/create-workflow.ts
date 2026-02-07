"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function createWorkflow() {
    const user = await currentUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const workflow = await prisma.workflow.create({
        data: {
            userId: user.id,
            name: "Untitled Workflow",
            nodes: [],
            edges: [],
        },
    });

    redirect(`/editor/${workflow.id}`);
}
