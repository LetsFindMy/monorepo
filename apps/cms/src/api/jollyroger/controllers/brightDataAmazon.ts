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
    // Parse
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
    } = parsedAmzData as any;

    // Check ASIN
    if (!asin) {
      console.warn('No ASIN found for product', { productName });
      return [];
    }

    // Look for ISBNs and include parent_asin if present
    const identifiers = productIdentifiers(asin, parent_asin, product_details);
    if (identifiers.length === 0) {
      console.warn('No valid identifiers found for product', { productName });
      return [];
    }

    // Find existing product, crosscheck, and brand
    const existingProduct = await findProduct(identifiers);
    const brand = await findBrand(sellerId);

    console.log('\n\n\n', '================================================');

    let product: Data.ContentType<'api::product.product'>;
    let productCrosscheck: Data.ContentType<'api::crosscheck.crosscheck'>;

    if (existingProduct) {
      console.log(`Existing product found.`);
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
      const result = await createNewProduct(parsedAmzData, identifiers, brand);
      product = result.newProduct;
      productCrosscheck = result.newCrosscheck;
    }

    // Handle variations and formats
    const variantsToProcess =
      variations && Array.isArray(variations)
        ? variations
        : format && Array.isArray(format)
          ? format
          : [];
    const isFormat = !!format && Array.isArray(format);

    // Fetch existing variants for the product
    const existingVariants = await strapi
      .documents('api::product-variant.product-variant')
      .findMany({
        filters: { product: { documentId: product.documentId } },
        populate: ['crosscheck'],
      });

    for (const variantData of variantsToProcess) {
      const variantAsin = variantData.asin || parseAsin(variantData.url);
      if (!variantAsin) {
        console.warn('Unable to extract ASIN for variant', variantData);
        continue;
      }

      // Check if the variant already exists
      const existingVariant = existingVariants.find(
        (v) => v.crosscheck?.asin === variantAsin,
      );

      if (existingVariant) {
        console.log(`Existing variant found for ASIN: ${variantAsin}`);
        // Update existing variant if needed
        // For now, we'll skip updating and just create/update the PDP
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
        const variantIdentifiers = productIdentifiers(
          variantAsin,
          parent_asin,
          [],
        );
        const variantCrosscheck = await findOrCreateCrosscheck(
          parsedAmzData,
          variantIdentifiers,
        );

        try {
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
            `Error processing variant: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    }

    // If no variants, create a single PDP for the main product
    if (variantsToProcess.length === 0 && brand) {
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

    return [parsedAmzData]; // Return the processed data
  } catch (error) {
    console.error(
      `Error in processBrightDataAmazon: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw error; // Re-throw the error to be handled by the caller
  }
};

export { processBrightDataAmazon };
