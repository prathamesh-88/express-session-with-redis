
const {createClient} = require('redis');
const {REDIS_HOST, REDIS_PORT} = require('../constants/environment');

const getClient = async () => {
        //Configure redis client
    const redisClient = createClient({
        // legacyMode: true,
        socket: {
            host: REDIS_HOST,
            port: REDIS_PORT
        }
    })

    redisClient.on('error', function (err) {
        console.log('Could not establish a connection with redis. ' + err);
    });

    redisClient.on('connect', function (err) {
        console.log('Connected to redis successfully');
    });

    await redisClient.connect();

    console.log(await redisClient.GET("server:test"))
    return redisClient;
}


module.exports = {getClient};