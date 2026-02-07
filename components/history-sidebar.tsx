"use client";

import { useEffect, useState } from "react";
import { getWorkflowRuns } from "@/app/actions/get-workflow-runs";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, CheckCircle2, XCircle, Clock, RotateCcw } from "lucide-react";
import { format } from "date-fns";

type WorkflowRunHistoryItem = Awaited<ReturnType<typeof getWorkflowRuns>>[number];

interface HistorySidebarProps {
    userId: string | null | undefined;
    isOpen: boolean;
    refreshTrigger?: number;
}

export function HistorySidebar({ userId, isOpen, refreshTrigger = 0 }: HistorySidebarProps) {
    const [runs, setRuns] = useState<WorkflowRunHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

    const fetchRuns = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const data = await getWorkflowRuns(userId);
            setRuns(data);
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && userId) {
            fetchRuns();
        }
    }, [isOpen, userId, refreshTrigger]);

    if (!isOpen) return null;

    return (
        <div className="absolute top-0 right-0 h-full w-80 bg-[#09090A] border-l border-[#2A2A2D] shadow-2xl z-40 overflow-y-auto flex flex-col transition-all duration-300">
            <div className="p-4 border-b border-[#2A2A2D] flex items-center justify-between sticky top-0 bg-[#09090A] z-10">
                <h2 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                    <RotateCcw size={16} /> Workflow History
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {loading && <div className="text-center text-gray-500 py-4">Loading history...</div>}

                {!loading && runs.length === 0 && (
                    <div className="text-center text-gray-500 py-4 text-xs">No runs found.</div>
                )}

                {runs.map((run, index) => (
                    <div key={run.id} className="border border-[#2A2A2D] rounded-lg bg-[#1F1F21] overflow-hidden">
                        <button
                            onClick={() => setExpandedRunId(expandedRunId === run.id ? null : run.id)}
                            className="w-full text-left p-3 flex items-center justify-between hover:bg-[#2A2A2D] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                {run.status === "COMPLETED" ? (
                                    <CheckCircle2 size={16} className="text-[#E8FF86]" />
                                ) : run.status === "FAILED" ? (
                                    <XCircle size={16} className="text-red-500" />
                                ) : (
                                    <Clock size={16} className="text-yellow-500 animate-pulse" />
                                )}
                                <div>
                                    <div className="text-xs font-semibold text-gray-300">
                                        Run #{runs.length - index}
                                    </div>
                                    <div className="text-[10px] text-gray-500">
                                        {format(new Date(run.startedAt), "MMM d, h:mm a")} • {run.triggerType}
                                    </div>
                                </div>
                            </div>
                            {expandedRunId === run.id ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
                        </button>

                        {expandedRunId === run.id && (
                            <div className="bg-[#0e0e0e] p-2 border-t border-[#2A2A2D] space-y-3">
                                {run.steps.map((step, sIdx) => (
                                    <div key={sIdx} className="pl-2 relative">
                                        {/* Timeline Line */}
                                        {sIdx !== run.steps.length - 1 && (
                                            <div className="absolute left-[11px] top-4 bottom-[-16px] w-[1px] bg-[#2A2A2D]" />
                                        )}

                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 z-10 bg-[#0e0e0e]">
                                                {step.status === "COMPLETED" ? (
                                                    <div className="w-2 h-2 rounded-full bg-[#E8FF86]" />
                                                ) : step.status === "FAILED" ? (
                                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                                ) : (
                                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                                )}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-medium text-gray-300">{step.nodeLabel || step.nodeType}</span>
                                                    <span className="text-[10px] text-gray-500">{step.duration ? `${(step.duration / 1000).toFixed(1)}s` : ''}</span>
                                                </div>

                                                {step.outputs && (
                                                    <div className="mt-1 text-[10px] text-gray-500 bg-[#1F1F21] p-1.5 rounded truncate font-mono border border-[#2A2A2D]">
                                                        Output: {JSON.stringify(step.outputs).slice(0, 50)}...
                                                    </div>
                                                )}

                                                {step.error && (
                                                    <div className="mt-1 text-[10px] text-red-400 bg-red-900/20 p-1.5 rounded border border-red-900/50">
                                                        Error: {step.error}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div >
    );
}
