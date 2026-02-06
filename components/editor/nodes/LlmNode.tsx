"use client";

import React, { memo, useState } from "react";
import { Handle, Position, NodeProps, useReactFlow } from "@xyflow/react";
import { Sparkles, ChevronDown, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useExecutionStore } from "@/app/editor/execution-store";

import { runLlmGeneration } from "@/app/actions/run-llm";
import { saveWorkflowRun } from "@/app/actions/save-workflow-run";
import { useAuth } from "@clerk/nextjs";

export function LlmNode({ id, data }: NodeProps) {
    const { userId } = useAuth();
    const [model, setModel] = useState("gemini");
    const [isLoading, setIsLoading] = useState(false);
    const { getEdges, getNode, updateNodeData } = useReactFlow();
    const executionStatus = useExecutionStore(state => state.nodeStatuses[id]);
    const isRunning = executionStatus === 'running';

    const handleStart = async () => {
        setIsLoading(true);
        updateNodeData(id, { output: "Generating..." });
        const startTime = Date.now();

        let result;
        let finalOutput = "";
        let errorMsg = undefined;

        try {
            const edges = getEdges();

            // Find inputs
            const systemEdge = edges.find(e => e.target === id && e.targetHandle === "system");
            const userEdge = edges.find(e => e.targetHandle === "user" && e.target === id);
            const imageEdge = edges.find(e => e.target === id && e.targetHandle === "image");

            const systemNode = systemEdge ? getNode(systemEdge.source) : null;
            const userNode = userEdge ? getNode(userEdge.source) : null;
            const imageNode = imageEdge ? getNode(imageEdge.source) : null;

            const systemPrompt = systemNode?.data?.text as string;
            const userPrompt = userNode?.data?.text as string;
            const image = imageNode?.data?.image as string || imageNode?.data?.output as string;

            if (!userPrompt) {
                updateNodeData(id, { output: "Error: User Prompt is required." });
                setIsLoading(false);
                return; // Don't save history if validation fails early? Or save as failed? Let's save.
            }

            // Diagnostic Check
            if (imageNode && !image) {
                updateNodeData(id, { output: "Error: Image Node connected but empty. \n\nPlease re-upload the image to ensure it is saved." });
                setIsLoading(false);
                return;
            }

            result = await runLlmGeneration({
                systemPrompt,
                userPrompt,
                image,
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
                        nodeType: "llm",
                        nodeLabel: data.label as string || "LLM Node",
                        status: errorMsg ? "FAILED" : "COMPLETED",
                        startedAt: new Date(startTime),
                        endedAt: new Date(endTime),
                        duration: endTime - startTime,
                        inputs: { system: "...", user: "..." }, // Simplified for history
                        outputs: finalOutput,
                        error: errorMsg
                    }]
                });
            }
        }
    };

    return (
        <div className={cn(
            "rounded-lg border border-[#1F1F21] bg-[#09090A] p-0 shadow-xl w-72 flex flex-col transition-all duration-300",
            isRunning && "neon-border"
        )}>
            {/* Inner wrapper for overflow safety */}
            <div className="w-full h-full overflow-hidden rounded-lg flex flex-col">
                {/* Handles */}
                <div className="absolute left-0 top-14 flex flex-col gap-10 z-10">
                    <div className="relative flex flex-col items-center">
                        <Handle type="target" position={Position.Left} id="system" className="!bg-[#a1a1aa] !w-3 !h-3 !-left-1.5" />
                        <span className="absolute top-4 left-1 text-[9px] text-gray-500 uppercase font-medium whitespace-nowrap">System</span>
                    </div>
                    <div className="relative flex flex-col items-center">
                        <Handle type="target" position={Position.Left} id="user" className="!bg-[#a1a1aa] !w-3 !h-3 !-left-1.5" />
                        <span className="absolute top-4 left-1 text-[9px] text-gray-500 uppercase font-medium whitespace-nowrap">User</span>
                    </div>
                    <div className="relative flex flex-col items-center">
                        <Handle type="target" position={Position.Left} id="image" className="!bg-[#a1a1aa] !w-3 !h-3 !-left-1.5" />
                        <span className="absolute top-4 left-1 text-[9px] text-gray-500 uppercase font-medium whitespace-nowrap">Image</span>
                    </div>
                </div>

                {/* Header with Model Selector */}
                <div className="flex items-center justify-between bg-[#1F1F21] px-3 py-2 border-b border-[#2A2A2D] pl-16">
                    <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-[#E8FF86]" />
                        <span className="text-xs font-semibold text-gray-300">Run Any LLM</span>
                        {isRunning && <span className="text-[10px] text-[#E8FF86] animate-pulse ml-2 font-mono">[RUNNING]</span>}
                    </div>

                    {/* Simple Custom Dropdown (Native Select for now for simplicity) */}
                    <div className="relative group">
                        <select
                            value={model}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                setModel(e.target.value);
                                updateNodeData(id, { model: e.target.value });
                            }}
                            className="appearance-none bg-[#09090A] border border-[#2A2A2D] text-xs text-gray-300 rounded px-2 py-1 pr-6 focus:outline-none focus:border-[#E8FF86] cursor-pointer"
                        >
                            <option value="gemini">Gemini</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                </div>

                {/* Output Area */}
                <div className="p-3 pl-16">
                    <div className="mb-1 flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Output</span>
                    </div>
                    <textarea
                        readOnly
                        className="w-full h-40 bg-[#0e0e0e] border border-[#1F1F21] rounded p-2 text-sm text-gray-300 resize-none outline-none focus:border-gray-700 mb-3"
                        placeholder="The generated text will appear here..."
                        defaultValue={data.output as string || ""}
                    />

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
                            {isLoading ? "RUNNING..." : "START"}
                        </button>
                    </div>
                </div>

                <Handle type="source" position={Position.Right} id="output" className="!bg-[#E8FF86] !w-3 !h-3" />
            </div>
        </div>
    );
}

export default memo(LlmNode);
