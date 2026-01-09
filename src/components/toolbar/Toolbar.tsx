'use client';

import { useCallback } from 'react';
import { useFlowStore } from '@/store/flowStore';
import { exportWorkflowJSON, importWorkflowJSON } from '@/lib/storage';

export default function Toolbar() {
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const setNodes = useFlowStore((state) => state.setNodes);
  const setEdges = useFlowStore((state) => state.setEdges);
  const reset = useFlowStore((state) => state.reset);


  // Save/Load handlers removed - will implement with database later
  // const handleSave = useCallback(() => {
  //   saveWorkflow(nodes, edges);
  //   alert('Workflow saved!');
  // }, [nodes, edges]);

  // const handleLoad = useCallback(() => {
  //   const workflow = loadWorkflow();
  //   if (workflow) {
  //     setNodes(workflow.nodes);
  //     setEdges(workflow.edges);
  //     alert('Workflow loaded!');
  //   } else {
  //     alert('No saved workflow found!');
  //   }
  // }, [setNodes, setEdges]);

  const handleExport = useCallback(() => {
    const json = exportWorkflowJSON(nodes, edges);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      const workflow = importWorkflowJSON(text);
      if (workflow) {
        setNodes(workflow.nodes);
        setEdges(workflow.edges);
        alert('Workflow imported!');
      } else {
        alert('Failed to import workflow!');
      }
    };
    input.click();
  }, [setNodes, setEdges]);

  const handleClear = useCallback(() => {
    if (confirm('Clear all nodes and edges?')) {
      reset();
    }
  }, [reset]);

  return (
    <div className="h-16 bg-[#1a1a1a] border-b border-[#3a3a3a] px-6 flex items-center gap-4">
      {/* Project Name */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-[#a855f7] to-[#06b6d4] rounded-lg flex items-center justify-center text-white font-bold text-sm">
          W
        </div>
        <h1 className="text-[#e5e5e5] font-semibold">My LLM Workflow</h1>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          className="px-3 py-1.5 bg-[#2a2a2a] border border-[#3a3a3a] text-[#e5e5e5] rounded-lg text-sm hover:bg-[#333333] hover:border-[#a855f7] transition-all"
        >
          Export
        </button>

        <button
          onClick={handleImport}
          className="px-3 py-1.5 bg-[#2a2a2a] border border-[#3a3a3a] text-[#e5e5e5] rounded-lg text-sm hover:bg-[#333333] hover:border-[#a855f7] transition-all"
        >
          Import
        </button>

        <button
          onClick={handleClear}
          className="px-3 py-1.5 bg-[#2a2a2a] border border-[#3a3a3a] text-[#e5e5e5] rounded-lg text-sm hover:bg-[#333333] hover:border-red-500 transition-all"
        >
          Clear
        </button>
      </div>

      {/* Right Side - Credits and Controls */}
      <div className="ml-auto flex items-center gap-4">
        {/* Credits Display */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg">
          <svg className="w-4 h-4 text-[#06b6d4]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-[#e5e5e5] font-medium">147 credits</span>
        </div>

        {/* Share Button */}
        <button className="px-4 py-1.5 bg-[#a855f7] text-white rounded-lg text-sm font-medium hover:bg-[#9333ea] transition-all flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      </div>
    </div>
  );
}
