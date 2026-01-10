'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { Handle, Position, NodeProps, useUpdateNodeInternals } from 'reactflow';
import { LLMNodeData } from '@/types/nodes';
import { useFlowStore } from '@/store/flowStore';
import { aggregateNodeInputsByHandle } from '@/lib/dataFlow';
import { LLMRequest, LLMResponse } from '@/types/api';

const COLLAPSED_HEIGHT = 260;

function LLMNode({ id, data }: NodeProps<LLMNodeData>) {
  const updateNode = useFlowStore((state) => state.updateNode);
  const interactionMode = useFlowStore((state) => state.interactionMode);
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const updateNodeInternals = useUpdateNodeInternals();

  const outputRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedHeight, setExpandedHeight] = useState<number>(COLLAPSED_HEIGHT);

  const imageInputs = data.imageInputs ?? 1;

  /* ---------------- RUN MODEL ---------------- */

  const handleRun = useCallback(async () => {
    const { systemPrompt, userMessage, images } =
      aggregateNodeInputsByHandle(id, nodes, edges);

    if (!userMessage) {
      updateNode(id, { error: 'Prompt is required' });
      return;
    }

    updateNode(id, { isLoading: true, error: null, output: null });

    try {
      const requestBody: LLMRequest = {
        model: data.model,
        systemPrompt: systemPrompt?.content,
        inputs: [userMessage, ...images],
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
        updateNode(id, {
          isLoading: false,
          error: result.error || 'Unknown error',
        });
      }
    } catch (err) {
      updateNode(id, {
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to run model',
      });
    }
  }, [id, data.model, nodes, edges, updateNode]);

  /* ---------------- EXPAND OUTPUT ---------------- */

  useEffect(() => {
    if (outputRef.current && isExpanded) {
      setExpandedHeight(outputRef.current.scrollHeight + 24);
    }
  }, [isExpanded, data.output]);

  /* ---------------- ADD IMAGE INPUT ---------------- */

  const handleAddImageInput = () => {
    const newCount = imageInputs + 1;
    updateNode(id, {
      imageInputs: newCount,
    });
    // Tell ReactFlow to re-scan and register the new handles
    setTimeout(() => {
      updateNodeInternals(id);
    }, 0);
  };

  return (
    <div className="bg-primary rounded-xl shadow-2xl w-[360px] backdrop-blur-sm relative group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="text-xs font-normal text-white">Any LLM</div>
        <div className="text-[#9ca3af] cursor-pointer">⋯</div>
      </div>

      {/* Output */}
      <div className="px-4 pb-4 pt-2 relative">
        <div
          className={`group rounded-lg min-h-70 ${isExpanded ? 'overflow-visible' : 'overflow-auto'}`}
          style={{ height: isExpanded ? expandedHeight : COLLAPSED_HEIGHT }}
        >
          <div
            ref={outputRef}
            className={`
              bg-primary2
              rounded-lg
              border border-[#3a3a3a]
              p-3
              text-sm
              text-[#9ca3af]
              nodrag
              transition-[height]
              duration-200
              min-h-70
              ${isExpanded ? 'overflow-visible' : 'overflow-hidden'}
            `}
          >
            {data.isLoading
              ? 'Running model...'
              : data.output || 'The generated text will appear here'}
          </div>

          {!isExpanded && data.output && (
            <button
              onClick={() => setIsExpanded(true)}
              className="
                absolute bottom-4 left-1/2 -translate-x-1/2
                px-2.5 py-1 text-xs rounded-md
                bg-[#2a2a2a] border border-[#3a3a3a]
                text-white opacity-0 group-hover:opacity-100
                transition-opacity
              "
            >
              Show more
            </button>
          )}
          {isExpanded && data.output && (
            <button
              onClick={() => setIsExpanded(false)}
              className="
                absolute bottom-4 left-1/2 -translate-x-1/2
                px-2.5 py-1 text-xs rounded-md
                bg-[#2a2a2a] border border-[#3a3a3a]
                text-white opacity-0 group-hover:opacity-100
                transition-opacity
              "
            >
              Show less
            </button>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex items-center justify-between px-4 pb-3 text-xs text-[#9ca3af]">
        <button
          onClick={handleAddImageInput}
          disabled={interactionMode === 'hand'}
          className="hover:text-white transition-colors hover:bg-primary2 p-1.5 rounded-md"
        >
          + Add another image input
        </button>

        <button
          onClick={handleRun}
          disabled={data.isLoading || interactionMode === 'hand'}
          className="
            px-3 py-1.5 rounded-md
            border border-[#3a3a3a]
            text-white hover:bg-[#2a2a2a]
            transition-colors disabled:opacity-50
          "
        >
          → Run Model
        </button>
      </div>

      {/* ---------------- INPUT HANDLES ---------------- */}

      {/* Prompt */}
      <Handle
        type="target"
        position={Position.Left}
        id="user_message"
        style={{ top: '26%' }}
        className="w-3 h-3 bg-[#f1a1fb] border-2 border-[#2a2a2a]"
        isConnectable={true}
      />
      <div className="absolute left-[-88px] opacity-0 group-hover:opacity-100
    transition-opacity duration-150
 top-[24%] text-xs text-[#f1a1fb]">
        Prompt*
      </div>

      {/* System Prompt */}
      <Handle
        type="target"
        position={Position.Left}
        id="system_prompt"
        style={{ top: '38%' }}
        className="w-3 h-3 bg-[#f1a1fb] border-2 border-[#2a2a2a]"
        isConnectable={true}
      />
      <div className="absolute left-[-110px] top-[36%] text-xs text-[#f1a1fb] opacity-0 group-hover:opacity-100
    transition-opacity duration-150
">
        System Prompt
      </div>

      {/* Dynamic Image Inputs */}
      {Array.from({ length: imageInputs }).map((_, index) => {
        const top = 50 + index * 10;

        return (
          <div key={`image-input-${index}`}>
            <Handle
              type="target"
              position={Position.Left}
              id={`images_${index}`}
              style={{ top: `${top}%` }}
              className="w-3 h-3 bg-[#22c55e] border-2 border-[#2a2a2a]"
              isConnectable={true}
            />
            <div
              className="absolute left-[-70px] text-xs text-[#6dd6af] opacity-0 group-hover:opacity-100
    transition-opacity duration-150
"
              style={{ top: `${top - 2}%` }}
            >
              Image {index + 1}
            </div>
          </div>
        );
      })}

      {/* Output */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-[#f1a1fb] border-2 border-[#2a2a2a]"
        isConnectable={true}
      />
      <div className="absolute right-[-36px] top-[48%] text-xs text-[#f1a1fb] opacity-0 group-hover:opacity-100
    transition-opacity duration-150
">
        Text
      </div>
    </div>
  );
}

export default LLMNode;
