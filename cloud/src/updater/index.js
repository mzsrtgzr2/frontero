'use strict';

const config = require('./config/index');
const logger = require('./helpers/logger');

require('./app')(logger, config);
