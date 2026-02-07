"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
    ReactFlow,
    Background,
    // Controls,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    // ReactFlowProvider,
    useReactFlow,
    getOutgoers,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEditorStore, NodeType } from "@/app/editor/store";
import { useExecutionStore } from "@/app/editor/execution-store";
import TextNode from "@/components/editor/nodes/TextNode";
import ImageNode from "@/components/editor/nodes/ImageNode";
import VideoNode from "@/components/editor/nodes/VideoNode";
import LlmNode from "@/components/editor/nodes/LlmNode";
import CropNode from "@/components/editor/nodes/CropNode";
import FrameNode from "@/components/editor/nodes/FrameNode";
// import PlaceholderNode from "@/components/editor/nodes/PlaceholderNode";
import { HistorySidebar } from "@/components/history-sidebar";
import { useAuth } from "@clerk/nextjs";
import { History, Trash2, Undo, Redo, Download } from "lucide-react";

interface EditorClientProps {
    initialNodes: Node[];
    initialEdges: Edge[];
    workflowId: string;
}

export default function EditorClient({ initialNodes, initialEdges, workflowId }: EditorClientProps) {
    const { userId } = useAuth();
    const [isHistoryOpen, setIsHistoryOpen] = useState(true);
    const reactFlowWrapper = useRef(null);

    // History Refresh Logic
    const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
    const isRunning = useExecutionStore(s => s.isWorkflowRunning);
    const wasRunning = useRef(false);

    useEffect(() => {
        if (!isRunning && wasRunning.current) {
            // Just finished
            setHistoryRefreshTrigger(prev => prev + 1);
        }
        wasRunning.current = isRunning;
    }, [isRunning]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { screenToFlowPosition, getNodes, getEdges, deleteElements } = useReactFlow();

    // Undo/Redo State
    const [past, setPast] = useState<{ nodes: Node[], edges: Edge[] }[]>([]);
    const [future, setFuture] = useState<{ nodes: Node[], edges: Edge[] }[]>([]);

    const takeSnapshot = useCallback(() => {
        setPast((p) => [...p.slice(-10), { nodes: getNodes(), edges: getEdges() }]); // Limit history to last 10
        setFuture([]);
    }, [getNodes, getEdges]);

    const undo = useCallback(() => {
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        setFuture((f) => [{ nodes: getNodes(), edges: getEdges() }, ...f]);
        setPast(newPast);
        setNodes(previous.nodes);
        setEdges(previous.edges);
    }, [past, getNodes, getEdges, setNodes, setEdges]);

    const redo = useCallback(() => {
        if (future.length === 0) return;
        const next = future[0];
        const newFuture = future.slice(1);

        setPast((p) => [...p, { nodes: getNodes(), edges: getEdges() }]);
        setFuture(newFuture);
        setNodes(next.nodes);
        setEdges(next.edges);
    }, [future, getNodes, getEdges, setNodes, setEdges]);

    const onDeleteSelected = useCallback(() => {
        takeSnapshot();
        const selectedNodes = getNodes().filter(n => n.selected);
        const selectedEdges = getEdges().filter(e => e.selected);
        deleteElements({ nodes: selectedNodes, edges: selectedEdges });
    }, [takeSnapshot, getNodes, getEdges, deleteElements]);

    // Wrap changes to snapshot on delete
    const onNodesChangeWithHistory = useCallback((changes: any) => {
        if (changes.some((c: any) => c.type === 'remove')) {
            takeSnapshot();
        }
        onNodesChange(changes);
    }, [onNodesChange, takeSnapshot]);

    const onEdgesChangeWithHistory = useCallback((changes: any) => {
        if (changes.some((c: any) => c.type === 'remove')) {
            takeSnapshot();
        }
        onEdgesChange(changes);
    }, [onEdgesChange, takeSnapshot]);

    const downloadWorkflow = useCallback(() => {
        const flow = {
            nodes: getNodes(),
            edges: getEdges(),
        };
        const json = JSON.stringify(flow, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `workflow-${workflowId}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [getNodes, getEdges, workflowId]);

    const { pendingNode, consumeNodeContent } = useEditorStore();

    const nodeTypes = useMemo(() => ({
        text: TextNode,
        image: ImageNode,
        video: VideoNode,
        llm: LlmNode,
        crop: CropNode,
        frame: FrameNode,
    }), []);

    const onConnect = useCallback(
        (params: Connection) => {
            takeSnapshot(); // Snapshot before connecting
            setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#E8FF86', strokeWidth: 2 } }, eds));
        },
        [setEdges, takeSnapshot],
    );

    const isValidConnection = useCallback(
        (connection: Connection | Edge) => {
            // Find target node type
            const targetNode = nodes.find((n) => n.id === connection.target);
            const sourceNode = nodes.find((n) => n.id === connection.source);

            if (!targetNode || !sourceNode) return false;

            // 1. Prevent Self-Loops
            if (connection.source === connection.target) return false;

            // 2. Cycle Detection
            const hasCycle = (node: Node, visited = new Set<string>()): boolean => {
                if (visited.has(node.id)) return false;
                visited.add(node.id);
                if (node.id === sourceNode.id) return true; // Cycle detected

                return getOutgoers(node, nodes, edges).some((outgoer) => hasCycle(outgoer, visited));
            };

            if (hasCycle(targetNode)) return false;


            // 3. Type & Content Sanitization

            // A. Number Inputs (x, y, width, height, timestamp)
            const numberHandles = ["x_percent", "y_percent", "width_percent", "height_percent", "timestamp"];
            if (connection.targetHandle && numberHandles.includes(connection.targetHandle)) {
                if (sourceNode.type === "text") {
                    const text = sourceNode.data?.text as string;
                    if (!text || !/^\d+(\.\d+)?$/.test(text.trim())) {
                        return false;
                    }
                    return true;
                }
                return false;
            }

            // B. Image Inputs (image_url) or generic "image" handle
            if (connection.targetHandle === "image_url" || connection.targetHandle === "image") {
                const allowedTypes = ["image", "crop", "frame"];
                if (!allowedTypes.includes(sourceNode.type || "")) {
                    return false;
                }
                return true;
            }

            // C. Video Inputs (video_url)
            if (connection.targetHandle === "video_url") {
                if (sourceNode.type !== "video") {
                    return false;
                }
                return true;
            }

            // D. LLM Inputs (system, user) - Strict Text sources
            if (targetNode.type === "llm") {
                if (connection.targetHandle === "system" || connection.targetHandle === "user") {
                    const hasExistingConnection = edges.some(
                        (edge) =>
                            edge.target === connection.target &&
                            edge.targetHandle === connection.targetHandle
                    );
                    if (hasExistingConnection) return false;

                    if (sourceNode.type === "image" || sourceNode.type === "video") return false;
                }
            }

            return true;
        },
        [nodes, edges]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow') as NodeType;

            if (!type) {
                return;
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = {
                id: `${type}-${Date.now()}`,
                type,
                position,
                data: { label: `${type} node` },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, setNodes],
    );

    // Handle click-to-add from Sidebar
    useEffect(() => {
        if (pendingNode) {
            // Add to center of view (simplified) or generic pos
            const id = `${pendingNode}-${Date.now()}`;
            const newNode = {
                id,
                type: pendingNode,
                position: { x: 250, y: 50 }, // Ideally center of viewport
                data: { label: `${pendingNode} node` },
            };
            setNodes((nds) => nds.concat(newNode));
            consumeNodeContent();
        }
    }, [pendingNode, setNodes, consumeNodeContent]);

    return (
        <div className="w-full h-full bg-[#0e0e0e]" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChangeWithHistory}
                onEdgesChange={onEdgesChangeWithHistory}
                onConnect={onConnect}
                isValidConnection={isValidConnection}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                fitView
                className="bg-[#0e0e0e]"
                proOptions={{ hideAttribution: true }}
            >
                <Background gap={24} size={1} color="#2A2A2D" />
            </ReactFlow>

            {/* Editor Controls (Undo/Redo/Delete) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#1F1F21] border border-[#2A2A2D] p-1.5 rounded-xl shadow-xl">
                <button onClick={undo} disabled={past.length === 0} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-50 transition-colors" title="Undo">
                    <Undo size={18} />
                </button>
                <button onClick={redo} disabled={future.length === 0} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-50 transition-colors" title="Redo">
                    <Redo size={18} />
                </button>
                <div className="w-[1px] h-4 bg-[#2A2A2D] mx-1" />
                <button onClick={onDeleteSelected} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete Selected">
                    <Trash2 size={18} />
                </button>
                <div className="w-[1px] h-4 bg-[#2A2A2D] mx-1" />
                <button onClick={downloadWorkflow} className="p-2 text-gray-400 hover:text-[#E8FF86] hover:bg-white/10 rounded-lg transition-colors" title="Download JSON">
                    <Download size={18} />
                </button>
            </div>



            <HistorySidebar
                userId={userId}
                isOpen={isHistoryOpen}
                refreshTrigger={historyRefreshTrigger}
            />

            {/* Run Button positioned to the left of the History Sidebar */}
            <div className="absolute top-4 right-[21rem] z-50">
                <button
                    disabled={useExecutionStore(s => s.isWorkflowRunning)}
                    onClick={() => {
                        import("@/lib/workflow-engine").then(({ executeWorkflow }) => {
                            if (!userId) {
                                alert("Please login to run workflows.");
                                return;
                            }
                            executeWorkflow(getNodes(), getEdges(), (id, data) => {
                                setNodes((nds) => nds.map((n) => {
                                    if (n.id === id) {
                                        return { ...n, data: { ...n.data, ...data } };
                                    }
                                    return n;
                                }));
                            }, userId);
                        });
                    }}
                    className={cn(
                        "bg-[#E8FF86] text-black font-bold px-4 py-2 rounded shadow-lg transition-transform active:scale-95 flex items-center gap-2",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
                        !useExecutionStore(s => s.isWorkflowRunning) && "hover:bg-[#d6f060]"
                    )}
                >
                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-black border-b-[6px] border-b-transparent ml-0.5"></div>
                    RUN WORKFLOW
                </button>
            </div>
        </div>
    );
}
