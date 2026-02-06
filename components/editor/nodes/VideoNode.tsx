"use client";

import { memo, useState } from "react";
import { Handle, Position, NodeProps, useReactFlow } from "@xyflow/react";
import { Upload, Video as VideoIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { useExecutionStore } from "@/app/editor/execution-store";

export function VideoNode({ id, data }: NodeProps) {
    const { updateNodeData } = useReactFlow();
    const [preview, setPreview] = useState<string | null>(data.video as string || null);
    const executionStatus = useExecutionStore(state => state.nodeStatuses[id]);
    const isRunning = executionStatus === 'running' || executionStatus === 'completed'; // Highlight on done too? Or just neon when running.
    // User requested "when execution completes the neon effect moves to other node". So ONLY RUNNING.
    const isHighlight = executionStatus === 'running';
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreview(result);
                updateNodeData(id, { video: result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={cn(
            "rounded-lg border border-[#1F1F21] bg-[#09090A] p-3 shadow-xl w-64",
            isHighlight && "neon-border"
        )}>
            {/* <Handle type="target" position={Position.Left} className="!bg-[#a1a1aa] !w-3 !h-3" /> */}
            <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Video Input</span>
                <div className="h-1 w-4 rounded-full bg-gray-700" />
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-md bg-[#1F1F21] border border-dashed border-gray-700 transition-colors hover:border-[#E8FF86]/50">
                {preview ? (
                    <video src={preview} controls className="h-full w-full object-cover" />
                ) : (
                    <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-gray-500 hover:text-white">
                        <Upload size={24} />
                        <span className="text-xs">Click to Upload Video</span>
                        <input
                            type="file"
                            accept="video/mp4,video/quicktime,video/webm"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>
                )}
            </div>
            <Handle type="source" position={Position.Right} id="output" className="!bg-[#E8FF86] !w-3 !h-3" />
        </div>
    );
}

export default memo(VideoNode);
