'use client';

import { memo, useCallback, ChangeEvent } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { TextNodeData } from '@/types/nodes';
import { useFlowStore } from '@/store/flowStore';

function TextNode({ id, data }: NodeProps<TextNodeData>) {
  const updateNode = useFlowStore((state) => state.updateNode);
  const interactionMode = useFlowStore((state) => state.interactionMode);

  const handleContentChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    updateNode(id, { content, output: content });
  }, [id, updateNode]);

  return (
    <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl shadow-2xl p-4 min-w-[300px] backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-lg">📝</div>
        <div className="font-semibold text-sm text-[#e5e5e5]">{data.label}</div>
      </div>

      <textarea
        value={data.content}
        onChange={handleContentChange}
        placeholder="Enter text..."
        disabled={interactionMode === 'hand'}
        className="w-full h-24 p-3 bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg resize-none text-sm text-[#e5e5e5] placeholder-[#6b7280] focus:outline-none focus:border-[#06b6d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-[#06b6d4] border-2 border-[#2a2a2a]"
      />
    </div>
  );
}

export default memo(TextNode);
