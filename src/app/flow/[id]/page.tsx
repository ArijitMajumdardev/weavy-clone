"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useWorkflowAutoSave } from "@/hooks/useWorkflowAutoSave";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { EditableWorkflowName } from "@/components/workflow/EditableWorkflowName";
import { useFlowStore } from "@/store/flowStore";
import { ReactFlowProvider } from "reactflow";

// Dynamic import to avoid SSR issues with React Flow
const FlowCanvas = dynamic(() => import("@/components/flow/FlowCanvas"), {
  ssr: false,
});

export default function FlowPage() {
  const params = useParams();
  const workflowId = params.id as string;

  const { data: workflow, isLoading } = trpc.workflow.get.useQuery({
    id: workflowId,
  });

  const { data: workflowData } = trpc.workflow.getData.useQuery({
    id: workflowId,
  });

  const setNodes = useFlowStore((state) => state.setNodes);
  const setEdges = useFlowStore((state) => state.setEdges);

  useEffect(() => {
    if (workflowData) {
      const nodes: any = workflowData ? (workflowData.nodes as any) : [];
      const edges: any = workflowData ? (workflowData.edges as any) : [];
      setNodes(nodes);
      setEdges(edges);
    }
  }, [workflowData]);

  useWorkflowAutoSave(workflowId);

  useKeyboardShortcuts();

  return (
    <div className="w-screen h-screen flex flex-col relative">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar workflowId={workflowId} workflowName={workflow?.name} />
        <div className="flex-1 relative">
          <div className="bg-primary border border-[#3a3a3a]/50 rounded-md px-4 py-2 w-55 h-10 absolute z-20 left-18 top-4 flex items-center">
            {isLoading ? (
              <div className="text-sm text-[#9ca3af]">Loading...</div>
            ) : workflow ? (
              <EditableWorkflowName
                workflowId={workflowId}
                initialName={workflow.name}
              />
            ) : (
              <div className="text-sm text-[#9ca3af]">Workflow not found</div>
            )}
          </div>
          <ReactFlowProvider>
            <FlowCanvas />
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
}
