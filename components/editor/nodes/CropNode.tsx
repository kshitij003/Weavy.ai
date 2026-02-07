"use client";

import React, { memo, useState, useMemo, useEffect } from "react";
import { Handle, Position, NodeProps, useReactFlow, useEdges } from "@xyflow/react";
import { Crop, Play, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { runCropImage } from "@/app/actions/run-crop";
import { saveWorkflowRun } from "@/app/actions/save-workflow-run";
import { useExecutionStore } from "@/app/editor/execution-store";
import { useAuth } from "@clerk/nextjs";

interface InputFieldProps {
    label: string;
    handleId: string;
    value: number;
    onChange: (v: number) => void;
    isConnected: boolean;
}

function InputField({ label, handleId, value, onChange, isConnected }: InputFieldProps) {
    return (
        <div className="space-y-1 relative group">
            <div className="flex items-center justify-between">
                <label className={cn("text-[10px] font-medium", isConnected ? "text-[#E8FF86]" : "text-gray-500")}>
                    {label}
                </label>
                {isConnected && <LinkIcon size={10} className="text-[#E8FF86]" />}
            </div>

            <div className="relative">
                <Handle
                    type="target"
                    position={Position.Left}
                    id={handleId}
                    className={cn(
                        "!w-3 !h-3 !-left-[22px] !top-1/2 !-translate-y-1/2 z-50",
                        isConnected ? "!bg-[#E8FF86] !border-[#E8FF86]" : "!bg-[#a1a1aa]"
                    )}
                />

                <input
                    type="number"
                    value={value}
                    disabled={isConnected}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className={cn(
                        "w-full bg-[#1F1F21] border rounded px-2 py-1 text-xs text-white outline-none",
                        isConnected
                            ? "border-[#E8FF86]/30 opacity-40 bg-black/50 cursor-not-allowed"
                            : "border-[#2A2A2D] focus:border-[#E8FF86]"
                    )}
                />
            </div>
        </div>
    );
}

export function CropNode({ id, data }: NodeProps) {
    const { userId } = useAuth();
    const { updateNodeData, getNode } = useReactFlow();
    const edges = useEdges();
    const [isLoading, setIsLoading] = useState(false);
    const executionStatus = useExecutionStore((state) => state.nodeStatuses[id]);
    const isRunning = executionStatus === "running";

    const [params, setParams] = useState({
        x: Number(data.x ?? 0),
        y: Number(data.y ?? 0),
        width: Number(data.width ?? 100),
        height: Number(data.height ?? 100),
    });

    useEffect(() => {
        updateNodeData(id, params);
    }, [params, id, updateNodeData]);

    const connections = useMemo(() => {
        const targetEdges = edges.filter((e) => e.target === id);
        return {
            image: targetEdges.some((e) => e.targetHandle === "image_url"),
            x: targetEdges.some((e) => e.targetHandle === "x_percent"),
            y: targetEdges.some((e) => e.targetHandle === "y_percent"),
            width: targetEdges.some((e) => e.targetHandle === "width_percent"),
            height: targetEdges.some((e) => e.targetHandle === "height_percent"),
            all: targetEdges,
        };
    }, [edges, id]);

    const handleStart = async () => {
        setIsLoading(true);
        updateNodeData(id, { output: "Processing..." });
        const startTime = Date.now();

        let finalOutput = "";
        let errorMsg: string | undefined;
        let inputs: Record<string, unknown> = {};

        try {
            const getValue = (handleId: string, fallback: number): number => {
                const edge = connections.all.find((e) => e.targetHandle === handleId);
                if (!edge) return fallback;
                const src = getNode(edge.source);
                const val = Number(src?.data?.output ?? src?.data?.text);
                return isNaN(val) ? fallback : val;
            };

            const imageEdge = connections.all.find((e) => e.targetHandle === "image_url");
            const imageNode = imageEdge ? getNode(imageEdge.source) : null;

            const image =
                typeof imageNode?.data?.image === "string"
                    ? imageNode.data.image
                    : typeof imageNode?.data?.output === "string"
                        ? imageNode.data.output
                        : null;

            const x = getValue("x_percent", params.x);
            const y = getValue("y_percent", params.y);
            const width = getValue("width_percent", params.width);
            const height = getValue("height_percent", params.height);

            inputs = { x, y, width, height, image: image ? "Image Data" : "None" };

            if (!image) {
                updateNodeData(id, { output: "❌ No image connected." });
                setIsLoading(false);
                return;
            }

            // 1. Trigger Task (Async)
            const result = await runCropImage({
                image,
                x,
                y,
                width,
                height,
            }, false); // wait = false

            if (!result.success || !result.handleId) {
                throw new Error(result.error || "Failed to start task");
            }

            const handleId = result.handleId;
            updateNodeData(id, { output: "Task Started... Waiting for completion..." });

            // 2. Poll for Completion
            const { checkTaskStatus } = await import("@/app/actions/check-task-status");

            let status = "RUNNING";
            let pollResult: any = null;

            while (status === "RUNNING" || status === "QUEUED" || status === "EXECUTING" || status === "WAITING_FOR_DEPLOY") {
                await new Promise(r => setTimeout(r, 1000));
                pollResult = await checkTaskStatus(handleId);
                status = pollResult.status;
            }

            if (status === "COMPLETED") {
                finalOutput = pollResult.output;
                updateNodeData(id, { output: finalOutput });
            } else {
                errorMsg = pollResult.error || "Task failed";
                finalOutput = `Error: ${errorMsg}`;
                updateNodeData(id, { output: finalOutput });
            }

        } catch (err: any) {
            console.error(err);
            errorMsg = err.message || "Unexpected error occurred.";
            finalOutput = errorMsg;
            updateNodeData(id, { output: finalOutput });
        } finally {
            setIsLoading(false);
            const endTime = Date.now();

            if (userId) {
                await saveWorkflowRun({
                    userId,
                    triggerType: "SINGLE",
                    status: errorMsg ? "FAILED" : "COMPLETED",
                    startedAt: new Date(startTime),
                    endedAt: new Date(endTime),
                    duration: endTime - startTime,
                    steps: [
                        {
                            nodeId: id,
                            nodeType: "crop",
                            nodeLabel: (data.label as string) || "Crop Node",
                            status: errorMsg ? "FAILED" : "COMPLETED",
                            startedAt: new Date(startTime),
                            endedAt: new Date(endTime),
                            duration: endTime - startTime,
                            inputs,
                            outputs: finalOutput,
                            error: errorMsg,
                        },
                    ],
                });
            }
        }
    };

    return (
        <div
            className={cn(
                "rounded-lg border border-[#1F1F21] bg-[#09090A] p-0 shadow-xl w-64 flex flex-col transition-all",
                isRunning && "neon-border"
            )}
        >
            <div className="w-full h-full rounded-lg flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-2 bg-[#1F1F21] px-3 py-2 border-b border-[#2A2A2D]">
                    <Crop size={14} className="text-[#E8FF86]" />
                    <span className="text-xs font-semibold text-gray-300">Crop Image</span>
                    {isRunning && (
                        <span className="text-[10px] text-[#E8FF86] animate-pulse ml-2 font-mono">
                            [RUNNING]
                        </span>
                    )}
                </div>

                <div className="p-3 relative">
                    {/* Image Input */}
                    <div className="relative mb-4 group">
                        <div className="flex items-center gap-2 mb-1 justify-between">
                            <span
                                className={cn("text-[10px] font-medium", connections.image ? "text-[#E8FF86]" : "text-gray-500")}
                            >
                                Image Input
                            </span>
                            {connections.image && <LinkIcon size={10} className="text-[#E8FF86]" />}
                        </div>
                        <div className="h-0 w-0 relative">
                            <Handle
                                type="target"
                                position={Position.Left}
                                id="image_url"
                                className={cn(
                                    "!w-3 !h-3 !-left-[22px] !top-1/2 !-translate-y-1/2 z-50",
                                    connections.image ? "!bg-[#E8FF86]" : "!bg-[#a1a1aa]"
                                )}
                            />
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="flex flex-col space-y-3 mb-4">
                        <InputField
                            label="X (%)"
                            handleId="x_percent"
                            value={params.x}
                            onChange={(v) => setParams((p) => ({ ...p, x: v }))}
                            isConnected={connections.x}
                        />
                        <InputField
                            label="Y (%)"
                            handleId="y_percent"
                            value={params.y}
                            onChange={(v) => setParams((p) => ({ ...p, y: v }))}
                            isConnected={connections.y}
                        />
                        <InputField
                            label="Width (%)"
                            handleId="width_percent"
                            value={params.width}
                            onChange={(v) => setParams((p) => ({ ...p, width: v }))}
                            isConnected={connections.width}
                        />
                        <InputField
                            label="Height (%)"
                            handleId="height_percent"
                            value={params.height}
                            onChange={(v) => setParams((p) => ({ ...p, height: v }))}
                            isConnected={connections.height}
                        />
                    </div>

                    {/* Output */}
                    {typeof data.output === "string" && data.output.startsWith("data:image") ? (
                        <div className="mb-3 rounded overflow-hidden border border-[#2A2A2D]">
                            <img
                                src={data.output}
                                alt="Cropped"
                                className="w-full h-auto max-h-32 object-contain bg-black"
                            />
                        </div>
                    ) : (
                        // FIX: Converted 'unknown' to boolean using !!
                        !!data.output && (
                            <div className="mb-3 p-2 bg-[#1F1F21] rounded text-[10px] text-gray-400 whitespace-pre-wrap">
                                {String(data.output)}
                            </div>
                        )
                    )}

                    {/* Actions */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleStart}
                            disabled={isLoading}
                            className={cn(
                                "flex items-center gap-1.5 bg-[#E8FF86] text-black text-[10px] font-bold px-3 py-1.5 rounded",
                                isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#d6f060]"
                            )}
                        >
                            {isLoading ? (
                                <div className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                            ) : (
                                <Play size={10} fill="currentColor" />
                            )}
                            {isLoading ? "CROPPING..." : "START"}
                        </button>
                    </div>
                </div>

                <Handle type="source" position={Position.Right} id="output" className="!bg-[#E8FF86] !w-3 !h-3" />
            </div>
        </div>
    );
}

export default memo(CropNode);