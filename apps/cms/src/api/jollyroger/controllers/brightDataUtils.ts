import type { Data } from '@strapi/strapi';
import ISBN from 'isbn3';
import type { Product } from './schemas';
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
  parentAsin: string | undefined,
  product_details: any[],
): string[] => {
  const isbn10 = validateISBN(extractIdentifier(product_details, 'ISBN-10'));
  const isbn13 = validateISBN(extractIdentifier(product_details, 'ISBN-13'));
  const identifiers = [parentAsin, asin, isbn10, isbn13].filter(
    (id): id is string => id !== null && id !== undefined,
  );

  if (isbn10 && asin !== isbn10) {
    console.warn('ASIN and ISBN-10 are both present but do not match', {
      asin,
      isbn10,
    });
  }

  return identifiers;
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
 * Brands
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

const createNewProduct2 = async (
  parsedAmzData: Product,
): Promise<Data.ContentType<'api::product.product'>> => {
  if (!parsedAmzData.title) {
    return Promise.reject(new Error('No title found for product'));
  }
  const maxLength = 40;
  let slug = slugify(parsedAmzData.title, {
    lower: true,
    trim: true,
    strict: true, // Only alphanumeric characters and dashes will remain
    replacement: '-', // Spaces are replaced with dashes
  });
  // If the slug exceeds maxLength, trim it without cutting words in half.
  if (slug.length > maxLength) {
    const lastDashIndex = slug.lastIndexOf('-', maxLength);
    slug =
      lastDashIndex > 0
        ? slug.slice(0, lastDashIndex)
        : slug.slice(0, maxLength);
  }
  return await strapi.documents('api::product.product').create({
    data: {
      name: parsedAmzData.title,
      slug,
    },
  });
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

export const createNewProduct = async (
  parsedAmzData: Product,
  identifiers: string[],
  brand: Data.ContentType<'api::brand.brand'> | null,
) => {
  console.log(
    `No existing product found. Creating new product and crosscheck.`,
  );

  const newProduct = await createNewProduct2(parsedAmzData);
  const newCrosscheck = await createCrosscheck(parsedAmzData, identifiers);

  // Crosscheck
  await linkProductCrosscheck(newProduct.documentId, newCrosscheck.documentId);

  console.log(`Created new product and crosscheck for ${parsedAmzData.title}`);
  return { newProduct, newCrosscheck };
};

/**
 * Extracts the ASIN from a given Amazon URL or plain ASIN string.
 *
 * @param input - A URL or plain ASIN string.
 * @returns The extracted ASIN if found; otherwise, undefined.
 */
export const parseAsin = (input: string): string | undefined => {
  if (!input) return undefined;

  const trimmed = input.trim();

  // If the input is a valid ASIN (10 alphanumeric characters), return it
  if (/^[A-Z0-9]{10}$/i.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    // Match ASIN after either /dp/ or /gp/product/ followed by either ? or / or end of string
    const match = url.pathname.match(
      /\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?:[/?]|$)/i,
    );
    return match?.[1];
  } catch {
    // If the input isn't a valid URL, try matching it directly
    const match = trimmed.match(
      /\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?:[/?]|$)/i,
    );
    return match?.[1];
  }
};

export const findOrCreateProductVariant = async (
  productId: string,
  variantData: any,
  crosscheckId: string,
  isFormat = false,
): Promise<Data.ContentType<'api::product-variant.product-variant'>> => {
  const variantAsin = variantData.asin || parseAsin(variantData.url);
  if (!variantAsin) {
    console.warn('Unable to extract ASIN for variant', variantData);
    throw new Error('Unable to extract ASIN for variant');
  }

  const existingVariant = await strapi
    .documents('api::product-variant.product-variant')
    .findFirst({
      filters: {
        product: { documentId: productId },
        crosscheck: { documentId: crosscheckId },
      },
    });

  if (existingVariant) {
    return existingVariant;
  }

  return await strapi.documents('api::product-variant.product-variant').create({
    data: {
      type: variantData.name,
      product: productId,
      crosscheck: crosscheckId,
      media_type: isFormat ? variantData.name.toLowerCase() : undefined,
      asin: variantAsin,
      // Add other relevant fields from variantData
    },
  });
};

export const createOrUpdatePdpForVariant = async (
  variantId: string,
  crosscheckId: string,
  parsedAmzData: Product,
  variantData: any,
  brandId: string,
): Promise<Data.ContentType<'api::product-pdp.product-pdp'>> => {
  const variantAsin = variantData.asin || parseAsin(variantData.url);
  if (!variantAsin) {
    console.warn('Unable to extract ASIN for variant', variantData);
    throw new Error('Unable to extract ASIN for variant');
  }

  const existingPdp = await strapi
    .documents('api::product-pdp.product-pdp')
    .findFirst({
      filters: {
        product_variant: { documentId: variantId },
        sku: variantAsin,
      },
    });

  const pdpData = {
    ...buildPdpData(parsedAmzData, brandId),
    name: variantData.name,
    sku: variantAsin,
    price_high: variantData.price,
    price_sale: variantData.price,
    product_variant: variantId,
    crosscheck: crosscheckId,
    urls: [{ url: variantData.url, type: 'pdp' }],
  } as any;

  if (existingPdp) {
    return await strapi.documents('api::product-pdp.product-pdp').update({
      documentId: existingPdp.documentId,
      data: pdpData,
    });
  }

  return await strapi.documents('api::product-pdp.product-pdp').create({
    data: pdpData,
  });
};

export const findOrCreateCrosscheck = async (
  parsedAmzData: Product,
  identifiers: string[],
): Promise<Data.ContentType<'api::crosscheck.crosscheck'>> => {
  const existingCrosscheck = await findCrosscheck(identifiers);
  if (existingCrosscheck) {
    return existingCrosscheck;
  }
  return await createCrosscheck(parsedAmzData, identifiers);
};
