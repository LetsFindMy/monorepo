import { TagWithGroup, getTagsWithTagGroups } from '#/lib/prisma/ormApi';

/**
 * Fetches all tags with their associated tag groups.
 *
 * @returns An array of tags with their associated tag groups.
 */
export const getTagsWithTagGroupsAction = async (): Promise<TagWithGroup[]> => {
  try {
    const tags = await getTagsWithTagGroups();
    console.log('getTagsWithTagGroups', tags);
    return tags;
  } catch (error) {
    console.error('Error in getTagsWithTagGroupsAction:', error);
    throw new Error('Failed to fetch tags with tag groups.');
  }
};
