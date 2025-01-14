// src/lib/prisma/ormApi/tagGroup.ts

import { Prisma, Tag, TagGroup } from '@prisma/client';
import { prisma } from '#/lib/prisma';

/**
 * Creates a new TagGroup.
 *
 * @param data - The data required to create a TagGroup.
 * @returns The created TagGroup with associated tags.
 */
export const createTagGroup = async (
  data: Prisma.TagGroupCreateInput,
): Promise<TagGroup> => {
  return prisma.tagGroup.create({
    data,
    include: { tags: true },
  });
};

/**
 * Retrieves a TagGroup by its unique identifier.
 *
 * @param tagGroupId - The unique identifier of the TagGroup.
 * @returns The TagGroup with its associated tags or null if not found or deleted.
 */
export const getTagGroupById = async (
  tagGroupId: string,
): Promise<(TagGroup & { tags: Tag[] }) | null> => {
  return prisma.tagGroup.findFirst({
    where: {
      id: tagGroupId,
      deleted: false,
    },
    include: { tags: true },
  });
};

/**
 * Retrieves all non-deleted TagGroups.
 *
 * @returns An array of TagGroups with their associated tags.
 */
export const getAllTagGroups = async (): Promise<TagGroup[]> => {
  try {
    const tagGroups = await prisma.tagGroup.findMany({
      where: { deleted: false },
      include: { tags: true },
    });
    return tagGroups;
  } catch (error) {
    console.error('Error in getAllTagGroups:', error);
    throw error;
  }
};

/**
 * Updates an existing TagGroup.
 *
 * @param tagGroupId - The unique identifier of the TagGroup to update.
 * @param data - The data to update the TagGroup with.
 * @returns The updated TagGroup or null if not found or deleted.
 */
export const updateTagGroup = async (
  tagGroupId: string,
  data: Prisma.TagGroupUpdateInput,
): Promise<TagGroup | null> => {
  try {
    const updatedCount = await prisma.tagGroup.updateMany({
      where: {
        id: tagGroupId,
        deleted: false,
      },
      data,
    });

    if (updatedCount.count === 0) return null;

    return getTagGroupById(tagGroupId);
  } catch (error) {
    console.error('Prisma error in updateTagGroup:', error);
    return null;
  }
};

/**
 * Soft deletes a TagGroup by setting its `deleted` flag to true.
 *
 * @param tagGroupId - The unique identifier of the TagGroup to delete.
 * @returns The soft-deleted TagGroup or null if not found or already deleted.
 */
export const deleteTagGroup = async (
  tagGroupId: string,
): Promise<TagGroup | null> => {
  try {
    const updatedCount = await prisma.tagGroup.updateMany({
      where: {
        id: tagGroupId,
        deleted: false,
      },
      data: { deleted: true },
    });

    if (updatedCount.count === 0) return null;

    return getTagGroupById(tagGroupId);
  } catch (error) {
    console.error('Prisma error in deleteTagGroup:', error);
    return null;
  }
};
