import { create } from "zustand";
import { FlowStore } from "@/types/store";
import { NodeData } from "@/types/nodes";

export const useFlowStore = create<FlowStore>((set, get) => ({
  nodes: [],
  edges: [],
  interactionMode: "cursor",

  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
    })),

  updateNode: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...data } as NodeData }
          : node
      ),
    })),

  deleteNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
    })),

  addEdge: (edge) =>
    set((state) => ({
      edges: [...state.edges, edge],
    })),

  deleteEdge: (id) =>
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
    })),

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setInteractionMode: (mode) => set({ interactionMode: mode }),
  reset: () => set({ nodes: [], edges: [] }),
}));
