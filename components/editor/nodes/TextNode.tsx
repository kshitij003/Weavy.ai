"use client";

import { memo } from "react";
import { Handle, Position, NodeProps, useReactFlow } from "@xyflow/react";

export function TextNode({ id, data }: NodeProps) {
    const { updateNodeData } = useReactFlow();

    return (
        <div className="rounded-lg border border-[#1F1F21] bg-[#09090A] p-4 shadow-xl w-64">
            <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Prompt</span>
                {/* Placeholder for menu dots */}
                <div className="h-1 w-4 rounded-full bg-gray-700" />
            </div>
            <textarea
                className="h-32 w-full resize-none rounded-md bg-[#1F1F21] p-3 text-sm text-white outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-[#E8FF86]"
                placeholder="Enter your prompt here..."
                defaultValue={data.text as string || ""}
                onChange={(e) => updateNodeData(id, { text: e.target.value })}
            />
            <Handle type="source" position={Position.Right} id="output" className="!bg-[#a1a1aa] !w-3 !h-3" />
        </div>
    );
}

export default memo(TextNode);
