// src/lib/prisma/serverActions/tag.ts

import { Prisma, Tag } from '@prisma/client';
import {
  getTagById,
  createTag,
  getAllTags,
  updateTag,
  deleteTag,
} from '#/lib/prisma/ormApi/tag';

/**
 * Fetches a tag by its unique identifier.
 *
 * @param tagId - The unique identifier of the Tag.
 * @returns The Tag or throws an error if not found.
 */
export const readTagAction = async (tagId: number): Promise<Tag> => {
  try {
    const tag = await getTagById(tagId);
    if (!tag) throw new Error('Tag not found.');
    return tag;
  } catch (error) {
    console.error('Error in readTagAction:', error);
    throw new Error('Failed to fetch tag.');
  }
};

/**
 * Creates a new tag and optionally associates it with a tag group.
 *
 * @param data - The data required to create a Tag.
 * @returns The created Tag.
 */
export const createTagAction = async (data: {
  name: string;
  tagGroupId?: string;
}): Promise<Tag> => {
  try {
    const createData: Prisma.TagCreateInput = {
      name: data.name,
      tagGroup: data.tagGroupId
        ? {
            connect: {
              id: data.tagGroupId,
            },
          }
        : undefined,
    };

    return await createTag(createData);
  } catch (error) {
    console.error('Error in createTagAction:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to create tag: ${error.message}`);
    } else {
      throw new Error('Failed to create tag due to an unknown error.');
    }
  }
};

/**
 * Fetches all tags.
 *
 * @returns An array of Tags.
 */
export const getTagsAction = async (): Promise<Tag[]> => {
  try {
    const tags = await getAllTags();
    if (!tags) throw new Error('No tags found.');
    return tags;
  } catch (error) {
    console.error('Error in getTagsAction:', error);
    throw new Error('Failed to fetch tags.');
  }
};

/**
 * Updates an existing tag.
 *
 * @param tagId - The unique identifier of the Tag to update.
 * @param data - The data to update the Tag with.
 * @returns The updated Tag or throws an error if not found.
 */
export const updateTagAction = async (
  tagId: number,
  data: {
    name?: string;
    tagGroupId?: string;
  },
): Promise<Tag> => {
  try {
    const updateData: Prisma.TagUpdateInput = {
      name: data.name,
      tagGroup: data.tagGroupId
        ? {
            connect: {
              id: data.tagGroupId,
            },
          }
        : {
            disconnect: true,
          },
    };

    const updatedTag = await updateTag(tagId, updateData);
    if (!updatedTag) throw new Error('Tag not found or update failed.');
    return updatedTag;
  } catch (error) {
    console.error('Error in updateTagAction:', error);
    throw new Error('Failed to update tag.');
  }
};

/**
 * Deletes a tag by soft-deleting it.
 *
 * @param tagId - The unique identifier of the Tag to delete.
 * @returns The soft-deleted Tag or throws an error if not found.
 */
export const deleteTagAction = async (tagId: number): Promise<Tag> => {
  try {
    const deletedTag = await deleteTag(tagId);
    if (!deletedTag) throw new Error('Tag not found or delete failed.');
    return deletedTag;
  } catch (error) {
    console.error('Error in deleteTagAction:', error);
    throw new Error('Failed to delete tag.');
  }
};
