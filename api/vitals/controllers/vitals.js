'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const { getCompanyVitals } = require("../../../config/util");

const { sanitizeEntity } = require('strapi-utils');

module.exports = {
    /**
     * Retrieve a record.
     *
     * @return {Object}
     */

    async find(ctx) {
        try {
            const { symbol } = ctx.query;
            console.log(symbol);
            const result = await getCompanyVitals(symbol);
            return result;
        }
        catch (err) {
            console.log(err);
            return { status: err };
        }
    }

};