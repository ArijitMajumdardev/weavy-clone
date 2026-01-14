export const NODE_TYPES = {
  TEXT_NODE: 'textNode',
  IMAGE_NODE: 'imageNode',
  LLM_NODE: 'llmNode',
} as const;

export const NODE_LABELS = {
  [NODE_TYPES.TEXT_NODE]: 'Text',
  [NODE_TYPES.IMAGE_NODE]: 'Image',
  [NODE_TYPES.LLM_NODE]: 'Run Any LLM',
} as const;
