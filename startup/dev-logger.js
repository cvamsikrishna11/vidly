const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, stack, errors } = format;

function buildDevLogger() {
    const myFormat = printf(({ level, message, timestamp, stack }) => {       
        return `${timestamp} ${level}: ${stack || message}`;
    });

    return createLogger({
        // level: 'debug',   #env vals so that customizable
        format: combine(
            format.splat(),
            format.colorize(),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            errors({ stack: true }),
            myFormat
        ),
        transports: [
            new transports.Console()
        ],
        exceptionHandlers: [
            // new transports.Console() 
            // here I am just writing into a file, but its not necessary to write into file in dev logger thats the diff with prod logger
            new transports.File({ filename: 'dev-exceptions.log' })
        ]
    });
}
module.exports = buildDevLogger;