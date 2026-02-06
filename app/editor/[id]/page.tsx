import { ReactFlowProvider } from "@xyflow/react";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import EditorClient from "./editor-client";

interface EditorPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
    const user = await currentUser();
    if (!user) {
        redirect("/sign-in");
    }

    const { id } = await params;

    const workflow = await prisma.workflow.findFirst({
        where: {
            id,
            userId: user.id
        }
    });

    if (!workflow) {
        return <div className="text-white p-8">Workflow not found or access denied.</div>;
    }

    return (
        <ReactFlowProvider>
            <EditorClient
                initialNodes={workflow.nodes as any || []}
                initialEdges={workflow.edges as any || []}
                workflowId={workflow.id}
            />
        </ReactFlowProvider>
    );
}
