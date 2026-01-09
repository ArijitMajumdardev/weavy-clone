'use client';

import { memo, useCallback, ChangeEvent } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { LLMNodeData } from '@/types/nodes';
import { useFlowStore } from '@/store/flowStore';
import { aggregateNodeInputs } from '@/lib/dataFlow';
import { GEMINI_MODELS } from '@/lib/gemini';
import { LLMRequest, LLMResponse } from '@/types/api';

function LLMNode({ id, data }: NodeProps<LLMNodeData>) {
  const updateNode = useFlowStore((state) => state.updateNode);
  const interactionMode = useFlowStore((state) => state.interactionMode);
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);

  const handleModelChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    updateNode(id, { model: e.target.value });
  }, [id, updateNode]);

  const handleSystemPromptChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    updateNode(id, { systemPrompt: e.target.value });
  }, [id, updateNode]);

  const handleRun = useCallback(async () => {
    // Aggregate inputs from connected nodes
    const inputs = aggregateNodeInputs(id, nodes, edges);

    if (inputs.length === 0) {
      updateNode(id, { error: 'No inputs connected' });
      return;
    }

    // Set loading state
    updateNode(id, { isLoading: true, error: null, output: null });

    try {
      const requestBody: LLMRequest = {
        model: data.model,
        systemPrompt: data.systemPrompt || undefined,
        inputs,
      };

      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const result: LLMResponse = await response.json();

      if (result.success && result.output) {
        updateNode(id, { isLoading: false, output: result.output });
      } else {
        updateNode(id, { isLoading: false, error: result.error || 'Unknown error' });
      }
    } catch (error) {
      updateNode(id, {
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to execute LLM',
      });
    }
  }, [id, data.model, data.systemPrompt, nodes, edges, updateNode]);

  return (
    <div className="bg-[#2a2a2a] border-2 border-[#a855f7] rounded-xl shadow-2xl p-4 w-80 max-h-[600px] flex flex-col backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <div className="text-lg">🤖</div>
        <div className="font-semibold text-sm text-[#e5e5e5]">{data.label}</div>
      </div>

      {/* Model selector */}
      <div className="mb-3 flex-shrink-0">
        <label className="block text-xs font-medium mb-1 text-[#a3a3a3]">Model</label>
        <select
          value={data.model}
          onChange={handleModelChange}
          disabled={interactionMode === 'hand'}
          className="w-full p-2 bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg text-sm text-[#e5e5e5] focus:outline-none focus:border-[#a855f7] transition-colors nodrag disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {GEMINI_MODELS.map((model) => (
            <option key={model.id} value={model.id} className="bg-[#1a1a1a]">
              {model.name}
            </option>
          ))}
        </select>
      </div>

      {/* System prompt */}
      <div className="mb-3 flex-shrink-0">
        <label className="block text-xs font-medium mb-1 text-[#a3a3a3]">
          System Prompt (optional)
        </label>
        <textarea
          value={data.systemPrompt}
          onChange={handleSystemPromptChange}
          placeholder="Enter system instructions..."
          disabled={interactionMode === 'hand'}
          className="w-full h-20 p-3 bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg resize-none text-sm text-[#e5e5e5] placeholder-[#6b7280] focus:outline-none focus:border-[#a855f7] transition-colors nodrag disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Run button */}
      <button
        onClick={handleRun}
        disabled={data.isLoading || interactionMode === 'hand'}
        className="w-full px-4 py-2.5 bg-[#a855f7] text-white rounded-lg hover:bg-[#9333ea] transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-shrink-0"
      >
        {data.isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Running...
          </>
        ) : (
          'Run Model'
        )}
      </button>

      {/* Output/Error display - Scrollable and non-draggable */}
      {(data.output || data.error) && (
        <div className="mt-3 flex-1 min-h-0 overflow-hidden">
          {data.output && (
            <div className="h-full bg-[#1a1a1a] border border-[#06b6d4] rounded-lg flex flex-col">
              <div className="font-medium text-[#06b6d4] px-3 pt-3 pb-2 flex items-center gap-1 flex-shrink-0">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs">The generated text will appear here</span>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-3 nodrag">
                <div className="text-[#e5e5e5] text-xs whitespace-pre-wrap">{data.output}</div>
              </div>
            </div>
          )}

          {data.error && (
            <div className="h-full bg-[#1a1a1a] border border-red-500 rounded-lg p-3 overflow-y-auto nodrag">
              <div className="font-medium text-red-500 mb-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-xs">Error:</span>
              </div>
              <div className="text-red-400 text-xs">{data.error}</div>
            </div>
          )}
        </div>
      )}

      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-[#a855f7] border-2 border-[#2a2a2a]"
      />

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-[#a855f7] border-2 border-[#2a2a2a]"
      />
    </div>
  );
}

export default memo(LLMNode);
