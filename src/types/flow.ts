import { Node, Edge } from 'reactflow';
import { NodeData } from './nodes';

export type FlowNode = Node<NodeData>;
export type FlowEdge = Edge;

export interface FlowState {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface WorkflowExport {
  version: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  timestamp: number;
}
