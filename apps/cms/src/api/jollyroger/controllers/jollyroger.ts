/**
 * A set of functions called "actions" for `jollyroger`
 */

const { processBrightDataAmazon } = require('./brightDataAmazon');

export default {
  async brightDataAmazon(
    ctx: { request: { body: { data: any } } },
    _next: any,
  ) {
    const { data } = ctx.request.body;
    let foundOrCreatedProducts: any[] = []; // Ensure initialization

    const safeProcess = async (item: unknown) => {
      const logs: string[] = [];
      logs.push('=------------------------------------=');

      if (item && typeof item === 'object') {
        delete (item as { other_sellers_prices?: unknown })
          .other_sellers_prices;
        delete (item as { top_review?: unknown }).top_review;
        delete (item as { description?: unknown }).description;
      }

      try {
        const result = await processBrightDataAmazon(item);
        // logs.push('Processed result:', JSON.stringify(result, null, 2));
        console.log(logs.join('\n\n\n'));
        return result;
      } catch (error) {
        logs.push('Error processing item:', JSON.stringify(item, null, 2));
        const { stack, ...errorDetails } = error as Record<string, unknown>;
        logs.push('Error details:', JSON.stringify(errorDetails, null, 2));
        console.log(logs.join('\n\n\n'));
        return undefined;
      }
    };

    // if (Array.isArray(data)) {
    //   foundOrCreatedProducts = await Promise.all(
    //     data.map((item) => safeProcess(item)),
    //   );
    // } else if (data && typeof data === 'object') {
    //   foundOrCreatedProducts = await safeProcess(data);
    // } else {
    //   return;
    // }

    if (Array.isArray(data)) {
      for (const item of data) {
        const result = await safeProcess(item);
        if (result) foundOrCreatedProducts.push(result); // Safely push result
      }
    } else if (data && typeof data === 'object') {
      const result = await safeProcess(data);
      if (result) foundOrCreatedProducts.push(result); // Safely push result
    } else {
      return { message: 'Invalid data format' };
    }

    return { receivedData: data, foundOrCreatedProducts };
  },
};
