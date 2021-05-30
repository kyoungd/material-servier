'use strict';

const moment = require('moment');
const { getTweets, summarizeTweets } = require('../util');

// const { default: createStrapi } = require('strapi');

/**
 * Cron config that gives you an opportunity
 * to run scheduled jobs.
 *
 * The cron format consists of:
 * [SECOND (optional)] [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK]
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#cron-tasks
 */

module.exports = {

  '0 * * * * *': async () => {
    // ----------------------------------------------------------------------
    // every 5 minutes, twitter
    // ----------------------------------------------------------------------
    try {
      const today = new moment();
      if (true || today.minute() % 5 == 0) {
        const sinceDt = today.subtract(3, 'days');
        const rules = await strapi.services.symbol.find({
          last_searched_on_gte: sinceDt.format('YYYY-MM-DD HH:mm:ss')
        }, ['symbol', 'tweet_tweeted_on']);
        rules.forEach(async rule => {
          await summarizeTweets(rule.symbol, today, "min5");
          await getTweets(rule.symbol, rule.tweet_tweeted_on, today);
        });
      }
      console.log('get tweets ', rules.length);
    } catch (ex) {
      console.log('cron - 5 minutes, error: ', ex);
      strapi.log.error('coron - 5 minutes, error: ', ex);
    }
  },

};
