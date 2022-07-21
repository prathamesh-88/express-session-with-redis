// Basic Imports
var fs = require('fs');
const morgan = require('morgan');
const express = require('express');
const session = require('express-session');

//Import Controllers
const {add_user, login, logout} = require('./controllers/authentication');

//Import Constants
const {NODE_ENV, PORT, LOG_DESTINATION, SESSION_SECRET, REDIS_HOST, REDIS_PORT} = require('./constants/environment');

//Import Middleware
const {authentication_required, redirect_authenticated} = require('./middleware/authentication');

//Redis Client Configuration
const {getClient} = require('./database/redis-client');
const {createClient} = require('redis');
let RedisStore = require('connect-redis')(session);
// const redisClient = getClient();

// Initialize Express App
const app = express();

//Need this part in ../database/redis-client.js
const redisClient = createClient({
    legacyMode: true,
    host: REDIS_HOST,
    port: REDIS_PORT
})

redisClient.on('error', function (err) {
    console.log('Could not establish a connection with redis. ' + err);
});

redisClient.on('connect', function (err) {
    console.log('Connected to redis successfully');
});

redisClient.connect(); //This is async, so we need to await it... Find a way to do that

//Until here

//Middleware declaration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    store : new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    resave: false,
    // cookie: { maxAge: 1000 * 60 * 60 * 24 },
    saveUninitialized: false
}))


if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
}else{
    // create a write stream (in append mode)
    var accessLogStream = fs.createWriteStream(LOG_DESTINATION, { flags: 'a' });
    // setup the logger
    app.use(morgan('combined', { stream: accessLogStream }))
}



app.post('/signup', (req, res) => add_user(req,res));
app.post('/login', redirect_authenticated, (req, res)  => login(req,res));
app.post('/logout', (req, res) => { logout(req,res); });


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})