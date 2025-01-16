'use server';

import { fetchFromAPI, StrapiUrlBuilder } from '#/lib/cmsUtils';
import { StrapiType } from '#/lib/allowedTaxonomies';

// Types
interface Collection {
  id: number;
  name: string;
  slug: string;
  type: StrapiType;
  brands?: Array<{ id: number; name: string }>;
  stories?: Array<{ id: number; name: string }>;
  cast?: Array<{ id: number; name: string }>;
  events?: Array<{ id: number; name: string }>;
  metas?: Array<{ id: number; name: string }>;
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
  fields: ['name', 'slug', 'type'],
  populate: '*',
} as const;

const DEFAULT_FIELDS = {
  single: ['name', 'slug', 'type'],
  list: ['name', 'slug', 'type'],
} as const;

// Server Actions
export async function getCollections(type: StrapiType) {
  const allCollections: Collection[] = [];

  const urlBuilder = new StrapiUrlBuilder('collections')
    .addPopulate(RELATIONS.populate)
    .addFields(DEFAULT_FIELDS.list)
    .addPagination(1, BATCH_SIZE)
    .addFilter('type', type);

  const firstPage = await fetchFromAPI<{
    data: Collection[];
    meta: { pagination: { pageCount: number; total: number } };
  }>(urlBuilder.toString(), ['collections', `collections-${type}`]);

  allCollections.push(...firstPage.data);

  const totalPages = firstPage.meta.pagination.pageCount;

  if (totalPages > 1) {
    const remainingPages = Array.from(
      { length: totalPages - 1 },
      (_, i) => i + 2,
    );

    const responses = await Promise.all(
      remainingPages.map((page) =>
        fetchFromAPI<{ data: Collection[] }>(
          new StrapiUrlBuilder('collections')
            .addPopulate(RELATIONS.populate)
            .addFields(DEFAULT_FIELDS.list)
            .addPagination(page, BATCH_SIZE)
            .addFilter('type', type)
            .toString(),
          ['collections', `collections-${type}`],
        ),
      ),
    );

    responses.forEach((response) => allCollections.push(...response.data));
  }

  return {
    data: allCollections,
    meta: { total: firstPage.meta.pagination.total },
  };
}

export async function getCollection(slug: string, type: StrapiType) {
  const response = await fetchFromAPI<{ data: Collection[] }>(
    new StrapiUrlBuilder('collections', slug)
      .addPopulate(RELATIONS.populate)
      .addFields(DEFAULT_FIELDS.single)
      .addFilter('type', type)
      .toString(),
    ['collections', `collection-${slug}`, `collection-${type}-${slug}`],
  );

  if (!response.data.length) {
    throw new Error(
      `Collection with slug "${slug}" and type "${type}" not found`,
    );
  }

  return {
    data: response.data[0],
    meta: {},
  };
}

export async function getCollectionSlugs(type: StrapiType) {
  const response = await getCollections(type);
  return response.data.map((collection) => collection.slug);
}
