"use client";

import {
  memo,
  useCallback,
  ChangeEvent,
  useRef,
  useEffect,
  useState,
} from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { TextNodeData } from "@/types/nodes";
import { useFlowStore } from "@/store/flowStore";
import { MoreHorizontal, Trash2 } from "lucide-react";

function TextNode({ id, data, selected }: NodeProps<TextNodeData>) {
  const updateNode = useFlowStore((state) => state.updateNode);
  const deleteNode = useFlowStore((state) => state.deleteNode);
  const interactionMode = useFlowStore((state) => state.interactionMode);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showMenu, setShowMenu] = useState(false);

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleContentChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const content = e.target.value;
      resizeTextarea();
      updateNode(id, { content, output: content });
    },
    [id, updateNode]
  );

  useEffect(() => {
    resizeTextarea();
  }, [data.content]);

  return (
    <div
      className={` min-h-30 rounded-lg shadow-2xl px-2.5 pt-3 pb-1.5 min-w-75 backdrop-blur-sm group relative ${
        selected ? "bg-[#2b2b2f]" : "bg-primary"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="font-normal text-xs text-[#e5e5e5]">{data.label}</div>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className=" p-1 hover:bg-[#2a2a2a] rounded"
          >
            <MoreHorizontal size={14} className="text-[#9ca3af]" />
          </button>

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

      <textarea
        ref={textareaRef}
        value={data.content}
        onChange={handleContentChange}
        placeholder="Enter text..."
        disabled={interactionMode === "hand"}
        className="w-full min-h-30 overflow-hidden p-3 bg-primary2 border border-[#3a3a3a] rounded-md resize-none text-sm text-[#e5e5e5] placeholder-[#6b7280] focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      />

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-[#f1a1fb] border-2 border-[#2a2a2a]"
        isConnectable={true}
      />
      <div
        className="absolute -right-9 top-[48%] text-xs text-[#f1a1fb] opacity-0 group-hover:opacity-100
    transition-opacity duration-150
"
      >
        Text
      </div>
    </div>
  );
}

export default memo(TextNode);
