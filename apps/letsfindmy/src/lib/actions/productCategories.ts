'use server';

import { fetchFromAPI, StrapiUrlBuilder } from '#/lib/cmsUtils';
import { StrapiType } from '#/lib/allowedTaxonomies';

// Types
interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  type: StrapiType;
  children?: Array<{ id: number; name: string; slug: string }>;
  parent?: { id: number; name: string; slug: string };
  products?: Array<{ id: number; name: string }>;
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
  populate: {
    children: {
      fields: ['name', 'slug'],
    },
    parent: {
      fields: ['name', 'slug'],
    },
    products: {
      fields: ['name'],
    },
  },
} as const;

const DEFAULT_FIELDS = {
  single: ['name', 'slug', 'type'],
  list: ['name', 'slug', 'type'],
} as const;

// Server Actions
export async function getProductCategories(type: StrapiType) {
  console.log("INSIDE getProductCategories", type)
  const allProductCategories: ProductCategory[] = [];

  const urlBuilder = new StrapiUrlBuilder('product-categories')
    .addPopulate(RELATIONS.populate)
    .addFields(DEFAULT_FIELDS.list)
    .addPagination(1, BATCH_SIZE)
    .addFilter('type', type);

  const firstPage = await fetchFromAPI<{
    data: ProductCategory[];
    meta: { pagination: { pageCount: number; total: number } };
  }>(urlBuilder.toString(), [
    'product-categories',
    `product-categories-${type}`,
  ]);

  allProductCategories.push(...firstPage.data);

  const totalPages = firstPage.meta.pagination.pageCount;

  if (totalPages > 1) {
    const remainingPages = Array.from(
      { length: totalPages - 1 },
      (_, i) => i + 2,
    );

    const responses = await Promise.all(
      remainingPages.map((page) =>
        fetchFromAPI<{ data: ProductCategory[] }>(
          new StrapiUrlBuilder('product-categories')
            .addPopulate(RELATIONS.populate)
            .addFields(DEFAULT_FIELDS.list)
            .addPagination(page, BATCH_SIZE)
            .addFilter('type', type)
            .toString(),
          ['product-categories', `product-categories-${type}`],
        ),
      ),
    );

    responses.forEach((response) =>
      allProductCategories.push(...response.data),
    );
  }

  return {
    data: allProductCategories,
    meta: { total: firstPage.meta.pagination.total },
  };
}

export async function getProductCategory(slug: string, type: StrapiType) {
    console.log("INSIDE getProductCategory", slug, type)

  const response = await fetchFromAPI<{ data: ProductCategory[] }>(
    new StrapiUrlBuilder('product-categories', slug)
      .addPopulate(RELATIONS.populate)
      .addFields(DEFAULT_FIELDS.single)
      .addFilter('type', type)
      .toString(),
    [
      'product-categories',
      `product-category-${slug}`,
      `product-category-${type}-${slug}`,
    ],
  );

  if (!response.data.length) {
    throw new Error(
      `Product Category with slug "${slug}" and type "${type}" not found`,
    );
  }

  return {
    data: response.data[0],
    meta: {},
  };
}

export async function getProductCategorySlugs(type: StrapiType) {
  const response = await getProductCategories(type);
  return response.data.map((category) => category.slug);
}
