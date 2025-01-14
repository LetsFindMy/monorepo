// src/lib/prisma/ormApi/tag.ts

import { Prisma, Tag } from '@prisma/client';
import { prisma } from '#/lib/prisma';

/**
 * Creates a new tag.
 *
 * @param data - The data required to create a Tag.
 * @returns The created Tag with related TagGroup.
 */
export const createTag = async (data: Prisma.TagCreateInput): Promise<Tag> => {
  try {
    // Check if tagGroup is defined and handle it correctly
    if (
      data.tagGroup &&
      typeof data.tagGroup === 'object' &&
      'connect' in data.tagGroup
    ) {
      const connect = data.tagGroup.connect as Prisma.TagGroupWhereUniqueInput;
      if ('id' in connect && typeof connect.id === 'string') {
        data.tagGroup = {
          connect: {
            id: connect.id,
          },
        };
      }
    }

    // Create the tag with the assembled data
    return await prisma.tag.create({
      data,
      include: { tagGroup: true },
    });
  } catch (error) {
    console.error('Prisma error in createTag:', error);
    throw new Error(
      `Error during tag creation: ${
        error instanceof Error ? error.message : 'Unknown error.'
      }`,
    );
  }
};

/**
 * Retrieves a tag by its unique identifier.
 *
 * @param tagId - The unique identifier of the Tag.
 * @returns The Tag with its associated TagGroup or null if not found.
 */
export const getTagById = async (tagId: number): Promise<Tag | null> => {
  return prisma.tag.findUnique({
    where: { id: tagId },
    include: { tagGroup: true },
  });
};

/**
 * Fetches all non-deleted tags.
 *
 * @returns An array of Tags.
 */
export const getAllTags = async (): Promise<Tag[]> => {
  return prisma.tag.findMany({
    where: { deleted: false },
    include: { tagGroup: true },
  });
};

/**
 * Updates an existing tag.
 *
 * @param tagId - The unique identifier of the Tag to update.
 * @param data - The data to update the Tag with.
 * @returns The updated Tag with its associated TagGroup or null if not found.
 */
export const updateTag = async (
  tagId: number,
  data: Prisma.TagUpdateInput,
): Promise<Tag | null> => {
  try {
    if (
      data.tagGroup &&
      typeof data.tagGroup === 'object' &&
      'connect' in data.tagGroup
    ) {
      const connect = data.tagGroup.connect as Prisma.TagGroupWhereUniqueInput;
      if ('id' in connect && typeof connect.id === 'string') {
        data.tagGroup = {
          connect: {
            id: connect.id,
          },
        };
      }
    }

    return await prisma.tag.update({
      where: { id: tagId },
      data,
      include: { tagGroup: true },
    });
  } catch (error) {
    console.error('Prisma error in updateTag:', error);
    return null;
  }
};

/**
 * Soft deletes a tag by setting its `deleted` flag to true.
 *
 * @param tagId - The unique identifier of the Tag to delete.
 * @returns The soft-deleted Tag or null if not found.
 */
export const deleteTag = async (tagId: number): Promise<Tag | null> => {
  try {
    return await prisma.tag.update({
      where: { id: tagId },
      data: { deleted: true },
    });
  } catch (error) {
    console.error('Prisma error in deleteTag:', error);
    return null;
  }
};
