/**
 * A set of functions called "actions" for `jollyroger`
 */

const { processBrightDataAmazon } = require('./brightDataAmazon');

export default {
  async brightDataAmazon(ctx: { request: { body: { data: any } } }, _next: any) {
    const { data } = ctx.request.body;
    let foundOrCreatedProducts: any[];

    const safeProcess = async (item: unknown) => {
      try {
        return await processBrightDataAmazon(item);
      } catch (error) {
        console.error('\n\n', 'Error processing item:', item, error, '\n\n');
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
