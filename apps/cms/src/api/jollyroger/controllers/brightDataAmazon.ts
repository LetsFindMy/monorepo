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
  findCrosscheck,
  findProduct,
  productIdentifiers,
  createCrosscheck,
  linkProductCrosscheck,
  createNewProductWithPdp,
} from './brightDataUtils';
import { Product, ProductSchema } from './schemas';

/**
 * Product Finder - Happy Paths
 *
 * This module handles finding or creating products in the Strapi database based on Amazon data.
 * [Documentation omitted for brevity]
 */

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
      seller_id: sellerId,
      product_details,
    } = parsedAmzData;

    // Check ASIN
    if (!asin) {
      console.warn('No ASIN found for product', { productName });
      return [];
    }

    // Look for ISBNs
    const identifiers = productIdentifiers(asin, product_details);
    if (identifiers.length === 0) {
      console.warn('No valid identifiers found for product', { productName });
      return [];
    }

    // Find existing product, crosscheck, and brand
    const existingProduct = await findProduct(identifiers);
    const existingCrosscheck = existingProduct
      ? await findCrosscheck(identifiers)
      : null;
    const brand = await findBrand(sellerId);

    console.log('\n\n\n', '================================================');
    // if (existingProduct) {
    //   console.log(
    //     `Existing product found. Crosscheck: ${existingCrosscheck?.documentId ?? 'Not found'}`,
    //   );

    //   // Create Crosscheck if not found
    //   if (!existingCrosscheck) {
    //     const { asin, product_details } = parsedAmzData;
    //     const identifiers = productIdentifiers(asin, product_details);
    //     const newCrosscheck = await createCrosscheck(
    //       parsedAmzData,
    //       identifiers,
    //     );
    //     await linkProductCrosscheck(
    //       existingProduct.documentId,
    //       existingCrosscheck.documentId ?? newCrosscheck.documentId,
    //     );
    //   }
    // } else {
    //   await createNewProductWithPdp(parsedAmzData, identifiers, brand);
    // }

    return [parsedAmzData]; // Return the processed data
  } catch (error) {
    console.error(
      `Error in processBrightDataAmazon: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw error; // Re-throw the error to be handled by the caller
  }
};

export { processBrightDataAmazon };
