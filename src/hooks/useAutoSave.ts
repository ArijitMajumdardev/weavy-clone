'use client';

import { useEffect } from 'react';
import { useFlowStore } from '@/store/flowStore';
import { saveWorkflow } from '@/lib/storage';

export function useAutoSave(interval = 5000) {
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);

  useEffect(() => {
    const timer = setInterval(() => {
      saveWorkflow(nodes, edges);
    }, interval);

    return () => clearInterval(timer);
  }, [nodes, edges, interval]);
}
