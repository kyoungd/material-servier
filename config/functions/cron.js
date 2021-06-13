'use strict';

const moment = require('moment');
const { connectKafka, getTweets, summarizeTweets } = require('../util');

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
      const today = moment();
      // const yesterday = today.clone().subtract(1, 'days');
      // const result1 = await strapi.query('tweet').find({
      //   'symbol': 'TSLA',
      //   'tweet_dt_gte': yesterday.format('YYYY-MM-DD HH:mm:ss'),
      //   'tweet_dt_lt': today.format('YYYY-MM-DD HH:mm:ss')
      // });

      if (true && today.minute() % 5 == 0) {
        const kafka = connectKafka();
        const min5ago = today.clone().subtract(5, 'minutes');
        const sinceDt = today.clone().subtract(3, 'days');
        const rules = await strapi.query('symbol').find({ last_searched_on_gt: sinceDt.format('YYYY-MM-DD HH:mm:ss.000Z') });
        rules.forEach(async rule => {
          await summarizeTweets(rule, min5ago, "min5");
          await getTweets(kafka, rule, today);
        });
        console.log('get tweets ', rules.length);
      }
    } catch (ex) {
      console.log('cron - 5 minutes, error: ', ex);
      strapi.log.error('coron - 5 minutes, error: ', ex);
    }
  },

};
