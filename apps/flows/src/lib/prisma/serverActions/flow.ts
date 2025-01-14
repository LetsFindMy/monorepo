'use server';

import {
  createFlow,
  getFlow,
  getFlows,
  getSecretsByFlowId,
} from '#/lib/prisma/ormApi';
import { FlowValues, Secret, Tag, Flow, Node, Edge } from '#/lib/prisma';
import { DbData } from '#/lib/types';

/**
 * Gets a single flow by its unique identifier along with secrets and tags.
 * @param {string} flowId - The unique identifier of the flow.
 * @returns {Promise<DbData | null>}
 */
export const getFlowAction = async (flowId: string): Promise<DbData | null> => {
  try {
    console.log('🔍 Fetching flow with:', { flowId });

    const flow = await getFlow(flowId);
    // console.log('📥 Raw flow data:', JSON.stringify(flow, null, 2));

    if (!flow) return null;

    const dbData: DbData = {
      flow,
      tags: flow.tags ?? [],
      secrets: flow.secrets ?? [],
    };

    // console.log('📤 Transformed DbData:', JSON.stringify(dbData, null, 2));
    return dbData;
  } catch (error) {
    console.error('❌ getFlowAction error:', error);
    return null;
  }
};

/**
 * Gets all flows.
 * @returns {Promise<Flow[]>} - A promise that resolves to an array of flows.
 */
export const getFlowsAction = async (): Promise<Flow[]> => {
  console.log('getFlowsAction');
  return await getFlows();
};

/**
 * Creates a new flow with the provided values.
 * @param {FlowValues} values - The values needed to create the flow.
 * @returns {Promise<ReturnType<typeof createFlow>>} - A promise that resolves to the newly created flow.
 */
export const createFlowAction = async (
  values: FlowValues,
): Promise<ReturnType<typeof createFlow>> => {
  console.log('createFlowAction', JSON.stringify(values));
  return await createFlow(
    values.flowName,
    values.flowMethod,
    values.authorId,
    [],
  );
};
