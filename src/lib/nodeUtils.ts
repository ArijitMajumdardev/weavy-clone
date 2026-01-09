import { nanoid } from 'nanoid';
import { FlowNode } from '@/types/flow';
import { TextNodeData, ImageNodeData, LLMNodeData } from '@/types/nodes';

export const createTextNode = (position: { x: number; y: number }): FlowNode => ({
  id: nanoid(),
  type: 'textNode',
  position,
  data: {
    id: nanoid(),
    type: 'textNode',
    label: 'Text Input',
    content: '',
    output: '',
  } as TextNodeData,
});

export const createImageNode = (position: { x: number; y: number }): FlowNode => ({
  id: nanoid(),
  type: 'imageNode',
  position,
  data: {
    id: nanoid(),
    type: 'imageNode',
    label: 'Image Input',
    previewUrl: null,
    output: null,
  } as ImageNodeData,
});

export const createLLMNode = (position: { x: number; y: number }): FlowNode => ({
  id: nanoid(),
  type: 'llmNode',
  position,
  data: {
    id: nanoid(),
    type: 'llmNode',
    label: 'Run LLM',
    model: 'gemini-1.5-flash',
    systemPrompt: '',
    isLoading: false,
    output: null,
    error: null,
  } as LLMNodeData,
});
