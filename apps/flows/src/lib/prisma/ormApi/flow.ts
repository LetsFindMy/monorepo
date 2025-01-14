// src/lib/prisma/ormApi/flow.ts

import { prisma } from '#/lib/prisma/client';
import {
  Node,
  Edge,
  FlowMethod,
  Prisma,
  Tag,
  Secret,
  Flow,
} from '@prisma/client';
import { upsertFlowWithNodesAndEdges } from './upsertFlow';
import { FullFlow } from './flowUtils';

/**
 * Represents a Flow along with its related entities.
 */
export type FlowWithRelations = {
  id: string;
  name: string;
  method: FlowMethod;
  isEnabled: boolean;
  viewport?: Prisma.JsonValue;
  metadata?: Prisma.JsonValue; // Ensure metadata is included
  nodes?: Node[];
  edges?: Edge[];
  tags?: Tag[];
  secrets?: Secret[];
};

/**
 * Retrieves all flows.
 * @returns {Promise<Flow[]>} - An array of Flow objects.
 */
export const getFlows = async (): Promise<Flow[]> => {
  try {
    const flows = await prisma.flow.findMany({
      include: { edges: true, nodes: true, tags: true, secrets: true },
    });
    return flows;
  } catch (error) {
    console.error('Failed to fetch flows:', error);
    return [];
  }
};

/**
 * Retrieves a specific flow by its ID.
 * @param flowId - The ID of the flow.
 * @returns {Promise<FullFlow | null>} - The Flow object with relations or null if not found.
 */
export const getFlow = async (flowId: string): Promise<FullFlow | null> => {
  try {
    const flow = await prisma.flow.findUnique({
      where: { id: flowId },
      include: { edges: true, nodes: true, tags: true, secrets: true },
    });
    // console.log('🔍 Flow db direct:', flow);
    return flow as FullFlow | null;
  } catch (error) {
    console.error(`Failed to fetch flow with ID ${flowId}:`, error);
    return null;
  }
};

/**
 * Creates a new flow with the specified details.
 * @param name - The name of the flow.
 * @param method - The method used for the flow.
 * @param authorId - The ID of the author creating the flow.
 * @param tagsIds - An array of tag IDs to associate with the flow.
 * @returns {Promise<Flow | null>} - The created Flow object or null if creation fails.
 */
export const createFlow = async (
  name: string,
  method: FlowMethod,
  authorId: string,
  tagsIds: number[] = [],
): Promise<Flow | null> => {
  try {
    const flowData: Prisma.FlowCreateInput = {
      name,
      method,
      isEnabled: false,
      metadata: Prisma.JsonNull,
    };

    if (tagsIds.length > 0) {
      flowData.tags = {
        connect: tagsIds.map((id) => ({ id })),
      };
    }

    const newFlow = await prisma.flow.create({
      data: flowData,
    });

    return newFlow;
  } catch (error) {
    console.error('Failed to create a new flow:', error);
    return null;
  }
};

/**
 * Saves or updates a flow along with its nodes, edges, tags, and secrets.
 * @param data - The flow data including nodes, edges, tags, and secrets.
 * @returns {Promise<FullFlow | null>} - The upserted flow object or null if the operation fails.
 */
export const saveFlow = async (data: any): Promise<FullFlow | null> => {
  try {
    // Extract necessary properties from 'data'
    const {
      flowId,
      name,
      method,
      isEnabled,
      viewport,
      metadata,
      nodes,
      edges,
      tags,
      secrets,
      changedBy,
    } = data;

    // Ensure 'changedBy' is defined
    if (!changedBy) {
      throw new Error('changedBy is required to save the flow.');
    }

    // Prepare the flow object
    const flowData: FlowWithRelations = {
      id: flowId,
      name,
      method,
      isEnabled,
      viewport,
      metadata, // Ensure metadata is included
      nodes,
      edges,
      tags,
      secrets,
    };

    // Call the upsert function with both arguments
    const updatedFlow = await upsertFlowWithNodesAndEdges(flowData, changedBy);
    return updatedFlow;
  } catch (error) {
    console.error('Error saving flow:', error);
    return null;
  }
};
