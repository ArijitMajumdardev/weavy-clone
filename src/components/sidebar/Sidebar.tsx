'use client';

import { useState } from 'react';
import NodeButton from './NodeButton';
import { NODE_TYPES, NODE_LABELS } from '@/constants/nodeTypes';
import { useHistoryStore } from '@/store/historyStore';
import { useFlowStore } from '@/store/flowStore';

type TabType = 'nodes' | 'history';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('nodes');
  const [searchQuery, setSearchQuery] = useState('');

  const past = useHistoryStore((state) => state.past);
  const nodes = useFlowStore((state) => state.nodes);

  const nodeTypes = [
    { type: NODE_TYPES.TEXT_NODE, label: NODE_LABELS[NODE_TYPES.TEXT_NODE], icon: '📝' },
    { type: NODE_TYPES.IMAGE_NODE, label: NODE_LABELS[NODE_TYPES.IMAGE_NODE], icon: '🖼️' },
    { type: NODE_TYPES.LLM_NODE, label: NODE_LABELS[NODE_TYPES.LLM_NODE], icon: '🤖' },
  ];

  const filteredNodes = nodeTypes.filter(node =>
    node.label.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const filteredHistory = past.filter((_, index) =>
    `Action ${past.length - index}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

 
  return (
    <div className='flex'>
      
      
      <div className="w-12 bg-[#232323] border-r border-[#3a3a3a] flex flex-col gap-4 overflow-y-auto p-2">
        {/* Nodes Icon */}
        <button
          onClick={() => {
            setIsCollapsed(false);
            setActiveTab('nodes');
          }}
          className={`p-2 rounded-lg transition-colors ${
            activeTab === 'nodes' && !isCollapsed
              ? 'bg-[#a855f7] text-white'
              : 'text-[#e5e5e5] hover:bg-[#2a2a2a]'
          }`}
          title="Nodes"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
          </svg>
        </button>

        {/* History Icon */}
        <button
          onClick={() => {
            setIsCollapsed(false);
            setActiveTab('history');
          }}
          className={`p-2 rounded-lg transition-colors ${
            activeTab === 'history' && !isCollapsed
              ? 'bg-[#a855f7] text-white'
              : 'text-[#e5e5e5] hover:bg-[#2a2a2a]'
          }`}
          title="History"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
      
    
      {!isCollapsed &&
        <div className="w-72 bg-[#232323] border-r border-[#3a3a3a] flex flex-col overflow-hidden">


          {/* Tabs */}
          <div className="flex border-b border-[#3a3a3a] flex-shrink-0">
            <button
              onClick={() => setActiveTab('nodes')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'nodes'
                ? 'text-[#a855f7] border-b-2 border-[#a855f7] bg-[#2a2a2a]'
                : 'text-[#a3a3a3] hover:text-[#e5e5e5] hover:bg-[#2a2a2a]'
                }`}
            >
              Nodes
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'history'
                ? 'text-[#a855f7] border-b-2 border-[#a855f7] bg-[#2a2a2a]'
                : 'text-[#a3a3a3] hover:text-[#e5e5e5] hover:bg-[#2a2a2a]'
                }`}
            >
              History
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            {/* Search Bar */}
            <div className="relative flex-shrink-0">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280] pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder={activeTab === 'nodes' ? 'Search nodes...' : 'Search history...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg pl-10 pr-4 py-2 text-sm text-[#e5e5e5] placeholder-[#6b7280] focus:outline-none focus:border-[#a855f7] transition"
              />
            </div>

            {/* Nodes Tab Content */}
            {activeTab === 'nodes' && (
              <div>
                <h3 className="text-sm font-semibold text-[#e5e5e5] mb-4">Quick access</h3>
                <div className="grid grid-cols-2 gap-3">
                  {filteredNodes.map((node) => (
                    <NodeButton
                      key={node.type}
                      type={node.type}
                      label={node.label}
                      icon={node.icon}
                    />
                  ))}
                </div>
                {filteredNodes.length === 0 && (
                  <p className="text-sm text-[#6b7280] text-center py-8">No nodes found</p>
                )}
              </div>
            )}

            {/* History Tab Content */}
            {activeTab === 'history' && (
              <div>
                <h3 className="text-sm font-semibold text-[#e5e5e5] mb-4">Recent actions</h3>
                <div className="flex flex-col gap-2">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.slice(-10).reverse().map((state, index) => (
                      <div
                        key={index}
                        className="p-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg hover:border-[#a855f7] transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-4 h-4 text-[#06b6d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs font-medium text-[#e5e5e5]">
                            Action {filteredHistory.length - index}
                          </span>
                        </div>
                        <p className="text-xs text-[#a3a3a3]">
                          {state.nodes.length} node{state.nodes.length !== 1 ? 's' : ''}, {state.edges.length} edge{state.edges.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#6b7280] text-center py-8">
                      {searchQuery ? 'No history found' : 'No actions yet'}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>}
    </div>
  )
}
