'use server';

import { fetchFromAPI, StrapiUrlBuilder } from '#/lib/cmsUtils';

// Types
export interface Product {
  id: number;
  name: string;
  slug: string;
  is_story: boolean;
  brands?: Array<{ id: number; name: string; slug: string }>;
  collections?: Array<{ id: number; name: string; slug: string }>;
  events?: Array<{ id: number; name: string; slug: string }>;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  stories?: Array<{ id: number; name: string; slug: string }>;
  cast?: Array<{ id: number; name: string; slug: string }>;
  releases?: Array<{ id: number; name: string; slug: string }>;
  metas?: Array<{ id: number; name: string }>;
  locations?: Array<{ id: number; name: string; slug: string }>;
  pdps?: Array<{ id: number; name: string }>;
  crosscheck?: { id: number };
  copy?: {
    title?: string;
    description?: string;
  };
  product_variants?: Array<{ id: number; name: string }>;
  createdAt: string;
  updatedAt: string;
}

// Constants
const BATCH_SIZE = 100;

// API Configuration
const RELATIONS = {
  fields: ['name', 'slug', 'is_story'],
  populate: {
    brands: {
      fields: ['name', 'slug'],
    },
    collections: {
      fields: ['name', 'slug'],
    },
    events: {
      fields: ['name', 'slug'],
    },
    category: {
      fields: ['name', 'slug'],
    },
    stories: {
      fields: ['name', 'slug'],
    },
    cast: {
      fields: ['name', 'slug'],
    },
    releases: {
      fields: ['name', 'slug'],
    },
    metas: {
      fields: ['name'],
    },
    locations: {
      fields: ['name', 'slug'],
    },
    pdps: {
      fields: ['name'],
    },
    crosscheck: {
      fields: ['id'],
    },
    copy: {
      fields: ['title', 'description'],
    },
    product_variants: {
      fields: ['name'],
    },
  },
} as const;

const DEFAULT_FIELDS = {
  single: ['name', 'slug', 'is_story'],
  list: ['name', 'slug', 'is_story'],
} as const;

// Server Actions
export const getProducts = async () => {
  const allProducts: Product[] = [];

  const urlBuilder = new StrapiUrlBuilder('products')
    // .addPopulate(RELATIONS.populate)
    .addFields(DEFAULT_FIELDS.list)
    .addPagination(1, BATCH_SIZE);

  const firstPage = await fetchFromAPI<{
    data: Product[];
    meta: { pagination: { pageCount: number; total: number } };
  }>(urlBuilder.toString(), ['products']);

  allProducts.push(...firstPage.data);

  const totalPages = firstPage.meta.pagination.pageCount;

  if (totalPages > 1) {
    const remainingPages = Array.from(
      { length: totalPages - 1 },
      (_, i) => i + 2,
    );

    const responses = await Promise.all(
      remainingPages.map((page) =>
        fetchFromAPI<{ data: Product[] }>(
          new StrapiUrlBuilder('products')
            .addPopulate(RELATIONS.populate)
            .addFields(DEFAULT_FIELDS.list)
            .addPagination(page, BATCH_SIZE)
            .toString(),
          ['products'],
        ),
      ),
    );

    responses.forEach((response) => allProducts.push(...response.data));
  }

  return {
    data: allProducts,
    meta: { total: firstPage.meta.pagination.total },
  };
};

export const getProduct = async (slug: string) => {
  // 1. Update component population
  const SINGLE_PRODUCT_POPULATE = {
    ...RELATIONS.populate,
    copy: true, // Populate all component fields
    pdps: {
      populate: {
        product_variant: {
          populate: '*', // Get all variant fields
        },
      },
    },
    product_variants: {
      populate: {
        product_pdps: {
          populate: '*', // Get all variant PDP fields
        },
      },
    },
  };

  // 2. Remove .addFields() to get all product fields
  const urlBuilder = new StrapiUrlBuilder('products')
    .addPopulate(SINGLE_PRODUCT_POPULATE)
    .addFilter('slug', slug);

  // 3. Execute query
  const response = await fetchFromAPI<{ data: Product[] }>(
    urlBuilder.toString(),
    ['products', `product-${slug}`],
  );

  if (!response.data?.[0]) {
    throw new Error(`Product with slug "${slug}" not found`);
  }

  return { data: response.data[0], meta: {} };
};

export const getProductSlugs = async () => {
  try {
    const { data: products } = await getProducts();
    return products?.map((product) => product.slug) ?? [];
  } catch (error) {
    console.error('Error getting product slugs:', error);
    return [];
  }
};

// Additional helper functions for specific queries

export const getProductsByStory = async (storySlug: string) => {
  const urlBuilder = new StrapiUrlBuilder('products')
    .addPopulate(RELATIONS.populate)
    .addFields(DEFAULT_FIELDS.list)
    .addComplexFilter({
      stories: {
        slug: {
          $eq: storySlug,
        },
      },
    });

  const response = await fetchFromAPI<{
    data: Product[];
    meta: { pagination: { total: number } };
  }>(urlBuilder.toString(), ['products', `products-story-${storySlug}`]);

  return {
    data: response.data,
    meta: { total: response.meta.pagination.total },
  };
};

export const getProductsByCategory = async (categorySlug: string) => {
  const urlBuilder = new StrapiUrlBuilder('products')
    .addPopulate(RELATIONS.populate)
    .addFields(DEFAULT_FIELDS.list)
    .addComplexFilter({
      category: {
        slug: {
          $eq: categorySlug,
        },
      },
    });

  const response = await fetchFromAPI<{
    data: Product[];
    meta: { pagination: { total: number } };
  }>(urlBuilder.toString(), ['products', `products-category-${categorySlug}`]);

  return {
    data: response.data,
    meta: { total: response.meta.pagination.total },
  };
};
