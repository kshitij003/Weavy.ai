"use client";

import { MoreVertical, FileCode } from "lucide-react";
import Link from "next/link";
// import { cn } from "@/lib/utils";

interface Workflow {
    id: string;
    name: string;
    description: string | null;
    thumbnailUrl: string | null;
    updatedAt: Date;
}

interface FileGridProps {
    workflows: Workflow[];
}

export function FileGrid({ workflows }: FileGridProps) {
    if (workflows.length === 0) {
        return <div className="text-gray-500">No workflows found.</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {workflows.map((workflow) => (
                <Link href={`/editor/${workflow.id}`} key={workflow.id} className="block">
                    <div className="group cursor-pointer rounded-xl bg-[#1F1F21] p-3 transition-all hover:bg-[#2A2A2D] hover:scale-[1.02] border border-transparent hover:border-[#E8FF86]/20">
                        <div className="aspect-[16/9] w-full rounded-lg bg-[#0F0F10] border border-[#2A2A2D] flex items-center justify-center mb-3 group-hover:border-[#E8FF86]/30 transition-colors overflow-hidden relative">
                            {workflow.thumbnailUrl ? (
                                <img
                                    src={workflow.thumbnailUrl}
                                    alt={workflow.name}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                            ) : (
                                <FileCode className="w-12 h-12 text-gray-700 group-hover:text-[#E8FF86]" />
                            )}
                        </div>
                        <div className="flex items-start justify-between px-1">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-white group-hover:text-[#E8FF86] transition-colors truncate">
                                    {workflow.name}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                    {workflow.updatedAt.toLocaleDateString()}
                                </p>
                            </div>
                            <button className="text-gray-500 hover:text-white p-1 rounded hover:bg-white/10" onClick={(e) => {
                                e.preventDefault();
                                // Future: Open menu
                            }}>
                                <MoreVertical size={16} />
                            </button>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
