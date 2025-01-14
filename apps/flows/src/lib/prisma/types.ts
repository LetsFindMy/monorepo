import { Edge, Flow, FlowMethod, Tag, TestCase, User } from '@prisma/client';
import { Edge as FlowEdge, Node as FlowNode } from '@xyflow/react';

export interface FlowValues {
  flowName: string;
  flowMethod: FlowMethod;
  authorId: string;
}

export type FlowData = {
  flowId: string;
  name: string;
  method: FlowMethod;
  flowData?: any;
  authorId: string;
  tagsIds?: string[];
  nodesData?: FlowNode[];
  edgesData?: FlowEdge[];
};

export type PrismaFlow = Omit<
  Flow,
  'edges' | 'nodes' | 'tags' | 'author' | 'testCases'
> & {
  edges: Edge[];
  nodes: Node[];
  tags: Tag[];
  author: User;
  testCases: TestCase[];
};
