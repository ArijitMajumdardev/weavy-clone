import { useEffect, useRef } from 'react';
import { useFlowStore } from '@/store/flowStore';
import { trpc } from '@/lib/trpc/client';

/**
 * Auto-saves workflow data (nodes and edges) to the database
 * Debounces saves to avoid too many database calls
 */
export function useWorkflowAutoSave(workflowId: string) {
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);

  const saveDataMutation = trpc.workflow.saveData.useMutation();
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce save by 1 second
    timeoutRef.current = setTimeout(() => {
      saveDataMutation.mutate({
        id: workflowId,
        nodes: nodes,
        edges: edges,
      });
    }, 1000);

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [nodes, edges, workflowId]);
}
