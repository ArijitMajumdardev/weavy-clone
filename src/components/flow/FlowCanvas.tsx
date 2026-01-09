'use client';

import { useCallback, DragEvent } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import TextNode from '@/components/nodes/TextNode';
import ImageNode from '@/components/nodes/ImageNode';
import LLMNode from '@/components/nodes/LLMNode';
import CustomEdge from './CustomEdge';
import FloatingDock from './FloatingDock';

import { useFlowStore } from '@/store/flowStore';
import { useHistoryStore } from '@/store/historyStore';
import { createTextNode, createImageNode, createLLMNode } from '@/lib/nodeUtils';

const nodeTypes = {
  textNode: TextNode,
  imageNode: ImageNode,
  llmNode: LLMNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

export default function FlowCanvas() {
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const interactionMode = useFlowStore((state) => state.interactionMode);
  const setNodes = useFlowStore((state) => state.setNodes);
  const setEdges = useFlowStore((state) => state.setEdges);
  const addNode = useFlowStore((state) => state.addNode);
  const pushState = useHistoryStore((state) => state.pushState);

  // Save state for undo/redo before changes
  const saveStateForHistory = useCallback(() => {
    pushState({ nodes, edges });
  }, [nodes, edges, pushState]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      saveStateForHistory();
      setNodes(applyNodeChanges(changes, nodes));
    },
    [nodes, setNodes, saveStateForHistory]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      saveStateForHistory();
      setEdges(applyEdgeChanges(changes, edges));
    },
    [edges, setEdges, saveStateForHistory]
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      saveStateForHistory();
      const edge = {
        ...connection,
        id: `${connection.source}-${connection.target}`,
        type: 'custom',
        animated: true,
      };
      setEdges(addEdge(edge, edges));
    },
    [edges, setEdges, saveStateForHistory]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      let newNode;
      if (type === 'textNode') {
        newNode = createTextNode(position);
      } else if (type === 'imageNode') {
        newNode = createImageNode(position);
      } else if (type === 'llmNode') {
        newNode = createLLMNode(position);
      }

      if (newNode) {
        saveStateForHistory();
        addNode(newNode);
      }
    },
    [saveStateForHistory, addNode]
  );

  return (
    <div className="w-full h-full real">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Control"
        panOnDrag={interactionMode === 'hand'}
        nodesDraggable={interactionMode === 'cursor'}
        nodesConnectable={interactionMode === 'cursor'}
        elementsSelectable={interactionMode === 'cursor'}
        defaultEdgeOptions={{
          style: { stroke: '#a855f7', strokeWidth: 2 },
          animated: true,
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color="#3a3a3a"
          style={{ backgroundColor: 'black' }}
        />
        {/* <Controls className="bg-[#232323] border border-[#3a3a3a]" /> */}
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'llmNode') return '#a855f7';
            if (node.type === 'imageNode') return '#06b6d4';
            return '#6b7280';
          }}
          className="bg-[#232323] border border-[#3a3a3a]"
          maskColor="rgba(26, 26, 26, 0.8)"
        />
        <FloatingDock />
      </ReactFlow>
    </div>
  );
}
