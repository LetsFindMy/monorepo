/**
 * Product Finder - Happy Paths
 *
 * This module handles finding or creating products in the Strapi database based on Amazon data.
 * Below are the main happy paths for different types of products:
 *
 * 1. Simple Product (No Variants):
 *    - Create/update a single product
 *    - Create/update a single PDP (Product Detail Page)
 *    - Link to a single crosscheck
 *    Example: A unique item like a specific electronic device
 *
 * 2. Media Product with Variants:
 *    - Create/update a single product
 *    - Create/update multiple product variants (e.g., Kindle, Hardcover, Paperback)
 *    - Create/update multiple PDPs, one for each variant
 *    - Link all variants and PDPs to a single crosscheck
 *    Example: A book available in multiple formats
 *
 * 3. Product with Multiple Sellers (No Variants):
 *    - Create/update a single product
 *    - Create/update multiple PDPs, one for each seller
 *    - Link all PDPs to a single crosscheck
 *    Example: A standard product sold by multiple vendors on Amazon
 *
 * 4. Product with Existing Crosscheck:
 *    - Update existing product information
 *    - Update or create new variants/PDPs as needed
 *    - Maintain link to existing crosscheck
 *    Example: Updating information for a product already in our database
 *
 * The module aims to handle these scenarios efficiently, creating or updating
 * entities as necessary while maintaining proper relationships between
 * products, variants, PDPs, and crosschecks.
 */

import {
  findBrand,
  findProduct,
  productIdentifiers,
  linkProductCrosscheck,
  createNewProduct,
  createNewProduct2,
  findOrCreateProductVariant,
  findOrCreateCrosscheck,
  createOrUpdatePdpForVariant,
  checkIfVariantExists,
  createOrUpdatePdpForProduct,
  parseAsin,
} from './brightDataUtils';
import { type Product, ProductSchema } from './schemas';

import type { Data } from '@strapi/strapi';

/**
 * A set of functions called "actions" for `jollyroger`
 */
export default {
  async brightDataAmazon(
    ctx: { request: { body: { data: any } } },
    _next: any,
  ) {
    const { data } = ctx.request.body;
    let foundOrCreatedProducts: any[];

    const safeProcess = async (item: unknown) => {
      const logs: string[] = [];
      logs.push('=------------------------------------=');

      // Remove unwanted properties
      if (item && typeof item === 'object') {
        delete (item as { other_sellers_prices?: unknown })
          .other_sellers_prices;
      }

      try {
        const result = await processBrightDataAmazon(item);
        logs.push('Processed result:', JSON.stringify(result));
        console.log(logs.join('\n\n\n'));
        return result;
      } catch (error) {
        logs.push('Error processing item:', JSON.stringify(item));
        // Exclude the `stack` property from error details
        const { stack, ...errorDetails } = error as Record<string, unknown>;
        logs.push('Error details:', JSON.stringify(errorDetails, null, 2));
        console.log(logs.join('\n\n\n'));
        return undefined;
      }
    };

    if (Array.isArray(data)) {
      foundOrCreatedProducts = await Promise.all(
        data.map((item) => safeProcess(item)),
      );
    } else if (data && typeof data === 'object') {
      foundOrCreatedProducts = await safeProcess(data);
    } else {
      return;
    }

    return { receivedData: data, foundOrCreatedProducts };
  },
};

