import { create } from 'zustand';

export type ExecutionStatus = 'idle' | 'running' | 'completed' | 'error';

interface ExecutionState {
    isWorkflowRunning: boolean;
    nodeStatuses: Record<string, ExecutionStatus>;
    setWorkflowRunning: (isRunning: boolean) => void;
    setNodeStatus: (nodeId: string, status: ExecutionStatus) => void;
    resetStatuses: () => void;
}

export const useExecutionStore = create<ExecutionState>((set) => ({
    isWorkflowRunning: false,
    nodeStatuses: {},
    setWorkflowRunning: (isRunning) => set({ isWorkflowRunning: isRunning }),
    setNodeStatus: (nodeId, status) =>
        set((state) => ({
            nodeStatuses: { ...state.nodeStatuses, [nodeId]: status },
        })),
    resetStatuses: () => set({ nodeStatuses: {} }),
}));
