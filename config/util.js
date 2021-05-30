const axios = require('axios');
const { Kafka } = require('kafkajs');
const { default: createStrapi } = require('strapi');
const { sanitizeEntity } = require('strapi-utils');
const _ = require('lodash');

const ENDPOINT = "http://material-api:5000"

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

async function getTweets(symbol, last_tweeted_on, today) {
    // console.log('start make new heart rate date point');
    const fromtDt = moment(last_tweeted_on).format("YYYY-MM-DD hh:mm:ss");
    const todayDt = today.format("YYYY-MM-DD hh:mm:ss");
    message = {
        "topic": "TWEET",
        "messages": [{
            "key": "TWEETS_GET",
            "value": {
                "symbol": symbol,
                "from_dt": fromDt.format('YYYY-MM-DD HH:mm:ss'),
                "until_dt": todayDt.format('YYYY-MM-DD HH:mm:ss')
            },
            "partition": 0,
        }]
    }
    await postKafkaCommand(kafka, message);
    rule.tweet_tweeted_on = today;
    await strapi.service.symbol.update({ id: rule.id }, rule);
}

async function summarizeTweets(symbol, today, type) {
    try {
        const numMinutes = type == 'min5' ? 5 :
            type == 'min10' ? 10 :
                type == 'min30' ? 30 :
                    type == 'hour1' ? 60 :
                        type == 'hour4' ? 240 :
                            type == 'day1' ? 1440 :
                                type == 'week1' ? 10080 : 0;
        const since = today.subtract(numMinutes, 'minutes');
        const until_dt = today;
        const since_dt = since;
        const result = await strapi.services.tweet.find({
            'symbol': symbol,
            'tweet_dt_gte': today.format('YYYY-MM-DD HH:mm:ss'),
            'tweet_dt_lt': today.format('YYYY-MM-DD HH:mm:ss')
        }, ['sentiment_score']);
        if (result.length > 0) {
            const score = _.meanBy(result, p => p.sentiment_score);
            await strapi.service.tweet_summariy.insert({
                symbol,
                tweet_type: type,
                tweet_dt: today,
                tweet_count: result.length,
                tweet_score: score,
            });
        }
    } catch (ex) {
        console.log('cron - 1 hour, error: ', ex);
        strapi.log.error('cron - 1 hour, error: ', ex);
    }
}


module.exports = { getThinkScript, getCompanyVitals, getTweets, summarizeTweets };
