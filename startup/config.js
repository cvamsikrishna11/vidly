const config = require('config');
module.exports = function () {
    if (!config.get('jwtPrivateKey')) {
        console.log('FATAL ERROR: jwtPrivateKey is not defined!');
        throw new Error('FATAL ERROR: jwtPrivateKey is not defined!');

    }
    if (!process.env.NODE_ENV) {
        console.log('FATAL ERROR: env is not defined!');
        throw new Error('FATAL ERROR: env is not defined!');

    }
}