const processBrightDataAmazon = async (
  amzData: unknown,
): Promise<Product[]> => {
  try {
    const parsedAmzData = ProductSchema.parse(amzData);
    if (!parsedAmzData) {
      console.warn('No valid product data found');
      return [];
    }
    const {
      title: productName,
      asin,
      parent_asin,
      seller_id: sellerId,
      product_details,
      variations,
      format,
    } = parsedAmzData;

    if (!asin) {
      console.warn('No ASIN found for product', { productName });
      return [];
    }

    const brand = await findBrand(sellerId);

    // Check if we're in the media formats scenario.
    const hasFormats =
      format && Array.isArray(format) && (format as any[]).length > 0;
    if (hasFormats) {
      // For media formats, treat the top-level product as a variant.
      const topVariantIdentifiers = productIdentifiers(asin, undefined, []);
      const topVariantCrosscheck = await findOrCreateCrosscheck(
        parsedAmzData,
        topVariantIdentifiers,
      );
      const topVariantExists = await checkIfVariantExists(
        topVariantCrosscheck.documentId,
      );

      // Check if any format variant is new.
      let newVariantNeeded = false;
      for (const formatData of format as any[]) {
        const variantAsin =
          ('asin' in formatData && formatData.asin) ||
          ('url' in formatData ? parseAsin(formatData.url) : undefined);
        if (!variantAsin) {
          console.warn('Unable to extract ASIN for format variant', formatData);
          continue;
        }
        const variantIdentifiers = productIdentifiers(
          variantAsin,
          undefined,
          [],
        );
        const variantCrosscheck = await findOrCreateCrosscheck(
          parsedAmzData,
          variantIdentifiers,
        );
        const exists = await checkIfVariantExists(variantCrosscheck.documentId);
        if (!exists) {
          newVariantNeeded = true;
          break;
        }
      }

      // If both top-level and all format variants already exist, skip creating new records.
      if (topVariantExists && !newVariantNeeded) {
        console.log('All product variants already exist; skipping creation.');
        return [parsedAmzData];
      }

      // Retrieve an existing product using identifiers or create a new one.
      const identifiers = productIdentifiers(
        asin,
        parent_asin,
        product_details,
      );
      let product = await findProduct(identifiers);
      if (!product) {
        product = await createNewProduct2(parsedAmzData);
      }

      // Process top-level variant.
      const topProductVariant = await findOrCreateProductVariant(
        product.documentId,
        { name: productName, asin },
        topVariantCrosscheck.documentId,
        false,
      );
      if (brand) {
        await createOrUpdatePdpForVariant(
          topProductVariant.documentId,
          topVariantCrosscheck.documentId,
          parsedAmzData,
          { name: productName, asin },
          brand.documentId,
        );
      }

      // Process each format variant.
      for (const formatData of format as any[]) {
        const variantAsin =
          ('asin' in formatData && formatData.asin) ||
          ('url' in formatData ? parseAsin(formatData.url) : undefined);
        if (!variantAsin) {
          console.warn('Unable to extract ASIN for format variant', formatData);
          continue;
        }
        const variantIdentifiers = productIdentifiers(
          variantAsin,
          undefined,
          [],
        );
        const variantCrosscheck = await findOrCreateCrosscheck(
          parsedAmzData,
          variantIdentifiers,
        );
        const exists = await checkIfVariantExists(variantCrosscheck.documentId);
        if (exists) {
          // Skip duplicate variant.
          continue;
        }
        const formatVariant = await findOrCreateProductVariant(
          product.documentId,
          formatData,
          variantCrosscheck.documentId,
          true,
        );
        if (brand) {
          await createOrUpdatePdpForVariant(
            formatVariant.documentId,
            variantCrosscheck.documentId,
            parsedAmzData,
            formatData,
            brand.documentId,
          );
        }
      }
    } else {
      // Non-formats scenario.
      const identifiers = productIdentifiers(
        asin,
        parent_asin,
        product_details,
      );
      if (identifiers.length === 0) {
        console.warn('No valid identifiers found for product', { productName });
        return [];
      }

      let product: Data.ContentType<'api::product.product'>;
      let productCrosscheck: Data.ContentType<'api::crosscheck.crosscheck'>;
      const existingProduct = await findProduct(identifiers);
      if (existingProduct) {
        product = existingProduct;
        productCrosscheck = await findOrCreateCrosscheck(
          parsedAmzData,
          identifiers,
        );
        await linkProductCrosscheck(
          product.documentId,
          productCrosscheck.documentId,
        );
      } else {
        const result = await createNewProduct(
          parsedAmzData,
          identifiers,
          brand,
        );
        product = result.newProduct;
        productCrosscheck = result.newCrosscheck;
      }

      // Process provided variants.
      const variantsToProcess =
        variations && Array.isArray(variations) ? variations : [];
      if (variantsToProcess.length > 0) {
        const existingVariants = await strapi
          .documents('api::product-variant.product-variant')
          .findMany({
            filters: { product: { documentId: product.documentId } },
            populate: ['crosscheck'],
          });
        const existingVariantMap = new Map(
          existingVariants.map((v) => [v.crosscheck?.asin, v]),
        );
        for (const variantData of variantsToProcess) {
          const variantAsin =
            ('asin' in variantData && variantData.asin) ||
            ('url' in variantData
              ? parseAsin(variantData.url as string)
              : undefined);
          if (!variantAsin) {
            console.warn('Unable to extract ASIN for variant', variantData);
            continue;
          }
          const variantIdentifiers = productIdentifiers(
            variantAsin,
            undefined,
            [],
          );
          const existingVariant = existingVariantMap.get(variantAsin);
          if (existingVariant) {
            if (brand) {
              await createOrUpdatePdpForVariant(
                existingVariant.documentId,
                existingVariant.crosscheck.documentId,
                parsedAmzData,
                variantData,
                brand.documentId,
              );
            }
          } else {
            const variantCrosscheck = await findOrCreateCrosscheck(
              parsedAmzData,
              variantIdentifiers,
            );
            try {
              const productVariant = await findOrCreateProductVariant(
                product.documentId,
                variantData,
                variantCrosscheck.documentId,
                false,
              );
              if (brand) {
                await createOrUpdatePdpForVariant(
                  productVariant.documentId,
                  variantCrosscheck.documentId,
                  parsedAmzData,
                  variantData,
                  brand.documentId,
                );
              }
            } catch (error) {
              console.error(
                `Error processing variant for ASIN ${variantAsin}: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              );
            }
          }
        }
      } else if (brand) {
        await createOrUpdatePdpForProduct(
          product.documentId,
          productCrosscheck.documentId,
          parsedAmzData,
          brand.documentId,
        );
      }
    }

    return [parsedAmzData];
  } catch (error) {
    console.error(
      `Error in processBrightDataAmazon: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    throw error;
  }
};

export { processBrightDataAmazon };
