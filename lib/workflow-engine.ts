import { Edge, Node } from "@xyflow/react";
import { runLlmGeneration } from "@/app/actions/run-llm";
import { runCropImage } from "@/app/actions/run-crop";
import { runExtractFrame } from "@/app/actions/run-extract-frame";
import { saveWorkflowRun } from "@/app/actions/save-workflow-run";
import { WorkflowStep } from "@/lib/schemas/workflow";
import { useExecutionStore } from "@/app/editor/execution-store";


// Helper to get node data safely
const getNodeData = (node: Node) => node.data;

// Helper to check if a node has all its inputs ready
const isNodeReady = (node: Node, edges: Edge[], completedNodes: Set<string>) => {
    if (node.type === "text" || node.type === "image" || node.type === "video") {
        return true;
    }
    const incomingEdges = edges.filter(e => e.target === node.id);
    if (incomingEdges.length === 0) return true;
    return incomingEdges.every(edge => completedNodes.has(edge.source));
};

export const executeWorkflow = async (
    nodes: Node[],
    edges: Edge[],
    updateNodeData: (id: string, data: any) => void,
    userId: string
) => {
    const { setWorkflowRunning, setNodeStatus, resetStatuses } = useExecutionStore.getState();
    const startTime = Date.now();


    // Prevent double execution if already running? 
    // Ideally the UI should block this, but safety check here:
    if (useExecutionStore.getState().isWorkflowRunning) return;

    setWorkflowRunning(true);
    resetStatuses();

    // Local Map to store latest data during this execution
    // This solves the Stale Closure issue where 'nodes' array is static
    const executionData = new Map<string, any>();
    nodes.forEach(n => executionData.set(n.id, { ...n.data }));

    const completedNodes = new Set<string>();
    const processingNodes = new Set<string>();
    const errorNodes = new Set<string>();

    const allNodeIds = new Set(nodes.map(n => n.id));

    // Internal helper to update data both locally and in React Flow
    const updateData = (id: string, data: any) => {
        const current = executionData.get(id) || {};
        const merged = { ...current, ...data };
        executionData.set(id, merged);
        updateNodeData(id, data);
    };

    let iterations = 0;
    const maxIterations = 100;

    try {
        while (completedNodes.size + errorNodes.size < allNodeIds.size && iterations < maxIterations) {
            iterations++;

            const readyNodes = nodes.filter(node =>
                !completedNodes.has(node.id) &&
                !processingNodes.has(node.id) &&
                !errorNodes.has(node.id) &&
                isNodeReady(node, edges, completedNodes)
            );

            if (readyNodes.length === 0) {
                if (processingNodes.size === 0) {
                    break; // Stuck or done
                }
                await new Promise(resolve => setTimeout(resolve, 500));
                continue;
            }

            console.log(`[Workflow] Batch ${iterations} Dispatching requests for:`, readyNodes.map(n => n.type));

            // 1. TRIGGER PHASE: Start all ready nodes in parallel (Non-Blocking)
            const activeHandles = new Map<string, string>(); // NodeID -> HandleID

            const triggerPromises = readyNodes.map(async (node) => {
                processingNodes.add(node.id);
                setNodeStatus(node.id, 'running');

                try {
                    // Pass-through Input Nodes
                    if (node.type === "text" || node.type === "image" || node.type === "video") {
                        completedNodes.add(node.id);
                        setNodeStatus(node.id, 'completed');
                        processingNodes.delete(node.id);
                        return;
                    }

                    // Prepare Inputs
                    const inputs = getInputsForNode(node, edges, executionData);
                    let result: any;

                    if (node.type === "crop") {
                        const data = executionData.get(node.id) || {};
                        const image = inputs.image_url || inputs.image || data.image;
                        const x = inputs.x_percent ?? data.x;
                        const y = inputs.y_percent ?? data.y;
                        const w = inputs.width_percent ?? data.width;
                        const h = inputs.height_percent ?? data.height;

                        if (!image) throw new Error("No image input");

                        // Trigger Only (wait=false)
                        result = await runCropImage({
                            image: image as string,
                            x: Number(x), y: Number(y), width: Number(w), height: Number(h)
                        }, false);
                    }
                    else if (node.type === "frame") {
                        const data = executionData.get(node.id) || {};
                        const video = inputs.video_url || data.manualVideo || data.video;
                        const timestamp = inputs.timestamp ?? data.timestamp;
                        const unit = data.unit as "seconds" | "percentage" || "seconds";

                        if (!video) throw new Error("No video input");

                        result = await runExtractFrame({
                            video: video as string,
                            timestamp: Number(timestamp),
                            unit
                        }, false);
                    }
                    else if (node.type === "llm") {
                        const data = executionData.get(node.id) || {};
                        const system = inputs.system;
                        const user = inputs.user;
                        const image = inputs.image;

                        if (!user) throw new Error("User prompt required");

                        result = await runLlmGeneration({
                            systemPrompt: system as string,
                            userPrompt: user as string,
                            image: image as string
                        }, false);
                    }

                    if (result && result.success && result.handleId) {
                        activeHandles.set(node.id, result.handleId);
                    } else if (result && !result.success) {
                        throw new Error(result.error);
                    }

                } catch (err: any) {
                    console.error(`Node ${node.id} trigger failed:`, err);
                    setNodeStatus(node.id, 'error');
                    errorNodes.add(node.id);
                    processingNodes.delete(node.id);
                    updateData(node.id, { output: `Error: ${err.message}` });
                }
            });

            await Promise.all(triggerPromises);

            // 2. POLLING PHASE: Wait for all active handles to complete
            if (activeHandles.size > 0) {
                const pendingNodes = new Set(activeHandles.keys());

                while (pendingNodes.size > 0) {
                    await new Promise(r => setTimeout(r, 1000)); // Poll interval

                    const pollPromises = Array.from(pendingNodes).map(async (nodeId) => {
                        const handleId = activeHandles.get(nodeId);
                        if (!handleId) return;

                        // Import checkTaskStatus dynamically to avoid circular deps if any, or just import at top?
                        // We will update imports.
                        const { checkTaskStatus } = await import("@/app/actions/check-task-status");
                        const statusRes = await checkTaskStatus(handleId);

                        if (statusRes.status === "COMPLETED") {
                            updateData(nodeId, { output: statusRes.output });
                            setNodeStatus(nodeId, 'completed');
                            completedNodes.add(nodeId);
                            processingNodes.delete(nodeId);
                            pendingNodes.delete(nodeId);
                        } else if (statusRes.status === "FAILED") {
                            updateData(nodeId, { output: `Error: ${statusRes.error}` });
                            setNodeStatus(nodeId, 'error');
                            errorNodes.add(nodeId);
                            processingNodes.delete(nodeId);
                            pendingNodes.delete(nodeId);
                        }
                        // If RUNNING/QUEUED, do nothing, keep in pendingNodes
                    });

                    await Promise.all(pollPromises);
                }
            }
        }
    } catch (e) {
        console.error("Workflow Main Loop Error:", e);
    } finally {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Collect steps for history
        const stepsToSave: WorkflowStep[] = [];

        allNodeIds.forEach(id => {
            const node = nodes.find(n => n.id === id);
            if (!node) return;

            // Determine status
            let status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" = "PENDING";
            if (completedNodes.has(id)) status = "COMPLETED";
            if (errorNodes.has(id)) status = "FAILED";
            // if (processingNodes.has(id)) status = "RUNNING"; // Should be empty by now

            // Get inputs/outputs from map
            const data = executionData.get(id) || {};
            // Re-calculate inputs to store them
            const usedInputs = getInputsForNode(node, edges, executionData);

            // Create Step Record
            stepsToSave.push({
                nodeId: id,
                nodeType: node.type || "unknown",
                nodeLabel: data.label || node.type || "Node",
                status: status,
                inputs: usedInputs,
                outputs: data.output,
                error: status === "FAILED" ? (data.output as string) : undefined,
                startedAt: new Date(), // We didn't track individual start times precisely in this loop version, approximating
                endedAt: new Date(),
                duration: 0 // We aren't tracking per-node duration yet
            });
        });

        // Determine overall status
        const isSuccess = errorNodes.size === 0 && completedNodes.size === allNodeIds.size;
        const workflowStatus = isSuccess ? "COMPLETED" : (errorNodes.size > 0 ? "FAILED" : "RUNNING"); // Running if partial?

        // Save History
        try {
            await saveWorkflowRun({
                userId: userId,
                triggerType: "FULL",
                status: isSuccess ? "COMPLETED" : "FAILED",
                startedAt: new Date(startTime),
                endedAt: new Date(endTime),
                duration: duration,
                steps: stepsToSave
            });
            console.log("Workflow Run Saved to History");
        } catch (saveErr) {
            console.error("Failed to save workflow history:", saveErr);
        }

        setWorkflowRunning(false);
    }
};

// Updated signature to take executionData map
function getInputsForNode(node: Node, edges: Edge[], executionData: Map<string, any>) {
    const inputEdges = edges.filter(e => e.target === node.id);
    const inputs: Record<string, any> = {};

    inputEdges.forEach(edge => {
        // We only care about Data, not the Node object itself mostly
        const sourceData = executionData.get(edge.source);
        if (sourceData) {
            const handle = edge.targetHandle;
            // Try to intelligently guess the value if specific handle not obvious
            // But usually source nodes put result in 'output' or specific field
            let value = sourceData.output ?? sourceData.text ?? sourceData.image ?? sourceData.video;

            if (handle) {
                inputs[handle] = value;
            } else {
                // Fallback for unnamed inputs?
                // inputs['default'] = value;
            }
        }
    });

    return inputs;
}
