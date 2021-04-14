const { createLogger, format, transports } = require('winston');
const { combine, timestamp, stack, json } = format;

function buildProdLogger() {
    return createLogger({
        // level: 'debug',   #env vals so that customizable
        format: combine(
            timestamp(),
            format.errors({ stack: true }),
            json()
        ),
        defaultMeta: { service: 'user-service' },
        transports: [
            new transports.Console()
        ],
        exceptionHandlers: [
            new transports.File({ filename: 'prod-exceptions.log' })
        ]        
    });
}

module.exports = buildProdLogger;