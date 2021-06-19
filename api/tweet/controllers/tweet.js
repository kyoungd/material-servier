'use strict';
const { sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {

    async find(ctx) {
        let entities;
        if (ctx.query._q) {
            entities = await strapi.query('tweet').search(ctx.query);
        } else {
            entities = await strapi.query('tweet').find(ctx.query);
        }

        const data = entities.map(entity => ({ id: entity.id, tweet_dt: entity.tweet_dt, tweet_text: entity.tweet_text, sentiment_score: entity.sentiment_score }));
        return { [ctx.query.symbol]: data }
    },

};
