'use server';

import { fetchFromAPI, StrapiUrlBuilder } from '#/lib/cmsUtils';

// Types
interface Fandom {
  id: number;
  name: string;
  slug: string;
  singleStory: boolean;
  stories?: Array<{ id: number; name: string }>;
  cast?: Array<{ id: number; name: string }>;
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
  fields: ['name', 'slug', 'singleStory'],
  populate: '*',
} as const;

const DEFAULT_FIELDS = {
  single: ['name', 'slug', 'singleStory'],
  list: ['name', 'slug', 'singleStory'],
} as const;

// Server Actions
export async function getFandoms() {
  const allFandoms: Fandom[] = [];

  const urlBuilder = new StrapiUrlBuilder('fandoms')
    .addPopulate(RELATIONS.populate)
    .addFields(DEFAULT_FIELDS.list)
    .addPagination(1, BATCH_SIZE);

  const firstPage = await fetchFromAPI<{
    data: Fandom[];
    meta: { pagination: { pageCount: number; total: number } };
  }>(urlBuilder.toString(), ['fandoms']);

  allFandoms.push(...firstPage.data);

  const totalPages = firstPage.meta.pagination.pageCount;

  if (totalPages > 1) {
    const remainingPages = Array.from(
      { length: totalPages - 1 },
      (_, i) => i + 2,
    );

    const responses = await Promise.all(
      remainingPages.map((page) =>
        fetchFromAPI<{ data: Fandom[] }>(
          new StrapiUrlBuilder('fandoms')
            .addPopulate(RELATIONS.populate)
            .addFields(DEFAULT_FIELDS.list)
            .addPagination(page, BATCH_SIZE)
            .toString(),
          ['fandoms'],
        ),
      ),
    );

    responses.forEach((response) => allFandoms.push(...response.data));
  }

  return {
    data: allFandoms,
    meta: { total: firstPage.meta.pagination.total },
  };
}

export async function getFandom(slug: string) {
  const response = await fetchFromAPI<{ data: Fandom[] }>(
    new StrapiUrlBuilder('fandoms', slug)
      .addPopulate(RELATIONS.populate)
      .addFields(DEFAULT_FIELDS.single)
      .toString(),
    ['fandoms', `fandom-${slug}`],
  );

  if (!response.data.length) {
    throw new Error(`Fandom with slug "${slug}" not found`);
  }

  return {
    data: response.data[0],
    meta: {},
  };
}

export async function getFandomSlugs() {
  const response = await getFandoms();
  return response.data.map((fandom) => fandom.slug);
}
