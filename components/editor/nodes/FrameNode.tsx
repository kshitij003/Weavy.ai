"use client";

import { memo, useState, useMemo } from "react";
import { Handle, Position, NodeProps, useReactFlow, useEdges } from "@xyflow/react";
import { Film, Play, Link as LinkIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { runExtractFrame } from "@/app/actions/run-extract-frame";
import { saveWorkflowRun } from "@/app/actions/save-workflow-run";
import { useExecutionStore } from "@/app/editor/execution-store";
import { useAuth } from "@clerk/nextjs";

export function FrameNode({ id, data }: NodeProps) {
    const { userId } = useAuth();
    const { updateNodeData, getNode } = useReactFlow();
    const edges = useEdges();
    const [isLoading, setIsLoading] = useState(false);
    const [unit, setUnit] = useState<"seconds" | "percentage">("seconds");
    const executionStatus = useExecutionStore(state => state.nodeStatuses[id]);
    const isRunning = executionStatus === 'running';

    // Local state for manual inputs
    const [params, setParams] = useState({
        timestamp: data.timestamp as number || 0,
        manualVideo: data.manualVideo as string || ""
    });

    const updateParams = (newParams: any) => {
        setParams(newParams);
        updateNodeData(id, { ...newParams });
    };

    // Valid connections check
    const connections = useMemo(() => {
        const targetEdges = edges.filter(e => e.target === id);
        return {
            video: targetEdges.some(e => e.targetHandle === "video_url"),
            timestamp: targetEdges.some(e => e.targetHandle === "timestamp"),
            all: targetEdges
        };
    }, [edges, id]);

    const handleStart = async () => {
        setIsLoading(true);
        updateNodeData(id, { output: "Processing..." });
        const startTime = Date.now();

        // Define variables outside try block for access in finally
        let finalOutput = "";
        let errorMsg: string | undefined = undefined;
        let inputs: any = {};

        try {
            // Helper to get value
            const getValue = (handleId: string, defaultValue: number): number => {
                const edge = connections.all.find(e => e.targetHandle === handleId);
                if (edge) {
                    const sourceNode = getNode(edge.source);
                    const val = parseFloat(sourceNode?.data?.text as string || sourceNode?.data?.output as string);
                    return isNaN(val) ? defaultValue : val;
                }
                return defaultValue;
            };

            // Get Video
            let video = params.manualVideo; // Default to manual
            const videoEdge = connections.all.find(e => e.targetHandle === "video_url");

            if (videoEdge) {
                const sourceNode = getNode(videoEdge.source);
                video = (sourceNode?.data?.video as string) || (sourceNode?.data?.output as string) || (sourceNode?.data?.text as string) || "";
            }

            const timestamp = getValue("timestamp", params.timestamp);

            inputs = { video: video ? "Video URL..." : "None", timestamp, unit: 'seconds' };

            if (!video) {
                updateNodeData(id, { output: "Error: No video connected or provided." });
                setIsLoading(false);
                return;
            }

            const result = await runExtractFrame({
                video,
                timestamp,
                unit: 'seconds'
            });

            if (result.success) {
                finalOutput = result.output;
                updateNodeData(id, { output: result.output });
            } else {
                errorMsg = result.error;
                finalOutput = `Error: ${result.error}`;
                updateNodeData(id, { output: finalOutput });
            }

        } catch (error: any) {
            console.error(error);
            errorMsg = error.message;
            finalOutput = "An unexpected error occurred.";
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
                    steps: [{
                        nodeId: id,
                        nodeType: "frame",
                        nodeLabel: data.label as string || "Frame Node",
                        status: errorMsg ? "FAILED" : "COMPLETED",
                        startedAt: new Date(startTime),
                        endedAt: new Date(endTime),
                        duration: endTime - startTime,
                        inputs: inputs,
                        outputs: finalOutput,
                        error: errorMsg
                    }]
                });
            }
        }
    };

    const InputField = ({ label, handleId, value, onChange, isConnected }: any) => (
        <div className="space-y-1 relative group">
            <div className="flex items-center justify-between">
                <label className={cn("text-[10px] font-medium transition-colors", isConnected ? "text-[#E8FF86]" : "text-gray-500")}>
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
                        "!w-3 !h-3 !-left-[22px] !top-1/2 !-translate-y-1/2 transition-colors z-50",
                        isConnected ? "!bg-[#E8FF86] !border-[#E8FF86]" : "!bg-[#a1a1aa]"
                    )}
                />
                <input
                    type="number"
                    value={value}
                    onChange={onChange}
                    disabled={isConnected}
                    className={cn(
                        "w-full bg-[#1F1F21] border rounded px-2 py-1 text-xs text-white outline-none focus:border-[#E8FF86] transition-opacity",
                        isConnected ? "border-[#E8FF86]/30 opacity-40 bg-black/50 cursor-not-allowed" : "border-[#2A2A2D]"
                    )}
                />
            </div>
        </div>
    );

    return (
        <div className={cn(
            "rounded-lg border border-[#1F1F21] bg-[#09090A] p-0 shadow-xl w-64 flex flex-col transition-all duration-300",
            isRunning && "neon-border"
        )}>
            <div className="w-full h-full rounded-lg flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-2 bg-[#1F1F21] px-3 py-2 border-b border-[#2A2A2D]">
                    <Film size={14} className="text-[#E8FF86]" />
                    <span className="text-xs font-semibold text-gray-300">Extract Frame</span>
                    {isRunning && <span className="text-[10px] text-[#E8FF86] animate-pulse ml-2 font-mono">[RUNNING]</span>}
                </div>

                <div className="p-3 relative">
                    {/* Inputs Column */}
                    <div className="flex flex-col space-y-3 mb-4">
                        {/* Video Input Handle Area */}
                        <div className="relative group">
                            <div className="flex items-center gap-2 mb-1 justify-between">
                                <span className={cn("text-[10px] font-medium transition-colors", connections.video ? "text-[#E8FF86]" : "text-gray-500")}>
                                    Video URL
                                </span>
                                {connections.video && <LinkIcon size={10} className="text-[#E8FF86]" />}
                            </div>
                            <div className="relative">
                                <Handle
                                    type="target"
                                    position={Position.Left}
                                    id="video_url"
                                    className={cn(
                                        "!w-3 !h-3 !-left-[22px] !top-1/2 !-translate-y-1/2 transition-colors z-50",
                                        connections.video ? "!bg-[#E8FF86]" : "!bg-[#a1a1aa]"
                                    )}
                                />
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    value={params.manualVideo}
                                    onChange={(e) => updateParams({ ...params, manualVideo: e.target.value })}
                                    disabled={connections.video}
                                    className={cn(
                                        "w-full bg-[#1F1F21] border rounded px-2 py-1 text-xs text-white outline-none focus:border-[#E8FF86] transition-opacity",
                                        connections.video ? "border-[#E8FF86]/30 opacity-40 bg-black/50 cursor-not-allowed" : "border-[#2A2A2D]"
                                    )}
                                />
                            </div>
                        </div>

                        {/* Timestamp Input */}
                        <div className="group">
                            <div className="flex items-center gap-2 mb-1 justify-between">
                                <span className={cn("text-[10px] font-medium transition-colors", connections.timestamp ? "text-[#E8FF86]" : "text-gray-500")}>
                                    Timestamp ({unit})
                                </span>
                                {connections.timestamp && <LinkIcon size={10} className="text-[#E8FF86]" />}
                            </div>
                            <div className="flex gap-2 relative">
                                <div className="relative flex-1">
                                    <Handle
                                        type="target"
                                        position={Position.Left}
                                        id="timestamp"
                                        className={cn(
                                            "!w-3 !h-3 !-left-[22px] !top-1/2 !-translate-y-1/2 transition-colors z-50",
                                            connections.timestamp ? "!bg-[#E8FF86] !border-[#E8FF86]" : "!bg-[#a1a1aa]"
                                        )}
                                    />
                                    <input
                                        type="number"
                                        value={params.timestamp}
                                        onChange={(e) => updateParams({ ...params, timestamp: parseFloat(e.target.value) })}
                                        disabled={connections.timestamp}
                                        className={cn(
                                            "w-full bg-[#1F1F21] border rounded px-2 py-1 text-xs text-white outline-none focus:border-[#E8FF86] transition-opacity",
                                            connections.timestamp ? "border-[#E8FF86]/30 opacity-40 bg-black/50 cursor-not-allowed" : "border-[#2A2A2D]"
                                        )}
                                    />
                                </div>
                                <select
                                    value={unit}
                                    onChange={(e) => {
                                        setUnit(e.target.value as "seconds" | "percentage");
                                        updateNodeData(id, { unit: e.target.value });
                                    }}
                                    className="bg-[#1F1F21] border border-[#2A2A2D] rounded px-2 text-[10px] text-gray-300 outline-none focus:border-[#E8FF86] cursor-pointer"
                                >
                                    <option value="seconds">s</option>
                                    <option value="percentage">%</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Output Status/Preview */}
                    {data.output && typeof data.output === 'string' && data.output.startsWith("data:image") ? (
                        <div className="mb-3 rounded overflow-hidden border border-[#2A2A2D]">
                            <img src={data.output} alt="Extracted Frame" className="w-full h-auto max-h-32 object-contain bg-black" />
                        </div>
                    ) : (
                        data.output && (
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
                                "flex items-center gap-1.5 bg-[#E8FF86] text-black text-[10px] font-bold px-3 py-1.5 rounded transition-colors",
                                isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#d6f060]"
                            )}
                        >
                            {isLoading ? (
                                <div className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                            ) : (
                                <Play size={10} fill="currentColor" />
                            )}
                            {isLoading ? "EXTRACTING..." : "START"}
                        </button>
                    </div>
                </div>

                <Handle type="source" position={Position.Right} id="output" className="!bg-[#E8FF86] !w-3 !h-3" />
            </div>
        </div>
    );
}

export default memo(FrameNode);
