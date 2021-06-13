'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {

    async twitter_rules(ctx) {
        let entities;
        if (ctx.query._q) {
            entities = await strapi.query('symbol').search(ctx.query);
        } else {
            entities = await strapi.query('symbol').find(ctx.query);
        }
        // const rules = [{ value: 'TSLA', tag: "TSLA" }, { value: 'HYRE', tag: "HYRE" }, { value: 'RENN', tag: "RENN" }, { value: 'LFMD', tag: 'LFMD' }]
        let rules = [];
        entities.forEach(symbol => {
            rules.push({ "value": symbol.symbol, "tag": symbol.symbol });
        });
        return rules;
    },

};
