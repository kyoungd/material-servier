'use strict';

const { getThinkScript } = require("../../../config/util");
const { sanitizeEntity } = require("strapi-utils");


function getSRPeriods(settings) {
    const results = [];
    if (settings.sr_1w) results.push("1w");
    if (settings.sr_1d) results.push("1d");
    if (settings.sr_4h) results.push("4h");
    if (settings.sr_1h) results.push("1h");
    return results;
}

function getGFPeriods(settings) {
    const results = [];
    if (settings.gapfill_overnight) results.push("1d");
    if (settings.gapfill_days) results.push("xd");
    return results;
}

function getThnikscriptPromises(name, symbol, periods) {
    try {
        const results = [];
        for (let ix = 0; ix < periods.length; ++ix) {
            const period = periods[ix];
            console.log(name, symbol, period);
            const script = getThinkScript(name, symbol, period);
            results.push(script);
        };
        return results;
    }
    catch (error) {
        console.log(error);
        return [];
    }
}


const drawLineScript = `

script DrawLine {
    input startDate = 20210420;
    input onePrice = 50;
    def hh = if GetYYYYMMDD() >= startDate then onePrice else Double.NaN;
    plot oneLine = hh;
}

`;

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {

    async find(ctx) {
        const settings = {
            sr_1w: true,
            sr_1d: true,
            sr_4h: false,
            sr_1h: false,
            gapfill_overnight: true,
            gapfill_days: false
        }
        const { symbol } = ctx.query;
        try {
            const periods1 = getSRPeriods(settings);
            const periods2 = getGFPeriods(settings);
            const results1 = getThnikscriptPromises("sr", symbol, periods1);
            const results2 = getThnikscriptPromises("gf", symbol, periods2);
            const results = [...results1, ...results2];
            const scripts = await Promise.all(results);
            const retVal = scripts.reduce((total, item) => {
                return total + " \n " + (item.status === 200 ? item.data.result : "");
            }, "");
            return drawLineScript + retVal;
            // Promise.all(results).then(scripts => {
            //     let thinkscript = "";
            //     for (let ix = 0; ix < scripts.length; ++ix) {
            //         const item = scripts[ix];
            //         thinkscript += " \n " + (item.status === 200 ? item.data.result : "");
            //     }
            //     return drawLineScript + thinkscript;
            // });
            // return {}
        }
        catch (err) {
            console.log(err);
            return { status: err };
        }
    },

}