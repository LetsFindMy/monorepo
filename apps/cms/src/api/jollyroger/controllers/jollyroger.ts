/**
 * A set of functions called "actions" for `jollyroger`
 */

const { processBrightDataAmazon } = require('./brightDataAmazon');

export default {
  // exampleAction: async (ctx, next) => {
  //   try {
  //     ctx.body = 'ok';
  //   } catch (err) {
  //     ctx.body = err;
  //   }
  // }

   async brightDataAmazon(ctx) {
    const { data } = ctx.request.body;

    processBrightDataAmazon(data, 'st-2ac8');
    // Process the data here
    // For now, we'll just return the data
    return { receivedData: data };
  },
};
