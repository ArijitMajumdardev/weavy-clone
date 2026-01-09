'use client';

import { useCallback, useState, useEffect } from 'react';
import { useReactFlow } from 'reactflow';
import { useFlowStore } from '@/store/flowStore';
import { useHistoryStore } from '@/store/historyStore';

export default function FloatingDock() {
  const { getZoom, setViewport, getViewport } = useReactFlow();
  const [zoom, setZoomLevel] = useState(100);
  const [showZoomMenu, setShowZoomMenu] = useState(false);

  const interactionMode = useFlowStore((state) => state.interactionMode);
  const setInteractionMode = useFlowStore((state) => state.setInteractionMode);
  const setNodes = useFlowStore((state) => state.setNodes);
  const setEdges = useFlowStore((state) => state.setEdges);

  const undo = useHistoryStore((state) => state.undo);
  const redo = useHistoryStore((state) => state.redo);
  const canUndo = useHistoryStore((state) => state.canUndo)();
  const canRedo = useHistoryStore((state) => state.canRedo)();

  // Update zoom level display
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
    const prevState = undo();
    if (prevState) {
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
    }
  }, [undo, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
    }
  }, [redo, setNodes, setEdges]);

  const handleZoomChange = useCallback((zoomLevel: number) => {
    const viewport = getViewport();
    setViewport({ ...viewport, zoom: zoomLevel / 100 });
    setShowZoomMenu(false);
  }, [getViewport, setViewport]);

  const zoomLevels = [25, 50, 75, 100, 125, 150, 200];

  return (
    <div className="absolute -bottom-5 left-1/2 -translate-2/3 z-10">
      <div className="bg-[#232323] border border-[#3a3a3a] rounded-lg shadow-2xl px-2 py-1 flex items-center gap-2">
        {/* Cursor Mode */}
        <button
          onClick={() => setInteractionMode('cursor')}
          className={`p-1.5 rounded-lg transition-all ${
            interactionMode === 'cursor'
              ? 'bg-[#fef08a] text-[#1a1a1a]'
              : 'text-[#e5e5e5] hover:bg-[#2a2a2a]'
          }`}
          title="Selection Mode"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        </button>

        {/* Hand Mode */}
        <button
          onClick={() => setInteractionMode('hand')}
          className={`p-2.5 rounded-lg transition-all ${
            interactionMode === 'hand'
              ? 'bg-[#fef08a] text-[#1a1a1a]'
              : 'text-[#e5e5e5] hover:bg-[#2a2a2a]'
          }`}
          title="Pan Mode"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 3a1 1 0 012 0v5.5a.5.5 0 001 0V4a1 1 0 112 0v4.5a.5.5 0 001 0V6a1 1 0 112 0v5a7 7 0 11-14 0V9a1 1 0 012 0v2.5a.5.5 0 001 0V4a1 1 0 012 0v4.5a.5.5 0 001 0V3z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-[#3a3a3a]" />

        {/* Undo */}
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className="p-2.5 text-[#e5e5e5] hover:bg-[#2a2a2a] rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          title="Undo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>

        {/* Redo */}
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className="p-2.5 text-[#e5e5e5] hover:bg-[#2a2a2a] rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          title="Redo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-[#3a3a3a]" />

        {/* Zoom */}
        <div className="relative">
          <button
            onClick={() => setShowZoomMenu(!showZoomMenu)}
            className="px-3 py-1.5 text-[#e5e5e5] hover:bg-[#2a2a2a] rounded-lg transition-all flex items-center gap-2 min-w-[80px]"
          >
            <span className="text-sm font-medium">{zoom}%</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Zoom Dropdown */}
          {showZoomMenu && (
            <div className="absolute bottom-full mb-2 left-0 bg-[#232323] border border-[#3a3a3a] rounded-lg shadow-2xl py-1 min-w-[100px]">
              {zoomLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => handleZoomChange(level)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-[#2a2a2a] transition-colors ${
                    zoom === level ? 'text-[#a855f7]' : 'text-[#e5e5e5]'
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

      {/* Click outside to close zoom menu */}
      {showZoomMenu && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setShowZoomMenu(false)}
        />
      )}
    </div>
  );
}
