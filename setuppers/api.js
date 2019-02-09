const LOGGER = require('backend-logger');

exports.name = 'api';
exports.source = 'https://github.com/vpapp-team/backend-api';
exports.description = 'The API Endpoints to use for the app';
exports.install = () => {
  LOGGER.logClean('installing api');
};
