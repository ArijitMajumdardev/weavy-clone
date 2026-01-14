'use client';

import { useCallback, DragEvent, useEffect } from 'react';
import ReactFlow, {
  Background,
  MiniMap,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  BackgroundVariant,
  ConnectionMode,
  useReactFlow,
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

  const { zoomIn, zoomOut, setViewport, getViewport } = useReactFlow();

  // Handle Ctrl+Plus/Minus for canvas zoom
  useEffect(() => {
    const handleZoomShortcut = (event: KeyboardEvent) => {
      // Check for Ctrl/Cmd + Plus/Minus (or Ctrl/Cmd + =)
      if (event.ctrlKey || event.metaKey) {
        if (event.key === '+' || event.key === '=') {
          event.preventDefault();
          zoomIn({ duration: 200 });
        } else if (event.key === '-') {
          event.preventDefault();
          zoomOut({ duration: 200 });
        } else if (event.key === '0') {
          // Ctrl+0 to reset zoom to 100%
          event.preventDefault();
          const viewport = getViewport();
          setViewport({ ...viewport, zoom: 1 });
        }
      }
    };

    window.addEventListener('keydown', handleZoomShortcut);
    return () => window.removeEventListener('keydown', handleZoomShortcut);
  }, [zoomIn, zoomOut, getViewport, setViewport]);

  // Save state for undo/redo before changes
  const saveStateForHistory = useCallback(() => {
    pushState({ nodes, edges });
  }, [nodes, edges, pushState]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      // Determine if we should save history BEFORE applying changes
      // Only save history for meaningful changes, not selection or dimensions
      const shouldSaveHistory = changes.some((change) => {
        // Explicitly ignore all select changes
        if (change.type === 'select') {
          return false;
        }
        // Explicitly ignore dimension changes
        if (change.type === 'dimensions') {
          return false;
        }
        // For position changes, only save when drag ends
        // dragging must be explicitly false (not undefined, not true)
        if (change.type === 'position') {
          return change.dragging === false;
        }
        // Save history for remove changes (node deletion)
        if (change.type === 'remove') {
          return true;
        }
        // Ignore add (handled in onDrop), reset, and any other changes
        return false;
      });

      // Save the current state BEFORE applying changes
      if (shouldSaveHistory) {
        saveStateForHistory();
      }

      // Now apply the changes
      setNodes(applyNodeChanges(changes, nodes));
    },
    [nodes, setNodes, saveStateForHistory]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      // Determine if we should save history BEFORE applying changes
      // Only save history for meaningful changes, not selection
      const shouldSaveHistory = changes.some((change) => {
        // Explicitly ignore all select changes
        if (change.type === 'select') {
          return false;
        }
        // Save history for add and remove changes
        if (change.type === 'add' || change.type === 'remove') {
          return true;
        }
        // Ignore reset and other UI-only changes
        return false;
      });

      // Save the current state BEFORE applying changes
      if (shouldSaveHistory) {
        saveStateForHistory();
      }

      // Now apply the changes
      setEdges(applyEdgeChanges(changes, edges));
    },
    [edges, setEdges, saveStateForHistory]
  );

  const isValidConnection = useCallback(
    (connection: any) => {
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);

      if (!sourceNode || !targetNode) return false;

      const sourceType = sourceNode.type;
      const targetType = targetNode.type;
      const targetHandle = connection.targetHandle;

      // Rule 1: Image node can ONLY connect to image inputs (images_0, images_1, etc.)
      if (sourceType === 'imageNode') {
        if (!targetHandle?.startsWith('images_')) {
          return false; // Image node cannot connect to text inputs
        }
      }

      // Rule 2: Text node can ONLY connect to text inputs (user_message, system_prompt)
      if (sourceType === 'textNode') {
        if (targetHandle?.startsWith('images_')) {
          return false; // Text node cannot connect to image inputs
        }
      }

      // Rule 3: LLM node output can ONLY connect to another LLM node's text inputs
      if (sourceType === 'llmNode') {
        if (targetType !== 'llmNode') {
          return false; // LLM node can only connect to another LLM node
        }
        if (targetHandle?.startsWith('images_')) {
          return false; // LLM node cannot connect to image inputs
        }
      }

      return true;
    },
    [nodes]
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      saveStateForHistory();

      // Find the source node to determine its type
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const sourceType = sourceNode?.type;

      // Check if this is an image input handle on LLM node
      // Only one connection allowed per image input handle
      let updatedEdges = edges;
      if (connection.targetHandle?.startsWith('images_')) {
        // Remove any existing edge connected to this specific image input handle
        updatedEdges = edges.filter(
          (edge) =>
            !(
              edge.target === connection.target &&
              edge.targetHandle === connection.targetHandle
            )
        );
      }

      const edge = {
        ...connection,
        id: `${connection.source}-${connection.sourceHandle || 'default'}-${connection.target}-${connection.targetHandle || 'default'}`,
        type: 'custom',
        animated: false,
        data: {
          sourceType,
        },
      };
      setEdges(addEdge(edge, updatedEdges));
    },
    [edges, nodes, setEdges, saveStateForHistory]
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
        minZoom={0.1}
        deleteKeyCode={['Delete', 'Backspace']}
        multiSelectionKeyCode="Control"
        connectionMode={ConnectionMode.Loose}
        isValidConnection={isValidConnection}
        panOnDrag={interactionMode === 'hand'}
        nodesDraggable={interactionMode === 'cursor'}
        nodesConnectable={interactionMode === 'cursor'}
        elementsSelectable={interactionMode === 'cursor'}
        edgesFocusable={interactionMode === 'cursor'}
        connectOnClick={false}
        defaultEdgeOptions={{
          style: { stroke: '#f1a1fb', strokeWidth: 2 },
          animated: false,
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
