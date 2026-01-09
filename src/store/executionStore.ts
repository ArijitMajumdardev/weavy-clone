import { create } from 'zustand';

interface ExecutionStore {
  executingNodes: Set<string>;
  setExecuting: (nodeId: string, isExecuting: boolean) => void;
  isExecuting: (nodeId: string) => boolean;
}

export const useExecutionStore = create<ExecutionStore>((set, get) => ({
  executingNodes: new Set(),

  setExecuting: (nodeId, isExecuting) => set((state) => {
    const newSet = new Set(state.executingNodes);
    if (isExecuting) {
      newSet.add(nodeId);
    } else {
      newSet.delete(nodeId);
    }
    return { executingNodes: newSet };
  }),

  isExecuting: (nodeId) => get().executingNodes.has(nodeId),
}));
