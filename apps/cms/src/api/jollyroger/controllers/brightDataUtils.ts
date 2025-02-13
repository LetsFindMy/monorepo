import type { Data } from '@strapi/strapi';
import ISBN from 'isbn3';
import type { Product, Variant, Format } from './schemas';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';

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
 * Identifiers
 */
export const extractIdentifier = (
  product_details: any[],
  type: string,
): string | null =>
  product_details?.find((detail) => detail.type === type)?.value ?? null;

export const validateISBN = (isbn: string | null): string | null =>
  isbn && ISBN.parse(isbn) ? isbn : null;

/**
 * Updated productIdentifiers:
 * If parentAsin is provided and different from asin, use parentAsin (plus ISBNs) only.
 * Otherwise, use asin (plus ISBNs).
 */
export const productIdentifiers = (
  asin: string,
  parentAsin: string | undefined,
  product_details: any[],
): string[] => {
  const isbn10 = validateISBN(extractIdentifier(product_details, 'ISBN-10'));
  const isbn13 = validateISBN(extractIdentifier(product_details, 'ISBN-13'));
  if (parentAsin && parentAsin !== asin) {
    return [parentAsin, isbn10, isbn13].filter(
      (id): id is string => id !== null && id !== undefined,
    );
  } else {
    return [asin, isbn10, isbn13].filter(
      (id): id is string => id !== null && id !== undefined,
    );
  }
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
  // Use the first identifier as the base asin.
  let asinValue = identifiers[0];
  let isbn10Value = identifiers[1] ?? null;
  let isbn13Value = identifiers[2] ?? null;

  // If media formats exist, check if the asin is a valid ISBN.
  if (
    parsedAmzData.format &&
    Array.isArray(parsedAmzData.format) &&
    parsedAmzData.format.length > 0
  ) {
    const parsedIsbn = ISBN.parse(asinValue);
    if (parsedIsbn && parsedIsbn.isIsbn10) {
      // If the asin is a valid ISBN, override the ISBN fields.
      isbn10Value = parsedIsbn.isbn10;
      isbn13Value = parsedIsbn.isbn13;
    }
  }

  return await strapi.documents('api::crosscheck.crosscheck').create({
    data: {
      name: parsedAmzData.title,
      asin: asinValue,
      isbn_10: isbn10Value,
      isbn_13: isbn13Value,
      // Add other relevant fields if needed.
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

export const createNewProduct2 = async (
  parsedAmzData: Product,
): Promise<Data.ContentType<'api::product.product'>> => {
  if (!parsedAmzData.title) {
    return Promise.reject(new Error('No title found for product'));
  }
  const maxLength = 40;
  let slug = slugify(parsedAmzData.title, {
    lower: true,
    trim: true,
    strict: true,
    replacement: '-',
  });
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
      slug: uuidv4(),
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
    const match = trimmed.match(
      /\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?:[/?]|$)/i,
    );
    return match?.[1];
  }
};

export const findOrCreateProductVariant = async (
  productId: string,
  variantData: Variant | Format,
  crosscheckId: string,
  isFormat = false,
): Promise<Data.ContentType<'api::product-variant.product-variant'>> => {
  let variantAsin: string | undefined;
  if ('asin' in variantData && variantData.asin) {
    variantAsin = variantData.asin;
  } else if ('url' in variantData && variantData.url) {
    variantAsin = parseAsin(variantData.url);
  }
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
  const allowedFormats = [
    'hardcover',
    'softcover',
    'otherBook',
    'digitalBookOther',
    'audible',
    'kindle',
    'spiralBound',
  ] as const;
  type AllowedFormat = (typeof allowedFormats)[number];
  const allowedFormatsSet = new Set<AllowedFormat>(allowedFormats);
  const getMediaType = (
    name?: string,
    isFormat?: boolean,
  ): AllowedFormat | undefined => {
    if (!isFormat || !name) return undefined;
    const format = name.toLowerCase() as AllowedFormat;
    return allowedFormatsSet.has(format) ? format : 'otherBook';
  };
  return await strapi.documents('api::product-variant.product-variant').create({
    data: {
      type: variantData.name,
      product: productId,
      crosscheck: crosscheckId,
      media_type: getMediaType(variantData.name, isFormat),
      asin: variantAsin,
    },
  });
};

export const createOrUpdatePdpForVariant = async (
  variantId: string,
  crosscheckId: string,
  parsedAmzData: Product,
  variantData: Variant | Format,
  brandId: string,
): Promise<Data.ContentType<'api::product-pdp.product-pdp'>> => {
  let variantAsin: string | undefined;
  let variantUrl: string | undefined;
  if ('asin' in variantData && variantData.asin) {
    variantAsin = variantData.asin;
  } else if ('url' in variantData && variantData.url) {
    variantAsin = parseAsin(variantData.url);
    variantUrl = variantData.url;
  }
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
    urls: [{ url: variantUrl || parsedAmzData.url, type: 'pdp' }],
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

export const createOrUpdatePdpForProduct = async (
  productId: string,
  crosscheckId: string,
  parsedAmzData: Product,
  brandId: string,
): Promise<Data.ContentType<'api::product-pdp.product-pdp'>> => {
  const asin = parsedAmzData.asin;
  if (!asin) {
    throw new Error('No ASIN found for product');
  }
  // Look for an existing PDP for this product using the sku (asin)
  const existingPdp = await strapi
    .documents('api::product-pdp.product-pdp')
    .findFirst({
      filters: {
        product: { documentId: productId },
        sku: asin,
      },
    });
  const pdpData = {
    ...buildPdpData(parsedAmzData, brandId),
    name: parsedAmzData.title,
    sku: asin,
    price_high: parsedAmzData.initial_price,
    price_sale: parsedAmzData.final_price,
    crosscheck: crosscheckId,
    product: productId,
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

/**
 * Checks whether a product-variant already exists for a given crosscheck record.
 */
export const checkIfVariantExists = async (
  crosscheckDocumentId: string,
): Promise<boolean> => {
  const existingVariant = await strapi
    .documents('api::product-variant.product-variant')
    .findFirst({
      filters: { crosscheck: { documentId: crosscheckDocumentId } },
    });
  return !!existingVariant;
};
