'use client';

import { memo, useCallback, ChangeEvent, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { TextNodeData } from '@/types/nodes';
import { useFlowStore } from '@/store/flowStore';

function TextNode({ id, data }: NodeProps<TextNodeData>) {
  const updateNode = useFlowStore((state) => state.updateNode);
  const interactionMode = useFlowStore((state) => state.interactionMode);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleContentChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
     resizeTextarea();
    updateNode(id, { content, output: content });
  }, [id, updateNode]);

   // Resize on mount & when content changes externally
  useEffect(() => {
    resizeTextarea();
  }, [data.content]);

  return (
    <div className="bg-primary min-h-30 rounded-lg shadow-2xl px-2.5 pt-3 pb-1.5 min-w-75 backdrop-blur-sm group">
      <div className="flex items-center gap-2 mb-2 ">
        <div className="font-normal text-xs text-[#e5e5e5]">{data.label}</div>
      </div>

      <textarea
        ref={textareaRef}
        value={data.content}
        onChange={handleContentChange}
        placeholder="Enter text..."
        disabled={interactionMode === 'hand'}
        className="w-full min-h-30 overflow-hidden p-3 bg-primary2 border border-[#3a3a3a] rounded-md resize-none text-sm text-[#e5e5e5] placeholder-[#6b7280] focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {/* Output handle */}
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

export default memo(TextNode);
