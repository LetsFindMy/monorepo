'use server';

import { prisma } from '#/lib/prisma/client';
import { Tag, TagGroup } from '#/lib/prisma';

export type TagWithGroup = Tag & { tagGroup: TagGroup | null };

/**
 * Fetches all tags, including their tag group details.
 *
 * @returns An array of tags with their associated tag groups.
 */
export const getTagsWithTagGroups = async (): Promise<TagWithGroup[]> => {
  try {
    const tags = await prisma.tag.findMany({
      where: { deleted: false },
      include: { tagGroup: true },
    });
    console.log('Database retrieved tags:', tags);
    return tags;
  } catch (error) {
    console.error('Database error in getTagsWithTagGroups:', error);
    throw error;
  }
};
