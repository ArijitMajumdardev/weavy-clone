import { FlowNode, FlowEdge, FlowState } from "./flow";

export interface FlowStore {
  nodes: FlowNode[];
  edges: FlowEdge[];
  interactionMode: "cursor" | "hand";
  addNode: (node: FlowNode) => void;
  updateNode: (id: string, data: Partial<FlowNode["data"]>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: FlowEdge) => void;
  deleteEdge: (id: string) => void;
  setNodes: (nodes: FlowNode[]) => void;
  setEdges: (edges: FlowEdge[]) => void;
  setInteractionMode: (mode: "cursor" | "hand") => void;
  reset: () => void;
}

export interface HistoryStore {
  past: FlowState[];
  future: FlowState[];
  pushState: (state: FlowState) => void;
  undo: (currentState: FlowState) => FlowState | null;
  redo: (currentState: FlowState) => FlowState | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
}
