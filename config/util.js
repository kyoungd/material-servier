const axios = require('axios');
const { default: createStrapi } = require('strapi');
const { sanitizeEntity } = require('strapi-utils');


const ENDPOINT = "http://localhost:5000"

async function getThinkScript(scriptName, symbol, period) {
    try {
        const url1 = ENDPOINT + "/study/" + scriptName.toLowerCase();
        const result1 = await axios.post(url1, {
            symbol,
            period,
        });
        const url2 = ENDPOINT + "/thinkscript/" + scriptName.toLowerCase();
        const result = result1.data;
        const result2 = await axios.post(
            url2, { result: result1.data.result }
        );
        return result2;
    }
    catch (err) {
        console.log(err);
        strapi.log.error(err);
    }
}

async function getCompanyVitals(symbol) {
    try {
        const url1 = ENDPOINT + "/vitals";
        const result1 = await axios.post(url1, {
            symbol
        });
        console.log(result1.data);
        return result1.data;
    }
    catch (err) {
        console.log(err);
        strapi.log.error(err);
    }
}

module.exports = { getThinkScript, getCompanyVitals };
