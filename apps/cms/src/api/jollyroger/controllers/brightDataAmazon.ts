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
  findOrCreateProductVariant,
  findOrCreateCrosscheck,
  createOrUpdatePdpForVariant,
  parseAsin,
} from './brightDataUtils';
import { type Product, ProductSchema } from './schemas';
import type { Data } from '@strapi/strapi';

const processBrightDataAmazon = async (
  amzData: unknown,
): Promise<Product[]> => {
  try {
    // Parse and validate the incoming Amazon data
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

    // Ensure we have a valid ASIN for the main product
    if (!asin) {
      console.warn('No ASIN found for product', { productName });
      return [];
    }

    // Generate identifiers for the product (using parent_asin if present)
    const identifiers = productIdentifiers(asin, parent_asin, product_details);
    if (identifiers.length === 0) {
      console.warn('No valid identifiers found for product', { productName });
      return [];
    }

    let product: Data.ContentType<'api::product.product'>;
    let productCrosscheck: Data.ContentType<'api::crosscheck.crosscheck'>;

    // Look for an existing product using the identifiers
    const existingProduct = await findProduct(identifiers);
    const brand = await findBrand(sellerId);

    console.log('================================================');
    if (existingProduct) {
      console.log('Existing product found. Processing variants...');
      product = existingProduct;
      // Ensure the product has its associated crosscheck
      productCrosscheck = await findOrCreateCrosscheck(
        parsedAmzData,
        identifiers,
      );
      await linkProductCrosscheck(
        product.documentId,
        productCrosscheck.documentId,
      );
    } else {
      // Create a new product and its crosscheck if it doesn't already exist
      const result = await createNewProduct(parsedAmzData, identifiers, brand);
      product = result.newProduct;
      productCrosscheck = result.newCrosscheck;
    }

    // Determine the set of variants/formats to process
    const variantsToProcess =
      variations && Array.isArray(variations)
        ? variations
        : format && Array.isArray(format)
          ? format
          : [];
    const isFormat = !!format && Array.isArray(format);

    console.log(`Processing ${variantsToProcess.length} variants/formats`);

    if (variantsToProcess.length > 0) {
      // Retrieve any existing product variants (with their crosschecks) for this product
      const existingVariants = await strapi
        .documents('api::product-variant.product-variant')
        .findMany({
          filters: { product: { documentId: product.documentId } },
          populate: ['crosscheck'],
        });

      // Map the existing variants by their crosscheck ASIN for quick lookup
      const existingVariantMap = new Map(
        existingVariants.map((v) => [v.crosscheck?.asin, v]),
      );

      for (const variantData of variantsToProcess) {
        // Extract the variant ASIN either directly or by parsing the URL
        const variantAsin =
          ('asin' in variantData && variantData.asin) ||
          ('url' in variantData ? parseAsin(variantData.url) : undefined);
        if (!variantAsin) {
          console.warn('Unable to extract ASIN for variant', variantData);
          continue;
        }

        // Check if the variant (by its ASIN) already exists in the product variants
        const existingVariant = existingVariantMap.get(variantAsin);
        if (existingVariant) {
          console.log(`Updating existing variant for ASIN: ${variantAsin}`);
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
          console.log(`Creating new variant for ASIN: ${variantAsin}`);
          // For variants, generate identifiers without including parent_asin to avoid conflict
          const variantIdentifiers = productIdentifiers(
            variantAsin,
            undefined,
            [],
          );
          const variantCrosscheck = await findOrCreateCrosscheck(
            parsedAmzData,
            variantIdentifiers,
          );

          try {
            // Create a new product variant with its dedicated crosscheck record
            const productVariant = await findOrCreateProductVariant(
              product.documentId,
              variantData,
              variantCrosscheck.documentId,
              isFormat,
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
              `Error processing variant for ASIN ${variantAsin}: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        }
      }
    } else if (brand) {
      // If no variants/formats exist, process a single PDP for the main product variant
      try {
        const mainProductVariant = await findOrCreateProductVariant(
          product.documentId,
          { name: productName, asin: asin },
          productCrosscheck.documentId,
          false,
        );

        await createOrUpdatePdpForVariant(
          mainProductVariant.documentId,
          productCrosscheck.documentId,
          parsedAmzData,
          {
            name: productName,
            asin: asin,
            price: parsedAmzData.initial_price,
            url: parsedAmzData.url,
          },
          brand.documentId,
        );
      } catch (error) {
        console.error(
          `Error creating main product PDP: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    // Return the processed data (or adjust as needed for your flow)
    return [parsedAmzData];
  } catch (error) {
    console.error(
      `Error in processBrightDataAmazon: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw error;
  }
};

export { processBrightDataAmazon };
