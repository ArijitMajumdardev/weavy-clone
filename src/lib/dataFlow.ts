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
