'use strict';
const redis = require('redis');
const moment = require('moment');
const util = require('util');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const client = (function () {
    try {
        const redisHost = process.env.REDIS_HOST;
        const redisPort = process.env.REDIS_PORT;
        const redisPassword = process.env.REDIS_PASSWORD;
        return redis.createClient({
            host: redisHost,
            port: redisPort,
            password: redisPassword
        });
    }
    catch (err) {
        console.log(err);
        return null;
    }
})();

module.exports = {

    async find(ctx) {
        return { status: "OK" }
    },

    async stacks(ctx) {
        const room = 'STUDYTHREEBARSTACK';
        const itemList = [];
        try {
            const getStack = util.promisify(client.hgetall).bind(client);
            const data = await getStack(room);
            Object.keys(data).forEach(key => {
                const item = JSON.parse(data[key]);
                item.map(one => {
                    let two = {};
                    two.type = one.type;
                    two.symbol = one.symbol + ' (' + one.period + ')';
                    two.datetime = moment(one.action.timestamp).format('HH:mm:ss');
                    two.closes = '$' + one.data[0].c.toString();
                    two.closes += ', $' + one.data[1].c.toString();
                    two.closes += ', $' + one.data[2].c.toString();
                    two.closes += ', $' + one.data[3].c.toString();
                    itemList.push(two);
                });
            });
        }
        catch (err) {
            console.log(err);
        }
        return itemList;
    },

    async scores(ctx) {
        const room = 'STUDYTHREEBARSCORE';
        const itemList = [];
        try {
            const getStack = util.promisify(client.hgetall).bind(client);
            const data = await getStack(room);
            Object.keys(data).forEach(key => {
                const item = JSON.parse(data[key]);
                item.map(one => {
                    let two = {};
                    two.type = one.type;
                    two.symbol = one.symbol + ' (' + one.period + ')';
                    two.data = '$' + one.trade.close.toString() + ' (' + one.trade.volume.toString() + ')';
                    two.score = one.score;
                    two.datetime = moment(one.timestamp).format('HH:mm:ss');
                    itemList.push(two);
                });
            });
        }
        catch (err) {
            console.log(err);
        }
        return itemList;
    }

};
