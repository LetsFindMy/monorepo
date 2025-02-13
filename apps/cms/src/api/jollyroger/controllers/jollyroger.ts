/**
 * A set of functions called "actions" for `jollyroger`
 */

const { processBrightDataAmazon } = require('./brightDataAmazon');

const checkAndCreateProduct = async (url, apiData) => {
  return strapi.db.transaction(async ({ trx }) => {
    const newProductService = strapi.documents('api::new-product.new-product');

    // Check if the URL exists
    const existingProduct = await newProductService.findFirst({
      filters: {
        url: { $eq: url },
      },
    });

    if (!existingProduct) {
      // URL doesn't exist, create a new record
      const newProduct = await newProductService.create({
        data: {
          url,
          api_data: apiData,
        },
      });
      return newProduct;
    }

    // URL already exists
    return existingProduct;
  });
};

const safeProcess = async (item: unknown) => {
  if (item && typeof item === 'object') {
    delete (item as { other_sellers_prices?: unknown }).other_sellers_prices;
  }
  try {
    // const result = await processBrightDataAmazon(item);
    if (!item || typeof item !== 'object' || !('url' in item)) {
      throw new Error('Invalid item: missing url property');
    }
    let result: any = undefined;
    // Handle cases where url is undefined/null or has no query strings
    const cleanUrl = item.url ? (item.url as string).split('?')[0] : ''; // Remove query strings
    if (!cleanUrl) {
      return;
    }
    return await checkAndCreateProduct(cleanUrl, item);
  } catch (error) {
    console.debug('Error processing item:', JSON.stringify(item));
    const { stack, ...errorDetails } = error as Record<string, unknown>;
    return errorDetails;
  }
};

export default {
  async brightDataAmazon(
    ctx: { request: { body: { data: any } } },
    _next: any,
  ) {
    const { data } = ctx.request.body;
    let foundOrCreatedProducts: any[] = [];

    if (Array.isArray(data)) {
      foundOrCreatedProducts = await Promise.all(
        data.map((item) => safeProcess(item)),
      );
    } else if (data && typeof data === 'object') {
      foundOrCreatedProducts = [await safeProcess(data)];
    } else {
      return;
    }

    return { receivedData: data, foundOrCreatedProducts };
  },
};
