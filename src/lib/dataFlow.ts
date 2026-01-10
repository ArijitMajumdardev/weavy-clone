import { FlowNode, FlowEdge } from '@/types/flow';

export interface AggregatedInput {
  type: 'text' | 'image';
  content: string;
}

/**
 * Aggregates all inputs connected to a target node
 * Traverses edges to find source nodes and extracts their outputs
 */
export const aggregateNodeInputs = (
  targetNodeId: string,
  nodes: FlowNode[],
  edges: FlowEdge[]
): AggregatedInput[] => {
  const inputs: AggregatedInput[] = [];

  // Find all edges pointing to this node
  const incomingEdges = edges.filter(edge => edge.target === targetNodeId);

  // For each incoming edge, get the source node's output
  for (const edge of incomingEdges) {
    const sourceNode = nodes.find(n => n.id === edge.source);
    if (!sourceNode) continue;

    const data = sourceNode.data;

    if (data.type === 'textNode') {
      if (data.output) {
        inputs.push({
          type: 'text',
          content: data.output,
        });
      }
    } else if (data.type === 'imageNode') {
      if (data.output?.base64) {
        inputs.push({
          type: 'image',
          content: data.output.base64, // Base64 encoded image
        });
      }
    } else if (data.type === 'llmNode') {
      if (data.output) {
        inputs.push({
          type: 'text',
          content: data.output,
        });
      }
    }
  }

  return inputs;
};

/**
 * Validates that a node has all required inputs
 */
export const validateNodeInputs = (inputs: AggregatedInput[]): boolean => {
  return inputs.length > 0;
};

/**
 * Aggregates inputs for LLM nodes based on handle-specific connections
 * Returns inputs organized by handle type: system_prompt, user_message, images
 */
export const aggregateNodeInputsByHandle = (
  targetNodeId: string,
  nodes: FlowNode[],
  edges: FlowEdge[]
): {
  systemPrompt: AggregatedInput | null;
  userMessage: AggregatedInput | null;
  images: AggregatedInput[];
} => {
  const result = {
    systemPrompt: null as AggregatedInput | null,
    userMessage: null as AggregatedInput | null,
    images: [] as AggregatedInput[],
  };

  // Find all edges pointing to this node
  const incomingEdges = edges.filter(edge => edge.target === targetNodeId);

  // Process each incoming edge based on its target handle
  for (const edge of incomingEdges) {
    const sourceNode = nodes.find(n => n.id === edge.source);
    if (!sourceNode) continue;

    const data = sourceNode.data;
    let input: AggregatedInput | null = null;

    // Extract output from source node
    if (data.type === 'textNode' && data.output) {
      input = {
        type: 'text',
        content: data.output,
      };
    } else if (data.type === 'imageNode' && data.output?.base64) {
      input = {
        type: 'image',
        content: data.output.base64,
      };
    } else if (data.type === 'llmNode' && data.output) {
      input = {
        type: 'text',
        content: data.output,
      };
    }

    if (!input) continue;

    // Route to appropriate handle based on targetHandle
    const targetHandle = edge.targetHandle;

    if (targetHandle === 'system_prompt') {
      // System prompt - only accepts text, takes the last one if multiple
      if (input.type === 'text') {
        result.systemPrompt = input;
      }
    } else if (targetHandle === 'user_message') {
      // User message - only accepts text, takes the last one if multiple
      if (input.type === 'text') {
        result.userMessage = input;
      }
    } else if (targetHandle?.startsWith('images_')) {
      // Images - accepts multiple image inputs (handles: images_0, images_1, etc.)
      if (input.type === 'image') {
        result.images.push(input);
      }
    }
  }

  return result;
};
