import { Data, Schema } from '@strapi/strapi';
import ISBN from 'isbn3';
import { Product } from './schemas';
import slugify from 'slugify';

const buildPdpData = (parsedAmzData: Product, brandId: string) => ({
  name: parsedAmzData.title,
  sku: parsedAmzData.asin,
  isAvailable: parsedAmzData.is_available ?? true,
  price_high: parsedAmzData.initial_price,
  price_sale: parsedAmzData.final_price,
  urls: [{ url: parsedAmzData.url, type: 'pdp' }],
  apiRaw: parsedAmzData,
  copy: { description: parsedAmzData.description },
  sold_by: brandId,
});

/**
 *  Identifiers
 */
export const extractIdentifier = (
  product_details: any[],
  type: string,
): string | null =>
  product_details?.find((detail) => detail.type === type)?.value ?? null;

export const validateISBN = (isbn: string | null): string | null =>
  isbn && ISBN.parse(isbn) ? isbn : null;

export const productIdentifiers = (
  asin: string,
  product_details: any[],
): string[] => {
  const isbn10 = validateISBN(extractIdentifier(product_details, 'ISBN-10'));
  const isbn13 = validateISBN(extractIdentifier(product_details, 'ISBN-13'));
  if (isbn10 && asin !== isbn10) {
    console.warn('ASIN and ISBN-10 are both present but do not match', {
      asin,
      isbn10,
    });
  }
  return [asin, isbn10, isbn13].filter((id): id is string => id !== null);
};

const createIdentifierFilter = (identifiers: string[]) => ({
  $or: [
    { asin: { $in: identifiers } },
    { isbn_10: { $in: identifiers } },
    { isbn_13: { $in: identifiers } },
  ],
});

/**
 * Crosschecks
 */
export const findCrosscheck = async (identifiers: string[]) =>
  await strapi.documents('api::crosscheck.crosscheck').findFirst({
    filters: createIdentifierFilter(identifiers),
  });

export const createCrosscheck = async (
  parsedAmzData: Product,
  identifiers: string[],
): Promise<Data.ContentType<'api::crosscheck.crosscheck'>> => {
  return await strapi.documents('api::crosscheck.crosscheck').create({
    data: {
      name: parsedAmzData.title,
      asin: identifiers[0],
      isbn_10: identifiers[1] ?? null,
      isbn_13: identifiers[2] ?? null,
      // Add other relevant fields
    },
  });
};

/**
 *  Brands
 */
export const findBrand = async (
  sellerId: string,
): Promise<Data.ContentType<'api::brand.brand'> | null> => {
  return await strapi.documents('api::brand.brand').findFirst({
    filters: { amzMarketplaceId: sellerId },
  });
};

/**
 * Products
 */
export const findProduct = async (
  identifiers: string[],
): Promise<Data.ContentType<'api::product.product'> | null> => {
  // First look by Crosscheck
  const productByCrosscheck = await strapi
    .documents('api::product.product')
    .findFirst({
      filters: { crosscheck: createIdentifierFilter(identifiers) },
      populate: ['crosscheck', 'pdps'],
    });
  if (productByCrosscheck) {
    return productByCrosscheck;
  }
  // Then look by PDP sku
  return await strapi.documents('api::product.product').findFirst({
    filters: { pdps: { sku: { $in: identifiers } } },
    populate: ['crosscheck', 'pdps'],
  });
};

const createNewProduct = async (
    parsedAmzData: Product,
): Promise<Data.ContentType<'api::product.product'>> => {
    if (!parsedAmzData.title) {
        return Promise.reject(new Error('No title found for product'));
    }
    const maxLength = 40;
    let slug = slugify(parsedAmzData.title, {
        lower: true,
        trim: true,
        strict: true,      // Only alphanumeric characters and dashes will remain
        replacement: '-',  // Spaces are replaced with dashes
    });
    // If the slug exceeds maxLength, trim it without cutting words in half.
    if (slug.length > maxLength) {
        const lastDashIndex = slug.lastIndexOf('-', maxLength);
        slug = lastDashIndex > 0 ? slug.slice(0, lastDashIndex) : slug.slice(0, maxLength);
    }
    return await strapi.documents('api::product.product').create({
        data: {
            name: parsedAmzData.title,
            slug,
        },
    });
};

/**
 *  Product PDPs
 */
const createNewPdp = async (
  productId: string,
  crosscheckId: string,
  parsedAmzData: Product,
  brandId: string,
): Promise<Data.ContentType<'api::product-pdp.product-pdp'>> => {
  const newPdp = await strapi.documents('api::product-pdp.product-pdp').create({
    data: {
      ...buildPdpData(parsedAmzData, brandId),
      product: productId,
      crosscheck: crosscheckId,
    } as any,
  });
  console.log(`Created new PDP for existing product and brand ${brandId}`);
  return newPdp;
};

/**
 * Combinations
 */
export const linkProductCrosscheck = async (
  productDocumentId: string,
  crosscheckDocumentId: string,
): Promise<void> => {
  await strapi.documents('api::product.product').update({
    documentId: productDocumentId,
    data: {
      crosscheck: crosscheckDocumentId,
    } as any,
  });
};

export const createNewProductWithPdp = async (
  parsedAmzData: Product,
  identifiers: string[],
  brand: Data.ContentType<'api::brand.brand'> | null,
) => {
  console.log(
    `No existing product found. Creating new product, crosscheck, and PDP.`,
  );

  const newProduct = await createNewProduct(parsedAmzData);
  const newCrosscheck = await createCrosscheck(parsedAmzData, identifiers);

  // Crosscheck
  await linkProductCrosscheck(newProduct.documentId, newCrosscheck.documentId);

  // Create PDP is sold_by known
  if (brand) {
    const newPdp = await createNewPdp(
      newProduct.documentId,
      newCrosscheck.documentId,
      parsedAmzData,
      brand.documentId,
    );
    console.log(
      `Created new product, crosscheck, and PDP for ${parsedAmzData.title}`,
    );
    return { newProduct, newCrosscheck, newPdp };
  }

  console.log(
    `Created new product and crosscheck for ${parsedAmzData.title}. No matching brand found, skipping PDP creation.`,
  );
  return { newProduct, newCrosscheck };
};
