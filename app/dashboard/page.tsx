import { FileGrid } from "@/components/dashboard/FileGrid";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { DEMO_WORKFLOW } from "@/lib/demo-workflow";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const user = await currentUser();
    if (!user) {
        redirect("/sign-in");
    }

    const firstName = user?.firstName || "Creator";

    // 1. Check if user exists or just use userId
    // 2. Check if user has the demo workflow
    const existingDemo = await prisma.workflow.findFirst({
        where: {
            userId: user.id,
            name: DEMO_WORKFLOW.name,
        },
    });

    if (!existingDemo) {
        console.log("Seeding demo workflow for user", user.id);
        await prisma.workflow.create({
            data: {
                userId: user.id,
                name: DEMO_WORKFLOW.name,
                description: DEMO_WORKFLOW.description,
                thumbnailUrl: DEMO_WORKFLOW.thumbnailUrl,
                nodes: DEMO_WORKFLOW.nodes as any, // Json type casting
                edges: DEMO_WORKFLOW.edges as any,
            },
        });
    } else {
        // ALWAYS update the demo workflow to match code (Development friendly)
        // console.log("Syncing demo workflow for user", user.id);
        await prisma.workflow.update({
            where: { id: existingDemo.id },
            data: {
                description: DEMO_WORKFLOW.description,
                thumbnailUrl: DEMO_WORKFLOW.thumbnailUrl, // Ensure thumbnail updates
                nodes: DEMO_WORKFLOW.nodes as any,
                edges: DEMO_WORKFLOW.edges as any,
            }
        });
    }

    // 3. Fetch all workflows for the user
    const workflows = await prisma.workflow.findMany({
        where: {
            userId: user.id,
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    return (
        <div className="flex flex-col h-full bg-black">
            <div className="flex-1 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2 mb-8">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back, {firstName}</h2>
                </div>

                <h3 className="text-xl font-semibold text-white mb-4">Your Workflows</h3>
                <FileGrid workflows={workflows} />
            </div>
        </div>
    );
}
