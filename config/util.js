const axios = require('axios');
const { Kafka } = require('kafkajs');
const xml2js = require('xml2js');
const { default: createStrapi } = require('strapi');
const { sanitizeEntity } = require('strapi-utils');
const moment = require('moment');

const _ = require('lodash');

// const ENDPOINT = "http://material-api:5000"
const ENDPOINT = process.env.MATERIAL_API;


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

function normalizeSummary(data, period, since_dt, today_dt) {
    const numMinutes =
        type == 'minute' ? 5 :
            type == 'hour' ? 144 :
                type == 'day' ? 1440 : 0;
    let counter = 0;
    let normalized = [];
    while (now_dt < today_dt) {
        now_dt = now_dt.add(numMinutes, 'minutes');
        if (data[ix].tweet_dt >= now_dt.subtract(10, 'seconds') && data[ix].tweet_dt <= now_dt.add(10, 'seconds')) {
            normalized.append({ x: counter, time: data[ix].tweet_dt, score: data[ix].sentiment_score, count: data[ix].tweet_count })
            ++ix;
        }
        ++counter;
    }
    return normalized;
}

async function getTweetSummary(symbol, period, today) {
    const numHours =
        type == 'minute' ? 72 :
            type == 'hour' ? 240 :
                type == 'day' ? 1440 : 0;
    const since = today.subtract(numHours, 'hours');
    const result = await strapi.query('tweet').find({
        'symbol': symbol,
        'tweet_dt_gte': since.format('YYYY-MM-DD HH:00:00'),
        'tweet_dt_lt': today.format('YYYY-MM-DD HH:mm:ss')
    }, ['tweet_dt', 'sentiment_score']);
}

function send_email() {
    // if (sendOneEmail == true) {
    //   sendOneEmail = false;
    //   const pathToAttachment = `${__dirname}/../../test100.csv`;
    //   console.log(pathToAttachment);
    //   const attachment = fs.readFileSync(pathToAttachment).toString("base64");

    //   console.log(attachment);
    //   console.log('email sending...' );
    //   await strapi.plugins['email'].services.email.send({
    //     to: 'young@qdotdata.com',
    //     subject: 'Use strapi email provider',
    //     // from: 'young@bp.watch',
    //     text: 'Hello world! Text! http://canum.io ',
    //     attachments: [{
    //         content: attachment,
    //         filename: "test100.csv",
    //         type: "text/csv",
    //         disposition: "attachment"
    //       }]
    //   });
    //   console.log('email sent...  young@qdotdata.com');
    // }
}

async function postKafkaCommand(kafka, messages) {
    try {
        const producer = kafka.producer();
        console.log("Connecting... ");
        await producer.connect();
        console.log("Connected.");
        // messages.map(message => { })
        const result = await producer.send(messages);
        console.log(`message sent successfully ${result}`);
        await producer.disconnect();
    }
    catch (err) {
        console.log(err);
    }

}

function connectKafka() {
    return new Kafka({
        "clientId": "kafka_connect",
        "brokers": ["localhost:9092"]
    });
}

async function getTweets(kafka, rule, today) {
    try {
        // console.log('start make new heart rate date point');
        const fromDt = rule.tweet_tweeted_on === null ? moment().subtract(3, "days") : moment(rule.tweet_tweeted_on);
        const value = {
            "symbol": rule.symbol,
            "from_dt": fromDt.format('YYYY-MM-DD HH:mm:ss'),
            "until_dt": today.format('YYYY-MM-DD HH:mm:ss')
        }
        const message = {
            "topic": "TWEET",
            "messages": [{
                "key": "TWEETS_GET",
                "value": JSON.stringify(value),
                "partition": 0,
            }]
        }
        await postKafkaCommand(kafka, message);
        rule.tweet_tweeted_on = today.toDate();
        await strapi.query('symbol').update({ id: rule.id }, rule);
        return true;
    } catch (ex) {
        console.log('getTweets, error: ', ex);
        strapi.log.error('getTweets, error: ', ex);
    }
}

async function summarizeTweetGroup(symbol, ruleType, since_dt, until_dt) {
    try {
        const result = await strapi.query('tweet').find({
            'symbol': symbol,
            'tweet_dt_gte': since_dt.format('YYYY-MM-DD HH:mm:ss'),
            'tweet_dt_lt': until_dt.format('YYYY-MM-DD HH:mm:ss')
        });
        if (result.length > 0) {
            const score = _.meanBy(result, p => p.sentiment_score);
            await strapi.services['tweet-summary'].create({
                symbol,
                tweet_type: ruleType,
                tweet_dt: until_dt.toDate(),
                tweet_count: result.length,
                tweet_score: score,
            });
        }
        else {
            await strapi.services['tweet-summary'].create({
                symbol,
                tweet_type: ruleType,
                tweet_dt: until_dt.toDate(),
                tweet_count: 0,
                tweet_score: 0,
            });
        }
    }
    catch (ex) {
        console.log('summarizeTweetGroup, info: ', ex);
        strapi.log.info('summarizeTweetGroup, info: ', ex);
    }
}

