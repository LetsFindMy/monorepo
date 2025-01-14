// src/lib/prisma/serverActions/tagGroup.ts

'use server';

import {
  createTagGroup,
  getTagGroupById,
  getAllTagGroups,
  updateTagGroup,
  deleteTagGroup,
} from '#/lib/prisma/ormApi/tagGroup';
import { TagGroup } from '@prisma/client';

/**
 * Fetches a TagGroup by its unique identifier.
 *
 * @param tagGroupId - The unique identifier of the TagGroup.
 * @returns The TagGroup or throws an error if not found.
 */
export const readTagGroupAction = async (
  tagGroupId: string,
): Promise<TagGroup> => {
  try {
    const tagGroup = await getTagGroupById(tagGroupId);
    if (!tagGroup) throw new Error('TagGroup not found.');
    return tagGroup;
  } catch (error) {
    console.error('Error in readTagGroupAction:', error);
    throw new Error('Failed to fetch TagGroup.');
  }
};

/**
 * Creates a new TagGroup.
 *
 * @param data - The data required to create a TagGroup.
 * @returns The created TagGroup.
 */
export const createTagGroupAction = async (data: {
  name: string;
  color: string;
}): Promise<TagGroup> => {
  try {
    return await createTagGroup({
      name: data.name,
      color: data.color,
    });
  } catch (error) {
    console.error('Error in createTagGroupAction:', error);
    throw new Error('Failed to create TagGroup.');
  }
};

/**
 * Fetches all TagGroups.
 *
 * @returns An array of TagGroups.
 */
export const getTagGroupsAction = async (): Promise<TagGroup[]> => {
  try {
    return await getAllTagGroups();
  } catch (error) {
    console.error('Error in getTagGroupsAction:', error);
    throw new Error('Failed to fetch TagGroups.');
  }
};

/**
 * Updates an existing TagGroup.
 *
 * @param tagGroupId - The unique identifier of the TagGroup to update.
 * @param data - The data to update the TagGroup with.
 * @returns The updated TagGroup or throws an error if not found.
 */
export const updateTagGroupAction = async (
  tagGroupId: string,
  data: { name?: string; color?: string },
): Promise<TagGroup> => {
  try {
    const updatedTagGroup = await updateTagGroup(tagGroupId, data);
    if (!updatedTagGroup)
      throw new Error('TagGroup not found or update failed.');
    return updatedTagGroup;
  } catch (error) {
    console.error('Error in updateTagGroupAction:', error);
    throw new Error('Failed to update TagGroup.');
  }
};

/**
 * Soft deletes a TagGroup by setting its `deleted` flag to true.
 *
 * @param tagGroupId - The unique identifier of the TagGroup to delete.
 * @returns The soft-deleted TagGroup or throws an error if not found.
 */
export const deleteTagGroupAction = async (
  tagGroupId: string,
): Promise<TagGroup> => {
  try {
    const deletedTagGroup = await deleteTagGroup(tagGroupId);
    if (!deletedTagGroup)
      throw new Error('TagGroup not found or already deleted.');
    return deletedTagGroup;
  } catch (error) {
    console.error('Error in deleteTagGroupAction:', error);
    throw new Error('Failed to delete TagGroup.');
  }
};
