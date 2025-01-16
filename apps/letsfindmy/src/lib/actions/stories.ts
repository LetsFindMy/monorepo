'use server';

import { fetchFromAPI, StrapiUrlBuilder } from '#/lib/cmsUtils';

// Types
interface Story {
  id: number;
  name: string;
  slug: string;
  studio?: 'disney' | 'pixar' | 'marvel' | 'lucasfilm';
  shortDescription?: string;
  fullDescription?: string;
  cast?: Array<{ id: number; name: string }>;
  releases?: Array<{ id: number; name: string }>;
  fandom?: { id: number; name: string };
  metas?: Array<{ id: number; name: string }>;
  collections?: Array<{ id: number; name: string }>;
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
  fields: ['name', 'slug', 'studio', 'shortDescription'],
  populate: 'deep',
} as const;

const DEFAULT_FIELDS = {
  single: ['name', 'slug', 'studio', 'shortDescription', 'fullDescription'],
  list: ['name', 'slug', 'studio', 'shortDescription'],
} as const;

// Server Actions
export async function getStories() {
  const allStories: Story[] = [];

  const urlBuilder = new StrapiUrlBuilder('stories')
    // .addPopulate(RELATIONS.populate)
    .addFields(DEFAULT_FIELDS.list)
    .addPagination(1, BATCH_SIZE);

  const firstPage = await fetchFromAPI<{
    data: Story[];
    meta: { pagination: { pageCount: number; total: number } };
  }>(urlBuilder.toString(), ['stories']);

  allStories.push(...firstPage.data);

  const totalPages = firstPage.meta.pagination.pageCount;

  if (totalPages > 1) {
    const remainingPages = Array.from(
      { length: totalPages - 1 },
      (_, i) => i + 2,
    );

    const responses = await Promise.all(
      remainingPages.map((page) =>
        fetchFromAPI<{ data: Story[] }>(
          new StrapiUrlBuilder('stories')
            // .addPopulate(RELATIONS.populate)
            .addFields(DEFAULT_FIELDS.list)
            .addPagination(page, BATCH_SIZE)
            .toString(),
          ['stories'],
        ),
      ),
    );

    responses.forEach((response) => allStories.push(...response.data));
  }

  return {
    data: allStories,
    meta: { total: firstPage.meta.pagination.total },
  };
}

export async function getStory(slug: string) {
  const urlBuilder = new StrapiUrlBuilder('stories')
    // .addPopulate(RELATIONS.populate)
    .addFields(DEFAULT_FIELDS.single)
    .addFilter('slug', slug);

  const response = await fetchFromAPI<{ data: Story[] }>(
    urlBuilder.toString(),
    ['stories', `story-${slug}`],
  );

  if (!response.data.length) {
    throw new Error(`Story with slug "${slug}" not found`);
  }

  return {
    data: response.data[0],
    meta: {},
  };
}

export async function getStorySlugs() {
  const response = await getStories();
  return response.data.map((story) => story.slug);
}
