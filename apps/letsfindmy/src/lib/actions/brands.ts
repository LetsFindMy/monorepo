'use server';

import { fetchFromAPI, StrapiUrlBuilder } from '#/lib/cmsUtils';
import { StrapiType } from '#/lib/allowedTaxonomies';

// Types
interface Brand {
  id: number;
  name: string;
  slug: string;
  baseUrl?: string;
  altUrls?: string;
  shortDescription?: string;
  hasStorefront: boolean;
  type: StrapiType;
  collections?: Array<{ id: number; name: string }>;
  products?: Array<{ id: number; name: string }>;
  ownedBy?: { id: number; name: string };
  owns?: Array<{ id: number; name: string }>;
  crosscheck?: { id: number };
  product_pdps?: Array<{ id: number; name: string }>;
  copy?: {
    title?: string;
    description?: string;
  };
  findReplaceReject?: Array<{ id: number }>;
  jollyRoger?: {
    id: number;
    // Add other fields as needed
  };
  createdAt: string;
  updatedAt: string;
}

// Constants
const BATCH_SIZE = 100;

// API Configuration
const RELATIONS = {
  fields: [
    'name',
    'slug',
    'type',
    'hasStorefront',
    'baseUrl',
    'altUrls',
    'shortDescription',
  ],
  populate: '*',
} as const;

const DEFAULT_FIELDS = {
  single: [
    'name',
    'slug',
    'type',
    'hasStorefront',
    'baseUrl',
    'altUrls',
    'shortDescription',
  ],
  list: ['name', 'slug', 'type', 'hasStorefront'],
} as const;

// Server Actions
/**
 * Fetches all brands from the API with optional type filtering
 * @param type - The StrapiType to filter brands by. If not provided, returns brands with null type
 * @returns Promise containing array of Brand objects and total count metadata
 * @throws Error if API request fails
 */
export async function getBrands(type: StrapiType) {
  const allBrands: Brand[] = [];

  // Initialize URL builder with common parameters
  const urlBuilder = new StrapiUrlBuilder('brands')
    .addPopulate(RELATIONS.populate)
    .addFields(DEFAULT_FIELDS.list)
    .addPagination(1, BATCH_SIZE);

  // Conditional filtering
  if (type) {
    urlBuilder.addFilter('type', type);
  } else {
    urlBuilder.addComplexFilter({ type: { $null: true } });
  }

  // Fetch first page
  const firstPage = await fetchFromAPI<{
    data: Brand[];
    meta: { pagination: { pageCount: number; total: number } };
  }>(urlBuilder.toString(), ['brands', `brands-${type}`]);

  allBrands.push(...firstPage.data);

  // Handle pagination
  const totalPages = firstPage.meta.pagination.pageCount;
  if (totalPages > 1) {
    const remainingPages = Array.from(
      { length: totalPages - 1 },
      (_, i) => i + 2,
    );

    const responses = await Promise.all(
      remainingPages.map((page) => {
        const pageBuilder = new StrapiUrlBuilder('brands')
          .addPopulate(RELATIONS.populate)
          .addFields(DEFAULT_FIELDS.list)
          .addPagination(page, BATCH_SIZE);

        // Replicate filtering logic for subsequent pages
        if (type) {
          pageBuilder.addFilter('type', type);
        } else {
          pageBuilder.addComplexFilter({ type: { $null: true } });
        }

        return fetchFromAPI<{ data: Brand[] }>(pageBuilder.toString(), [
          'brands',
          `brands-${type}`,
        ]);
      }),
    );

    responses.forEach((response) => allBrands.push(...response.data));
  }

  return {
    data: allBrands,
    meta: { total: firstPage.meta.pagination.total },
  };
}

export async function getBrand(slug: string, type: StrapiType) {
  const urlBuilder = new StrapiUrlBuilder('brands')
    .addPopulate(RELATIONS.populate)
    .addFields(DEFAULT_FIELDS.single)
    .addFilter('slug', slug);

  // Handle null type filtering
  if (type) {
    urlBuilder.addFilter('type', type);
  } else {
    urlBuilder.addComplexFilter({ type: { $null: true } });
  }

  const response = await fetchFromAPI<{ data: Brand[] }>(
    urlBuilder.toString(),
    ['brands', `brand-${slug}`, `brand-${type}-${slug}`],
  );

  return {
    data: response.data[0],
    meta: {},
  };
}

export async function getBrandSlugs(type: StrapiType) {
  const response = await getBrands(type);
  return response.data.map((brand) => brand.slug);
}
