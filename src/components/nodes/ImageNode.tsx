"use client";

import { memo, useCallback, ChangeEvent, useRef, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { ImageNodeData } from "@/types/nodes";
import { useFlowStore } from "@/store/flowStore";
import { Upload, MoreVertical, Trash2, MoreHorizontal } from "lucide-react";

function ImageNode({ id, data, selected }: NodeProps<ImageNodeData>) {
  const updateNode = useFlowStore((state) => state.updateNode);
  const deleteNode = useFlowStore((state) => state.deleteNode);
  const interactionMode = useFlowStore((state) => state.interactionMode);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const previewUrl = URL.createObjectURL(file);

      const img = new Image();
      img.onload = () => {
        setAspectRatio(img.naturalHeight / img.naturalWidth);
      };
      img.src = previewUrl;

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
    },
    [id, updateNode]
  );

  const openFilePicker = () => {
    if (interactionMode === "hand") return;
    fileInputRef.current?.click();
  };

  return (
    <div
      className={` rounded-lg shadow-2xl px-2.5 pt-3 pb-1.5 w-100 backdrop-blur-sm group relative ${
        selected ? "bg-[#2b2b2f]" : "bg-primary"
      }`}
      style={{
        height: aspectRatio ? `${400 * aspectRatio + 40}px` : '480px'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="font-normal text-xs text-[#e5e5e5]">{data.label}</div>

        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className=" p-1 hover:bg-[#2a2a2a] rounded "
          >
            <MoreHorizontal size={14} className="text-[#9ca3af]" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-6 z-20 bg-[#1a1a1a] border border-[#3a3a3a] rounded-md shadow-lg py-1 min-w-40">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNode(id);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-[#2a2a2a] flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Delete node
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={interactionMode === "hand"}
      />

      {/* Drop zone / Preview */}
      <div
        onClick={openFilePicker}
        className="
          relative
          w-full
          h-[calc(100%-2.5rem)]
          rounded-md
          border border-[#3a3a3a]/50
          bg-[linear-gradient(45deg,#1f1f1f_25%,transparent_25%),linear-gradient(-45deg,#1f1f1f_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1f1f1f_75%),linear-gradient(-45deg,transparent_75%,#1f1f1f_75%)]
          bg-size-[20px_20px]
          bg-position-[0_0,0_10px,10px_-10px,-10px_0px]
          flex items-center justify-center
          cursor-pointer
          overflow-hidden
        "
      >
        {!data.previewUrl && (
          <div className="flex flex-col items-center gap-2 text-white text-xs w-full ">
            <Upload size={18} strokeWidth={1.5} />
            <span>Drag & drop or click to upload</span>
          </div>
        )}

        {data.previewUrl && (
          <img
            src={data.previewUrl}
            alt="Preview"
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-[#06b6d4] border-2 border-[#2a2a2a]"
        isConnectable={true}
      />
      <div
        className="absolute -right-9 top-[48%] text-xs text-[#6dd6af] opacity-0 group-hover:opacity-100
    transition-opacity duration-150
"
      >
        File
      </div>
    </div>
  );
}

export default memo(ImageNode);
