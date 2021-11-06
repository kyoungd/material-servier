const redis = require('async-redis');

const rclient = null;

class RedisUtil {

    constructor() {
        if (rclient == null)
            rclient = redis.createClient();
        this.redis_client = rclient;
    }

    catch_return(func, returnErrValue) {
        try {

        }
        catch (err) {
            console.log(err);
            return returnErrValue;
        }
    }

    async cmd_HGETALL(key) {
        const value = await this.redis_client.hgetall(key);
        return value;
    }

    async cmd_GET(key) {
        const value = await this.redis_client.get(key);
        return value;
    }

    async cmd_SET(key, value) {
        await this.redis_client.set(key, value);
        return true;
    }

    // node redis timeseries get key [start] [end]
    async cmd_GET_TIMESERIES(key, start = NULL, end = NULL) {
        if (end == NULL) {
            end = '+';
        }
        const value = await this.redis_client.zrangebyscore(key, start, end);
        return value;
    }


}

module.exports = { RedisUtil }
