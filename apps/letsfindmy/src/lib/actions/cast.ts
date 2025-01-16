'use server';

import { fetchFromAPI, StrapiUrlBuilder } from '#/lib/cmsUtils';

// Types
interface CastMember {
  id: number;
  name: string;
  slug: string;
  stories?: Array<{ id: number; name: string }>;
  fandom?: { id: number; name: string };
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
  fields: ['name', 'slug'],
  populate: {
    stories: {
      fields: ['name'],
    },
    fandom: {
      fields: ['name'],
    },
    collections: {
      fields: ['name'],
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
  single: ['name', 'slug'],
  list: ['name', 'slug'],
} as const;

// Server Actions
export async function getCast() {
  const allCastMembers: CastMember[] = [];

  const urlBuilder = new StrapiUrlBuilder('story-casts')
    .addPopulate(RELATIONS.populate)
    .addFields(DEFAULT_FIELDS.list)
    .addPagination(1, BATCH_SIZE);

  const firstPage = await fetchFromAPI<{
    data: CastMember[];
    meta: { pagination: { pageCount: number; total: number } };
  }>(urlBuilder.toString(), ['story-casts']);

  allCastMembers.push(...firstPage.data);

  const totalPages = firstPage.meta.pagination.pageCount;

  if (totalPages > 1) {
    const remainingPages = Array.from(
      { length: totalPages - 1 },
      (_, i) => i + 2,
    );

    const responses = await Promise.all(
      remainingPages.map((page) =>
        fetchFromAPI<{ data: CastMember[] }>(
          new StrapiUrlBuilder('story-casts')
            .addPopulate(RELATIONS.populate)
            .addFields(DEFAULT_FIELDS.list)
            .addPagination(page, BATCH_SIZE)
            .toString(),
          ['story-casts'],
        ),
      ),
    );

    responses.forEach((response) => allCastMembers.push(...response.data));
  }

  return {
    data: allCastMembers,
    meta: { total: firstPage.meta.pagination.total },
  };
}

export async function getCastMember(slug: string) {
  const response = await fetchFromAPI<{ data: CastMember[] }>(
    new StrapiUrlBuilder('story-casts', slug)
      .addPopulate(RELATIONS.populate)
      .addFields(DEFAULT_FIELDS.single)
      .toString(),
    ['story-casts', `story-cast-${slug}`],
  );

  if (!response.data.length) {
    throw new Error(`Cast member with slug "${slug}" not found`);
  }

  return {
    data: response.data[0],
    meta: {},
  };
}

export async function getCastSlugs() {
  const response = await getCast();
  return response.data.map((castMember) => castMember.slug);
}
