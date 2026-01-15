import { useEffect, useRef } from 'react';
import { useFlowStore } from '@/store/flowStore';
import { trpc } from '@/lib/trpc/client';

export function useWorkflowAutoSave(workflowId: string) {
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);

  const saveDataMutation = trpc.workflow.saveData.useMutation();
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
  
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveDataMutation.mutate({
        id: workflowId,
        nodes: nodes,
        edges: edges,
      });
    }, 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [nodes, edges, workflowId]);
}
