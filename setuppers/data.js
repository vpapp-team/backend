const LOGGER = new (require('backend-logger'))();

exports.name = 'data';
exports.source = 'https://github.com/vpapp-team/backend-data';
exports.description = 'The Handler for pulling new data from nig-bederkesa.de';
exports.install = () => {
  LOGGER.logClean('installing data');
};
