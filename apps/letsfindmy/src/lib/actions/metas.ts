'use server';

import { fetchFromAPI, StrapiUrlBuilder } from '#/lib/cmsUtils';

// Types
type MetaType = 'attraction' | 'thing' | 'tag' | 'color' | 'material';

interface Meta {
  id: number;
  name: string;
  slug: string;
  type: MetaType;
  reference?: string;
  copy?: {
    title?: string;
    description?: string;
  };
  stories?: Array<{ id: number; name: string }>;
  locations?: Array<{ id: number; name: string }>;
  collections?: Array<{ id: number; name: string }>;
  products?: Array<{ id: number; name: string }>;
  crosscheck?: { id: number };
  findReplaceReject?: Array<{ id: number }>;
  createdAt: string;
  updatedAt: string;
  locale: string;
}

// Constants
const BATCH_SIZE = 100;

// API Configuration
const RELATIONS = {
  fields: ['name', 'slug', 'type', 'reference'],
  populate: '*',
} as const;

const DEFAULT_FIELDS = {
  single: ['name', 'slug', 'type', 'reference'],
  list: ['name', 'slug', 'type', 'reference'],
} as const;

// Server Actions
export async function getMetas(type?: MetaType) {
  const allMetas: Meta[] = [];

  const urlBuilder = new StrapiUrlBuilder('metas')
    .addPopulate(RELATIONS.populate)
    .addFields(DEFAULT_FIELDS.list)
    .addPagination(1, BATCH_SIZE);

if (type) {
  urlBuilder.addFilter('type', type.replace(/s$/, ''));
}

  const firstPage = await fetchFromAPI<{
    data: Meta[];
    meta: { pagination: { pageCount: number; total: number } };
  }>(urlBuilder.toString(), ['metas', ...(type ? [`metas-${type}`] : [])]);

  allMetas.push(...firstPage.data);

  const totalPages = firstPage.meta.pagination.pageCount;

  if (totalPages > 1) {
    const remainingPages = Array.from(
      { length: totalPages - 1 },
      (_, i) => i + 2
    );

    const responses = await Promise.all(
      remainingPages.map((page) =>
        fetchFromAPI<{ data: Meta[] }>(
          new StrapiUrlBuilder('metas')
            .addPopulate(RELATIONS.populate)
            .addFields(DEFAULT_FIELDS.list)
            .addPagination(page, BATCH_SIZE)
            .toString(),
          ['metas']
        )
      )
    );

    responses.forEach((response) => allMetas.push(...response.data));
  }

  return {
    data: allMetas,
    meta: { total: firstPage.meta.pagination.total },
  };
}

export async function getMeta(slug: string, type?: MetaType, fields?: string[]) {
  const urlBuilder = new StrapiUrlBuilder('metas', slug)
    .addPopulate(RELATIONS.populate)
    .addFields(fields ?? DEFAULT_FIELDS.single);

  if (type) {
    urlBuilder.addFilter('type', type);
  }

  const response = await fetchFromAPI<{ data: Meta[] }>(
    urlBuilder.toString(),
    ['metas', `meta-${slug}`, ...(type ? [`meta-${type}-${slug}`] : [])]
  );

  if (!response.data.length) {
    throw new Error(
      `Meta with slug "${slug}"${type ? ` and type "${type}"` : ''} not found`
    );
  }

  return {
    data: response.data[0],
    meta: {},
  };
}

export async function getMetaSlugs(type?: MetaType) {
  const response = await getMetas(type);
  return response.data.map((meta) => meta.slug);
}