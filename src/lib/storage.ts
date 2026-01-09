import { FlowNode, FlowEdge, WorkflowExport } from '@/types/flow';

const STORAGE_KEY = 'weavy-workflow';

export const saveWorkflow = (nodes: FlowNode[], edges: FlowEdge[]): void => {
  try {
    const workflow: WorkflowExport = {
      version: '1.0',
      nodes,
      edges,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workflow));
  } catch (error) {
    console.error('Failed to save workflow:', error);
  }
};

export const loadWorkflow = (): { nodes: FlowNode[]; edges: FlowEdge[] } | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const workflow: WorkflowExport = JSON.parse(stored);
    return {
      nodes: workflow.nodes,
      edges: workflow.edges,
    };
  } catch (error) {
    console.error('Failed to load workflow:', error);
    return null;
  }
};

export const exportWorkflowJSON = (nodes: FlowNode[], edges: FlowEdge[]): string => {
  const workflow: WorkflowExport = {
    version: '1.0',
    nodes,
    edges,
    timestamp: Date.now(),
  };
  return JSON.stringify(workflow, null, 2);
};

export const importWorkflowJSON = (json: string): { nodes: FlowNode[]; edges: FlowEdge[] } | null => {
  try {
    const workflow: WorkflowExport = JSON.parse(json);
    return {
      nodes: workflow.nodes,
      edges: workflow.edges,
    };
  } catch (error) {
    console.error('Failed to import workflow:', error);
    return null;
  }
};
