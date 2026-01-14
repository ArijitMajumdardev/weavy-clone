'use client';

import { useEffect } from 'react';
import { useFlowStore } from '@/store/flowStore';
import { useHistoryStore } from '@/store/historyStore';

export function useKeyboardShortcuts() {
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const setNodes = useFlowStore((state) => state.setNodes);
  const setEdges = useFlowStore((state) => state.setEdges);
  const undo = useHistoryStore((state) => state.undo);
  const redo = useHistoryStore((state) => state.redo);
  const canUndo = useHistoryStore((state) => state.canUndo);
  const canRedo = useHistoryStore((state) => state.canRedo);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for Undo
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        if (canUndo()) {
          const currentState = { nodes, edges };
          const prevState = undo(currentState);
          if (prevState) {
            setNodes(prevState.nodes);
            setEdges(prevState.edges);
          }
        }
      }

      // Ctrl+Shift+Z or Cmd+Shift+Z for Redo
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && event.shiftKey) {
        event.preventDefault();
        if (canRedo()) {
          const currentState = { nodes, edges };
          const nextState = redo(currentState);
          if (nextState) {
            setNodes(nextState.nodes);
            setEdges(nextState.edges);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, setNodes, setEdges, undo, redo, canUndo, canRedo]);
}
