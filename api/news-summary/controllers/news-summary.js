
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const { getTweetSummary } = require("../../../config/util");
const { sanitizeEntity } = require('strapi-utils');
const moment = require('moment');

module.exports = {
    /**
     * Retrieve a record.
     *
     * @return {Object}
     */

    async find(ctx) {
        let entities;
        if (ctx.query._q) {
            entities = await strapi.query('news-summary').search(ctx.query);
        } else {
            entities = await strapi.query('news-summary').find(ctx.query);
        }

        const data = entities.map(entity => ({ pubDateTime: entity.pub_date, viewCount: entity.news_count, sentiment: entity.news_score }));
        return { [ctx.query.symbol]: data }
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
