'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const { getCompanyVitals } = require("../../../config/util");

const { sanitizeEntity } = require('strapi-utils');
const moment = require('moment');


async function updateLastSearchedOn(ctx, today) {
    const result = await strapi.query('symbol').find(ctx.query);
    if (result.length === 0) {
        await strapi.services.symbol.create({ symbol: ctx.query.symbol, last_searched_on: today.toDate(), });
    } else {
        const data = result[0];
        data.last_searched_on = today.toDate();
        await strapi.services['symbol'].update({ id: data.id }, data);
    }
}

module.exports = {
    /**
     * Retrieve a record.
     *
     * @return {Object}
     */


    async find(ctx) {
        try {
            const today = new moment();
            const { symbol } = ctx.query;
            console.log(symbol);
            const entities = await getCompanyVitals(symbol);
            await updateLastSearchedOn(ctx, today);
            return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.vitals }));
        }
        catch (err) {
            console.log(err);
            return { status: err };
        }
    }

};