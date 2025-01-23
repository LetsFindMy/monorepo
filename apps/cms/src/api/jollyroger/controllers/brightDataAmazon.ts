export type MediaType =
  | 'hardcover'
  | 'softcover'
  | 'otherBook'
  | 'digitalBookOther'
  | 'audible'
  | 'kindle';

export interface ProductVariantData {
  asin: string;
  media_type: MediaType;
}

export interface CrosscheckData {
  asin: string;
  product_variants: {
    connect: string[];
  };
}

export interface ProductPDPData {
  name: string;
  apiRawData: any;
  price_high: number;
  price_sale: number | null;
  sold_by: string;
  product_variants: {
    connect: string[];
  };
  urls: Array<{
    url: string;
    isCanonical: boolean;
    urlStatus: string;
  }>;
  copy: {
    full_markdown: string;
  };
}

export interface AmazonFormat {
  name: string;
  url: string;
}

export interface AmazonData {
  title: string;
  asin: string;
  format: AmazonFormat[];
  description: string;
  url: string;
  upc?: string;
  initial_price: number;
  final_price_high?: number;
  final_price?: number;
}

// Simple logging function
const log = (message: string, data?: any) => {
  console.log(
    `[${new Date().toISOString()}] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );
};

// Strapi Document Functions
async function createDocument<T>(model: string, data: T): Promise<any> {
  return await strapi.db.transaction(async (trx) => {
    try {
      return await trx.create(`api::${model}.${model}`, { data });
    } catch (error) {
      log(`Error creating ${model}`, { error, data });
      throw error;
    }
  });
}

async function findOrCreateModelByTitle(
  title: string,
  model: string,
): Promise<string> {
  return await strapi.db.transaction(async (trx) => {
    try {
      const existingEntry = await trx.findOne(`api::${model}.${model}`, {
        where: { name: title },
      });

      if (existingEntry) {
        return existingEntry.id;
      }

      const newEntry = await trx.create(`api::${model}.${model}`, {
        data: { name: title },
      });

      return newEntry.id;
    } catch (error) {
      log('Error finding or creating model by title', { error, title, model });
      throw error;
    }
  });
}

async function findCrosscheckWithAsinAndVariants(
  asin: string | null,
  upc: string | null,
): Promise<string | null> {
  if (asin == null && upc == null) {
    return null;
  }

  const filters: any = {
    $and: [
      { product_variants: { $notNull: true } },
      {
        $or: [
          ...(asin ? [{ asin: { $eqi: asin } }] : []),
          ...(upc ? [{ upc: { $eqi: upc } }] : []),
        ],
      },
    ],
  };

  try {
    const entry = await strapi.db.query('api::crosscheck.crosscheck').findOne({
      where: filters,
      populate: ['product_variants'],
    });

    return entry?.id ?? null;
  } catch (error) {
    log('Error finding crosscheck with ASIN and variants', {
      error,
      asin,
      upc,
    });
    throw error;
  }
}

// Helper Functions
function extractFormatAsins(formats: AmazonFormat[]): Record<string, string> {
  if (!Array.isArray(formats) || formats.length === 0) {
    log('Warning: formats is not a valid array', formats);
    return { default: '' }; // Return a default format if no valid formats are provided
  }
  return formats.reduce(
    (acc, item) => {
      if (typeof item?.url === 'string' && typeof item?.name === 'string') {
        const match = item.url.match(/\/dp\/([A-Za-z0-9]+)\//);
        if (match) acc[item.name] = match[1];
      } else {
        log('Warning: Invalid format item', item);
      }
      return acc;
    },
    {} as Record<string, string>,
  );
}

function validateAmazonData(data: any): data is AmazonData {
  const required = ['title', 'asin', 'description', 'url', 'initial_price'];

  const missingFields = required.filter((field) => !(field in data));
  if (missingFields.length > 0) {
    log('Warning: Missing fields in Amazon data', missingFields);
  }

  if (!Array.isArray(data.format)) {
    log('Warning: format is not an array or is missing', data.format);
    data.format = []; // Initialize as an empty array if missing or invalid
  }

  return missingFields.length === 0; // Return false if any required fields are missing
}

// Main Processor
export const processBrightDataAmazon = async (
  data: any,
  soldById: string,
): Promise<any> => {
  if (!validateAmazonData(data)) {
    log('Error: Invalid Amazon data format', data);
    return null;
  }

  try {
    const {
      title = 'Unknown Title',
      asin = '',
      upc = '',
      description = '',
      url = '',
      final_price_high,
      final_price,
      initial_price = 0,
      format = [],
    } = data;

    const formatAsins = extractFormatAsins(format);

    let productId: string;
    try {
      productId = await findOrCreateModelByTitle(title, 'product');
    } catch (error) {
      log('Error finding or creating product', { error, title });
      return null;
    }

    const createdVariants = [];
    const createdPDPs = [];

    for await (const [variantName, variantAsin] of Object.entries(
      formatAsins,
    )) {
      try {
        const crosscheckId = await findCrosscheckWithAsinAndVariants(asin, upc);

        if (!crosscheckId) {
          const newVariant = await createDocument<ProductVariantData>(
            'product-variant',
            {
              asin: variantAsin || asin, // Use the main ASIN if variant ASIN is empty
              media_type: variantName.toLowerCase() as MediaType,
            },
          );
          createdVariants.push(newVariant);

          const newCrosscheck = await createDocument<CrosscheckData>(
            'crosscheck',
            {
              asin: variantAsin || asin,
              product_variants: {
                connect: [newVariant.id],
              },
            },
          );

          const newPDP = await createDocument<ProductPDPData>('product-pdp', {
            name: title,
            apiRawData: data,
            price_high: initial_price,
            price_sale: final_price_high ? final_price : null,
            sold_by: soldById,
            product_variants: {
              connect: [newVariant.id],
            },
            urls: [{ url, isCanonical: true, urlStatus: 'pdp' }],
            copy: {
              full_markdown: description,
            },
          });
          createdPDPs.push(newPDP);
        }
      } catch (error) {
        log(`Error processing variant ${variantName}`, error);
        // Continue processing other variants
      }
    }

    // Return the final product with all created variants and PDPs
    return {
      product: { id: productId, title },
      variants: createdVariants,
      pdps: createdPDPs,
    };
  } catch (error) {
    log('Error in processBrightDataAmazon', error);
    return null;
  }
};
