import { create } from 'zustand';

export type NodeType = 'text' | 'image' | 'video' | 'llm' | 'crop' | 'frame';

interface EditorState {
    pendingNode: NodeType | null;
    addNodeContent: (type: NodeType) => void;
    consumeNodeContent: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
    pendingNode: null,
    addNodeContent: (type) => set({ pendingNode: type }),
    consumeNodeContent: () => set({ pendingNode: null }),
}));
