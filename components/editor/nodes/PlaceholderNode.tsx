"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Box } from "lucide-react";

export function PlaceholderNode({ data }: NodeProps) {
    return (
        <div className="rounded-lg border border-[#1F1F21] bg-[#09090A] p-4 shadow-xl w-64 flex flex-col items-center justify-center gap-2 min-h-[150px]">
            <Handle type="target" position={Position.Left} className="!bg-[#a1a1aa] !w-3 !h-3" />
            <Box className="text-gray-600" size={32} />
            <span className="text-sm text-gray-400">{data.label as string}</span>
            <p className="text-xs text-gray-600">Configuration pending</p>
            <Handle type="source" position={Position.Right} className="!bg-[#a1a1aa] !w-3 !h-3" />
        </div>
    );
}

export default memo(PlaceholderNode);
