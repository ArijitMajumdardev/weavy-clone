"use client";

import { useCallback, useState, useEffect } from "react";
import { useReactFlow } from "reactflow";
import { useFlowStore } from "@/store/flowStore";
import { useHistoryStore } from "@/store/historyStore";
import { Hand, MousePointer2, Redo2, Undo2 } from "lucide-react";

export default function FloatingDock() {
  const { getZoom, setViewport, getViewport } = useReactFlow();
  const [zoom, setZoomLevel] = useState(100);
  const [showZoomMenu, setShowZoomMenu] = useState(false);

  const interactionMode = useFlowStore((state) => state.interactionMode);
  const setInteractionMode = useFlowStore((state) => state.setInteractionMode);
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const setNodes = useFlowStore((state) => state.setNodes);
  const setEdges = useFlowStore((state) => state.setEdges);

  const undo = useHistoryStore((state) => state.undo);
  const redo = useHistoryStore((state) => state.redo);
  const canUndo = useHistoryStore((state) => state.canUndo)();
  const canRedo = useHistoryStore((state) => state.canRedo)();

  useEffect(() => {
    const updateZoom = () => {
      const currentZoom = getZoom();
      setZoomLevel(Math.round(currentZoom * 100));
    };

    updateZoom();
    const interval = setInterval(updateZoom, 100);
    return () => clearInterval(interval);
  }, [getZoom]);

  const handleUndo = useCallback(() => {
    const currentState = { nodes, edges };
    const prevState = undo(currentState);
    if (prevState) {
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
    }
  }, [undo, nodes, edges, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    const currentState = { nodes, edges };
    const nextState = redo(currentState);
    if (nextState) {
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
    }
  }, [redo, nodes, edges, setNodes, setEdges]);

  const handleZoomChange = useCallback(
    (zoomLevel: number) => {
      const viewport = getViewport();
      setViewport({ ...viewport, zoom: zoomLevel / 100 });
      setShowZoomMenu(false);
    },
    [getViewport, setViewport]
  );

  const zoomLevels = [25, 50, 75, 100, 125, 150, 200];

  return (
    <div className="absolute -bottom-3 left-1/2 -translate-2/4 z-10">
      <div className="bg-[#232323] border border-[#3a3a3a] rounded-lg shadow-2xl px-2 py-2 flex items-center gap-1">
        <button
          onClick={() => setInteractionMode("cursor")}
          className={`p-1 cursor-pointer rounded-sm transition-all ${
            interactionMode === "cursor"
              ? "bg-accent text-[#1a1a1a]"
              : "text-[#e5e5e5] hover:bg-[#2a2a2a]"
          }`}
          title="Selection Mode"
        >
          <MousePointer2 strokeWidth={1} size={20} />
        </button>

        <button
          onClick={() => setInteractionMode("hand")}
          className={`p-1 cursor-pointer rounded-sm transition-all ${
            interactionMode === "hand"
              ? "bg-accent text-[#1a1a1a]"
              : "text-[#e5e5e5] hover:bg-[#2a2a2a]"
          }`}
          title="Pan Mode"
        >
          <Hand size={20} strokeWidth={1} />
        </button>

        <div className="w-px h-6 bg-[#3a3a3a]" />

        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className="p-0.5 text-[#e5e5e5] hover:bg-[#2a2a2a] rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent cursor-pointer"
          title="Undo"
        >
          <Undo2 size={25} strokeWidth={1} />
        </button>

        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className="p-0.5 text-[#e5e5e5] hover:bg-[#2a2a2a] rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent cursor-pointer"
          title="Redo"
        >
          <Redo2 size={25} strokeWidth={1} />
        </button>

        <div className="w-px h-6 bg-[#3a3a3a]" />

        <div className="relative">
          <button
            onClick={() => setShowZoomMenu(!showZoomMenu)}
            className="px-3  text-[#e5e5e5] hover:bg-[#2a2a2a] rounded-lg transition-all flex items-center gap-2 min-w-20"
          >
            <span className="text-sm font-medium">{zoom}%</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showZoomMenu && (
            <div className="absolute bottom-full mb-2 left-0 bg-[#232323] border border-[#3a3a3a] rounded-lg shadow-2xl py-1 min-w-25">
              {zoomLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => handleZoomChange(level)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-[#2a2a2a] transition-colors ${
                    zoom === level ? "text-[#a855f7]" : "text-[#e5e5e5]"
                  }`}
                >
                  {level}%
                </button>
              ))}
              <div className="border-t border-[#3a3a3a] my-1" />
              <button
                onClick={() => handleZoomChange(100)}
                className="w-full px-4 py-2 text-left text-sm text-[#e5e5e5] hover:bg-[#2a2a2a] transition-colors"
              >
                Fit to screen
              </button>
            </div>
          )}
        </div>
      </div>

      {showZoomMenu && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setShowZoomMenu(false)}
        />
      )}
    </div>
  );
}
