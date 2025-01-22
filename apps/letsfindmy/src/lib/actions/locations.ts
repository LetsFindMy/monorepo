'use server';

import { fetchFromAPI, StrapiUrlBuilder } from '#/lib/cmsUtils';
import { StrapiType } from '#/lib/allowedTaxonomies';

// Types
interface Location {
  id: number;
  name: string;
  slug: string;
  type: StrapiType;
  isFictional: boolean;
  isDestination: boolean;
  copy?: {
    title?: string;
    description?: string;
  };
  metas?: Array<{ id: number; name: string }>;
  products?: Array<{ id: number; name: string }>;
  events?: Array<{ id: number; name: string }>;
  crosscheck?: { id: number };
  findReplaceReject?: Array<{ id: number }>;
  createdAt: string;
  updatedAt: string;
}

// Constants
const BATCH_SIZE = 100;

// API Configuration
const RELATIONS = {
  fields: ['name', 'slug', 'type', 'isFictional', 'isDestination'],
  populate: '*',
} as const;

const DEFAULT_FIELDS = {
  single: ['name', 'slug', 'type', 'isFictional', 'isDestination'],
  list: ['name', 'slug', 'type', 'isFictional', 'isDestination'],
} as const;

// Server Actions
export async function getLocations(type: StrapiType) {
  const allLocations: Location[] = [];

  const urlBuilder = new StrapiUrlBuilder('locations')
    .addPopulate(RELATIONS.populate)
    .addFields(DEFAULT_FIELDS.list)
    .addPagination(1, BATCH_SIZE)
    .addFilter('type', type);

  const firstPage = await fetchFromAPI<{
    data: Location[];
    meta: { pagination: { pageCount: number; total: number } };
  }>(urlBuilder.toString(), ['locations', `locations-${type}`]);

  allLocations.push(...firstPage.data);

  const totalPages = firstPage.meta.pagination.pageCount;

  if (totalPages > 1) {
    const remainingPages = Array.from(
      { length: totalPages - 1 },
      (_, i) => i + 2,
    );

    const responses = await Promise.all(
      remainingPages.map((page) =>
        fetchFromAPI<{ data: Location[] }>(
          new StrapiUrlBuilder('locations')
            .addPopulate(RELATIONS.populate)
            .addFields(DEFAULT_FIELDS.list)
            .addPagination(page, BATCH_SIZE)
            .addFilter('type', type)
            .toString(),
          ['locations', `locations-${type}`],
        ),
      ),
    );

    responses.forEach((response) => allLocations.push(...response.data));
  }

  return {
    data: allLocations,
    meta: { total: firstPage.meta.pagination.total },
  };
}

export async function getLocation(slug: string, type: StrapiType) {
  const response = await fetchFromAPI<{ data: Location[] }>(
    new StrapiUrlBuilder('locations')
      .addComplexFilter({
        slug: { $eq: slug },
        type: { $eq: type },
      })
      .addPopulate(RELATIONS.populate)
      .addFields(DEFAULT_FIELDS.single)
      .toString(),
    ['locations', `location-${slug}`, `location-${type}-${slug}`],
  );

  return {
    data: response.data[0],
    meta: {},
  };
}

export async function getLocationSlugs(type: StrapiType) {
  const response = await getLocations(type);
  return response.data.map((location) => location.slug);
}
