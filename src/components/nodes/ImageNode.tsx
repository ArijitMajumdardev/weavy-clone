'use client';

import { memo, useCallback, ChangeEvent, useRef } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ImageNodeData } from '@/types/nodes';
import { useFlowStore } from '@/store/flowStore';

function ImageNode({ id, data }: NodeProps<ImageNodeData>) {
  const updateNode = useFlowStore((state) => state.updateNode);
  const interactionMode = useFlowStore((state) => state.interactionMode);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    // Convert to base64 for API
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;

      updateNode(id, {
        previewUrl,
        output: {
          url: previewUrl,
          base64,
          mimeType: file.type,
        },
      });
    };
    reader.readAsDataURL(file);
  }, [id, updateNode]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl shadow-2xl p-4 min-w-75 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-lg">🖼️</div>
        <div className="font-semibold text-sm text-[#e5e5e5]">{data.label}</div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={handleButtonClick}
        disabled={interactionMode === 'hand'}
        className="w-full mb-3 px-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] text-[#e5e5e5] rounded-lg hover:border-[#06b6d4] transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[#3a3a3a]"
      >
        {data.previewUrl ? 'Change Image' : 'Upload Image'}
      </button>

      {data.previewUrl && (
        <div className="border border-[#3a3a3a] rounded-lg overflow-hidden bg-[#1a1a1a]">
          <img
            src={data.previewUrl}
            alt="Preview"
            className="w-full h-32 object-cover"
          />
        </div>
      )}

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-[#06b6d4] border-2 border-[#2a2a2a]"
      />
    </div>
  );
}

export default memo(ImageNode);
