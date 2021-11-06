'use strict';
const { sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {

    async realTimeStockData(ctx) {
        const { symbol } = ctx.query;
    },

    // async find(ctx) {
    //     try {
    //         const today = new moment();
    //         const { symbol } = ctx.query;
    //         const since = today.subtract(48, 'hours');
    //         const results = await strapi.query('news-summary').find({
    //             'symbol': symbol,
    //             'tweet_dt_gte': since.format('YYYY-MM-DD HH:00:00')
    //         });
    //         return results.map(entity => sanitizeEntity(entity, { model: strapi.models['news-summary'] }));
    //     }
    //     catch (err) {
    //         console.log(err);
    //         return { status: err };
    //     }
    // },

};
