export const NODE_TYPES = {
  TEXT_NODE: 'textNode',
  IMAGE_NODE: 'imageNode',
  LLM_NODE: 'llmNode',
} as const;

export const NODE_LABELS = {
  [NODE_TYPES.TEXT_NODE]: 'Text Input',
  [NODE_TYPES.IMAGE_NODE]: 'Image Input',
  [NODE_TYPES.LLM_NODE]: 'Run LLM',
} as const;
