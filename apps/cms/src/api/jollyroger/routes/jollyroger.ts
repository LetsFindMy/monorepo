export default {
  routes: [
    // {
    //  method: 'GET',
    //  path: '/jollyroger',
    //  handler: 'jollyroger.exampleAction',
    //  config: {
    //    policies: [],
    //    middlewares: [],
    //  },
    // },


    {
      method: 'POST',
      path: '/jollyroger/brightdata/amazon',
      handler: 'jollyroger.processBrightDataAmazon',
      config: {
        policies: [],
        middlewares: [],
      },
    },

  ],
};
