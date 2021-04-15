const express = require('express');
const app = express();
const logger = require('./startup/logging');
require('./startup/db')();
require('./startup/routes')(app);
require('./startup/validation')();
require('./startup/config')();
require('./startup/prod')(app);


const port = process.env.PORT || 3000;
// const server = app.listen(port, () => console.log(`Listening on port ${port}...`));
const server = app.listen(port, () => {
    logger.info(`Listening on port ${port}...`);
});

module.exports = server;