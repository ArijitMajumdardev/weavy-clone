import { create } from "zustand";
import { HistoryStore } from "@/types/store";
import { FlowState } from "@/types/flow";

const MAX_HISTORY = 50;

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  past: [],
  future: [],

  pushState: (state: FlowState) =>
    set((prev) => ({
      past: [...prev.past.slice(-MAX_HISTORY + 1), state],
      future: [],
    })),

  undo: (currentState: FlowState) => {
    const { past, future } = get();
    if (past.length === 0) return null;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);

    set({
      past: newPast,
      future: [currentState, ...future],
    });

    return previous;
  },

  redo: (currentState: FlowState) => {
    const { past, future } = get();
    if (future.length === 0) return null;

    const next = future[0];
    const newFuture = future.slice(1);

    set({
      past: [...past, currentState],
      future: newFuture,
    });

    return next;
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
  clear: () => set({ past: [], future: [] }),
}));
