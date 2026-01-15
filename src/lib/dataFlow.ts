import { FlowNode, FlowEdge } from "@/types/flow";

export interface AggregatedInput {
  type: "text" | "image";
  content: string;
}

export const aggregateNodeInputs = (
  targetNodeId: string,
  nodes: FlowNode[],
  edges: FlowEdge[]
): AggregatedInput[] => {
  const inputs: AggregatedInput[] = [];

  const incomingEdges = edges.filter((edge) => edge.target === targetNodeId);

  for (const edge of incomingEdges) {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    if (!sourceNode) continue;

    const data = sourceNode.data;

    if (data.type === "textNode") {
      if (data.output) {
        inputs.push({
          type: "text",
          content: data.output,
        });
      }
    } else if (data.type === "imageNode") {
      if (data.output?.base64) {
        inputs.push({
          type: "image",
          content: data.output.base64,
        });
      }
    } else if (data.type === "llmNode") {
      if (data.output) {
        inputs.push({
          type: "text",
          content: data.output,
        });
      }
    }
  }

  return inputs;
};

export const validateNodeInputs = (inputs: AggregatedInput[]): boolean => {
  return inputs.length > 0;
};

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

  const incomingEdges = edges.filter((edge) => edge.target === targetNodeId);

  for (const edge of incomingEdges) {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    if (!sourceNode) continue;

    const data = sourceNode.data;
    let input: AggregatedInput | null = null;

    if (data.type === "textNode" && data.output) {
      input = {
        type: "text",
        content: data.output,
      };
    } else if (data.type === "imageNode" && data.output?.base64) {
      input = {
        type: "image",
        content: data.output.base64,
      };
    } else if (data.type === "llmNode" && data.output) {
      input = {
        type: "text",
        content: data.output,
      };
    }

    if (!input) continue;

    const targetHandle = edge.targetHandle;

    if (targetHandle === "system_prompt") {
      if (input.type === "text") {
        result.systemPrompt = input;
      }
    } else if (targetHandle === "user_message") {
      if (input.type === "text") {
        result.userMessage = input;
      }
    } else if (targetHandle?.startsWith("images_")) {
      if (input.type === "image") {
        result.images.push(input);
      }
    }
  }

  return result;
};
