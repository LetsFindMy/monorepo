type MediaType = "hardcover" | "softcover" | "otherBook" | "digitalBookOther" | "audible" | "kindle";

export const processBrightDataAmazon = async (data: any, soldById: string) => {
    // Drop unused fields
    delete data['top_review'];



    // Main product
    const {title, manufacturer} = data;

    // Crosscheck
    const {asin, upc} = data;

    // Variants
    const {department, format} = data;

    // PDP
    const {description, url,final_price_high,final_price, initial_price, seller_id: amzMerchantId, images} = data;

    // Extract formats
    const formatAsins = format.reduce((acc, item) => {
        const match = item.url.match(/\/dp\/([A-Za-z0-9]+)\//);
        if (match) acc[item.name] = match[1];
        return acc;
    }, {});


    // Check if Product name exists
    const productId = await upsertModelByTitle(title, 'product');

    // Check if Crosscheck exists
    for await (const [variantName, variantAsin] of Object.entries(formatAsins)) {
        const crosscheckId = await findCrosscheckWithAsinAndVariants(asin, upc);
        if (!crosscheckId) {
            const newVariant = await strapi.documents('api::product-variant.product-variant').create({
                data: {
                    asin: variantAsin,
                    media_type: variantName.toLowerCase() as MediaType,
                }
            });

            await strapi.documents('api::crosscheck.crosscheck').create({
                data: {
                    asin: variantAsin as string,
                    product_variants: {
                        connect: [newVariant.documentId]
                    }
                }
            });

            await strapi.documents('api::product-pdp.product-pdp').create({
                data: {
                    name: title,
                    apiRawData: data,
                    price_high: initial_price,
                    price_sale: final_price_high? final_price : null,
                    sold_by: soldById,
                    product_variants: {
                        connect: [newVariant.documentId]
                    },
        urls: [{ url, isCanonical: true, urlStatus: 'pdp' }],
                        copy: {
      full_markdown: description,
    }
                }
            });
        }
    }
}


async function upsertModelByTitle(title: string, model: string): Promise<string> {
    // @ts-ignore
  const result = await strapi.documents(`api::${model}.${model}`).upsert({
    filters: {name: { $eqi: title }},
    data: {name: title}
  });
  return result.documentId;
}



async function findCrosscheckWithAsinAndVariants(asin: string | null, upc: string | null): Promise<string | null> {
  if (asin == null && upc == null) {
    return null;
  }

  const filters: any = {
    product_variants: { $notNull: true }
  };

  if (asin || upc) {
    filters.$or = [
      ...(asin ? [{ asin: { $eqi: asin } }] : []),
      ...(upc ? [{ upc: { $eqi: upc } }] : [])
    ];
  }

  const [entry] = await strapi.documents('api::crosscheck.crosscheck').findMany({
    filters,
    populate: ['product_variants']
  });

  return entry?.documentId ?? null;
}