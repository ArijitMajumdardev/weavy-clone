'use client';

import { useEffect } from 'react';
import { useFlowStore } from '@/store/flowStore';
import { useHistoryStore } from '@/store/historyStore';

export function useKeyboardShortcuts() {
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
          const prevState = undo();
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
          const nextState = redo();
          if (nextState) {
            setNodes(nextState.nodes);
            setEdges(nextState.edges);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setNodes, setEdges, undo, redo, canUndo, canRedo]);
}