async function summarizeTimeSeriesSteps(symbol, ruleType, since_dt, numMinutes, today, saveDataFunc) {
    let until_dt = since_dt.clone().add(numMinutes, "minutes");
    const timeNow = today.clone().subtract(1, "minutes");
    while (since_dt <= timeNow) {
        await saveDataFunc(symbol, ruleType, since_dt, until_dt);
        since_dt.add(numMinutes, "minutes");
        until_dt.add(numMinutes, "minutes");
    }
    return until_dt;
}

function getRuleMinutes(ruleType) {
    const numMinutes = ruleType == 'min5' ? 5 :
        ruleType == 'min10' ? 10 :
            ruleType == 'min30' ? 30 :
                ruleType == 'hour1' ? 60 :
                    ruleType == 'hour4' ? 240 :
                        ruleType == 'day1' ? 1440 :
                            ruleType == 'week1' ? 10080 : 0;
    return numMinutes;
}

async function summarizeTimeSeries(rule, today, ruleType, saveDataFunc) {
    try {
        const numMinutes = getRuleMinutes(ruleType);
        const lastSummaryOn = rule.tweet_summary_on === null ? moment().subtract(72, 'hours') : moment(rule.tweet_summary_on);
        const until_dt = await summarizeTimeSeriesSteps(rule.symbol, ruleType, lastSummaryOn, numMinutes, today, saveDataFunc);
        return true;
        // rule.tweet_summary_on = until_dt.toDate();
        // await strapi.services.symbol.update(rule);
    } catch (ex) {
        console.log('summarizeTweets, error: ', ex);
        strapi.log.error('summarizeTweets, error: ', ex);
        return false;
    }
}

async function summarizeTweets(rule, today, ruleType) {
    await summarizeTimeSeries(rule, today, ruleType, summarizeTweetGroup)
}

async function postNews(kafka, symbol, news) {
    try {
        // console.log('start make new heart rate date point');
        const value = {
            "symbol": symbol,
            "description": news.description[0],
            "link": news.link[0],
            "guid": news.guid[0]._,
            "pub_date": moment(news.pubDate[0]).format('YYYY-MM-DD HH:mm:ss.000Z'),
            "title": news.title[0]
        }
        const result = await strapi.services['site-yahoo'].create(value);
        const data = { id: result.id, ...value }
        const message = {
            "topic": "TWEET",
            "messages": [{
                "key": "YAHOO_NEWS",
                "value": JSON.stringify(data),
                "partition": 0,
            }]
        }
        await postKafkaCommand(kafka, message);
        return true;
    } catch (ex) {
        console.log('postNews, error: ', ex);
        strapi.log.error('postNews, error: ', ex);
    }
}

async function getYahooNews(kafka, rule) {
    const url = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${rule.symbol}&region=US&lang=en-US`;
    const result = await axios.get(url);
    xml2js.parseString(result.data, (err, result) => {
        try {
            if (err) {
                throw err;
            }
            const news = result.rss.channel[0].item;
            news.forEach(async item => {
                await postNews(kafka, rule.symbol, item);
                // if (item.pubDate >= rule.tweet_summary_on || rule.tweet_summary_on === null)
                //     await postNews(kafka, rule.symbol, item);
            });
        }
        catch (ex) {
            console.log('getYahooNews, error: ', ex);
            strapi.log.error('getYahooNews, error: ', ex);
        }
        // console.log(news);
    });
}

async function yahooNews(kafka, rule) {
    try {
        await getYahooNews(kafka, rule);
    }
    catch (ex) {
        console.log('yahooNews, error: ', ex);
        strapi.log.error('yahooNews, error: ', ex);
    }
}

async function saveSummarizeYahooNews(symbol, ruleType, since_dt, until_dt) {
    try {
        const result = await strapi.query('site-yahoo').find({
            'symbol': symbol,
            'pub_date_gte': since_dt.format('YYYY-MM-DD HH:mm:ss'),
            'pub_date_lt': until_dt.format('YYYY-MM-DD HH:mm:ss')
        });
        if (result.length > 0) {
            const score = _.meanBy(result, p => p.sentiment === null ? 0 : p.sentiment);
            await strapi.services['news-summary'].create({
                symbol,
                summary_type: ruleType,
                pub_date: until_dt.toDate(),
                news_count: result.length,
                news_score: score,
                source: 'YAHOO',
            });
        }
        else {
            await strapi.services['news-summary'].create({
                symbol,
                summary_type: ruleType,
                pub_date: until_dt.toDate(),
                news_count: 0,
                news_score: 0,
                source: 'YAHOO',
            });
        }
        return true;
    }
    catch (ex) {
        console.log('summarizeTweetGroup, info: ', ex);
        strapi.log.info('summarizeTweetGroup, info: ', ex);
        return false;
    }
}

async function summarizeYahooNews(rule, today, ruleType) {
    await summarizeTimeSeries(rule, today, ruleType, saveSummarizeYahooNews)
}

module.exports = { connectKafka, getThinkScript, getCompanyVitals, getTweets, summarizeTweets, yahooNews, summarizeYahooNews };
