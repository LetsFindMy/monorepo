'use server';

import { fetchFromAPI, StrapiUrlBuilder } from '#/lib/cmsUtils';

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
  fields: ['name', 'slug', 'type', 'releaseDate'],
  populate: {
    story: {
      fields: ['name', 'slug'],
    },
    products: {
      fields: ['name'],
    },
    crosscheck: {
      fields: ['id'],
    },
  },
} as const;

const DEFAULT_FIELDS = {
  single: ['name', 'slug', 'type', 'releaseDate'],
  list: ['name', 'slug', 'type', 'releaseDate'],
} as const;

// Server Actions
export async function getStoryReleases(storySlug: string) {
  const urlBuilder = new StrapiUrlBuilder('story-releases')
    .addPopulate(RELATIONS.populate)
    .addFields(DEFAULT_FIELDS.list)
    .addFilter('story.slug', storySlug)
    .addPagination(1, BATCH_SIZE);

  const response = await fetchFromAPI<{
    data: StoryRelease[];
    meta: { pagination: { total: number } };
  }>(urlBuilder.toString(), ['story-releases', `story-releases-${storySlug}`]);

  return {
    data: response.data,
    meta: { total: response.meta.pagination.total },
  };
}

export async function getStoryRelease(storySlug: string, releaseSlug: string) {
  const urlBuilder = new StrapiUrlBuilder('story-releases')
    .addPopulate(RELATIONS.populate)
    .addFields(DEFAULT_FIELDS.single)
    .addFilter('story.slug', storySlug)
    .addFilter('slug', releaseSlug);

  const response = await fetchFromAPI<{ data: StoryRelease[] }>(
    urlBuilder.toString(),
    ['story-releases', `story-release-${storySlug}-${releaseSlug}`],
  );

  if (!response.data.length) {
    throw new Error(
      `Release with slug "${releaseSlug}" not found for story "${storySlug}"`,
    );
  }

  return {
    data: response.data[0],
    meta: {},
  };
}

export async function getStoryReleaseSlugs(storySlug: string) {
  const { data: releases } = await getStoryReleases(storySlug);
  return releases.map((release) => release.slug);
}
