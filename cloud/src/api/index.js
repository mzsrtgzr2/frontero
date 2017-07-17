'use strict';

const config = require('./config/index');
const logger = require('./helpers/logger');

let server = require('./app')(logger, config);
server.listen(config.port);
