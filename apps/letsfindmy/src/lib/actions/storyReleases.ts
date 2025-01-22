'use server';

import { fetchAllPages, fetchSingleItem } from '#/lib/cmsUtils';

// Types
export interface StoryRelease {
  id: number;
  name: string;
  slug: string;
  type: 'movie' | 'series' | 'game' | 'short' | 'book';
  releaseDate?: string;
  story?: { id: number; name: string; slug: string };
  products?: Array<{ id: number; name: string }>;
  crosscheck?: { id: number };
  copy?: {
    title?: string;
    description?: string;
  };
  findReplaceReject?: Array<{ id: number }>;
  createdAt: string;
  updatedAt: string;
}

// Constants
const BATCH_SIZE = 100;

// API Configuration
const RELATIONS = {
  fields: ['name', 'slug', 'type', 'releaseDate'] as const,
  populate: {
    story: {
      fields: ['name', 'slug'] as const,
    },
    products: {
      fields: ['name'] as const,
    },
    crosscheck: {
      fields: ['id'] as const,
    },
  },
} as const;

const DEFAULT_FIELDS = {
  single: ['name', 'slug', 'type', 'releaseDate'] as const,
  list: ['name', 'slug', 'type', 'releaseDate'] as const,
} as const;

// Server Actions
export const getStoryReleases = async (storySlug: string) => {
  const releases = await fetchAllPages<StoryRelease>(
    'story-releases',
    DEFAULT_FIELDS.list,
    BATCH_SIZE,
    (builder) =>
      builder.addPopulate(RELATIONS.populate).addComplexFilter({
        story: {
          slug: {
            $eq: storySlug,
          },
        },
      }),
  );

  return {
    data: releases,
    meta: { total: releases.length },
  };
};

export const getStoryRelease = async (
  storySlug: string,
  releaseSlug: string,
) => {
  const release = await fetchSingleItem<StoryRelease>(
    'story-releases',
    releaseSlug,
    DEFAULT_FIELDS.single,
  );

  return {
    data: release,
    meta: {},
  };
};

export async function getStoryReleaseSlugs(storySlug: string) {
  const releases = await fetchAllPages<StoryRelease>(
    'story-releases',
    ['slug'] as const,
    BATCH_SIZE,
    (builder) =>
      builder.addComplexFilter({
        story: {
          slug: {
            $eq: storySlug,
          },
        },
      }),
  );
  return releases.map((release) => release.slug);
}
