export type NodeType = 'textNode' | 'imageNode' | 'llmNode';

export interface BaseNodeData {
  id: string;
  label: string;
}

export interface TextNodeData extends BaseNodeData {
  type: 'textNode';
  content: string;
  output: string;
}

export interface ImageNodeData extends BaseNodeData {
  type: 'imageNode';
  previewUrl: string | null;
  output: {
    url: string;
    base64: string;
    mimeType: string;
  } | null;
}

export interface LLMNodeData extends BaseNodeData {
  type: 'llmNode';
  model: string;
  isLoading: boolean;
  output: string | null;
  error: string | null;
  imageInputs?: number;
}

export type NodeData = TextNodeData | ImageNodeData | LLMNodeData;
