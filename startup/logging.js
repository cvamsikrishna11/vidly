const winston = require('winston');
// require('winston-mongodb');
require('express-async-errors');
const config = require('config');
const buildProdLogger = require('./prod-logger');
const buildDevLogger = require('./dev-logger');

let logger = null;

if (process.env.NODE_ENV === 'development') {
    // If we're not in production then log to the `console`, so dev logger should be built in a way that it will log only on console
    logger = buildDevLogger();
} else {
    logger = buildProdLogger();
}

module.exports = logger;



