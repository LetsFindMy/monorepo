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

    // try {
    const foundOrCreatedProducts = await processBrightDataAmazon(data);

    //   if (foundOrCreatedProducts.length > 0) {
    //     console.log("Found or created products:")
    //     foundOrCreatedProducts.forEach((product, index) => {
    //       console.log(`Product ${index + 1}:`)
    //       console.log(JSON.stringify(product, null, 2))
    //     })
    //   } else {
    //     console.log("No matching products found or created")
    //   }
    // } catch (error) {
    //   console.error("Error:", error.message)
    // }

    // Process the data here
    // For now, we'll just return the data
    return { receivedData: data, foundOrCreatedProducts };
  },
};
