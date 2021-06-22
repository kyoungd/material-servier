'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {

    async find(ctx) {
        let entities;
        if (ctx.query._q) {
            entities = await strapi.query('site-yahoo').search(ctx.query);
        } else {
            entities = await strapi.query('site-yahoo').find(ctx.query);
        }

        const data = entities.map(entity => ({ id: entity.id, tweet_dt: entity.pub_date, tweet_text: entity.title + " " + entity.description, sentiment_score: entity.sentiment }));
        return { [ctx.query.symbol]: data }
    },

};
