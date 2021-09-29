const redis = require("redis");

class RedisPubSub {

    constructor(redis_host, redis_port, redis_password) {
        this.redis_host = redis_host;
        this.redis_port = redis_port;
        this.redis_password = redis_password;
        this.redis_client = redis.createClient({
            host: this.redis_host,
            port: this.redis_port,
            password: this.redis_password
        });
    }

    publish(channel, message) {
        this.redis_client.publish(channel, message);
    }

    subscribe(channel, callback) {
        this.redis_client.subscribe(channel);
        this.redis_client.on("message", (channel, message) => {
            callback(channel, message);
        });
    }

    unsubscribe(channel) {
        this.redis_client.unsubscribe(channel);
    }

}

module.exports = { RedisPubSub }
