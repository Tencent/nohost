const startWhistle = require('whistle');
const Router = require('@nohost/router');
const { parseArgv } = require('./lib/util');

module.exports = (options) => {
  return new Promise((resolve) => {
    startWhistle(parseArgv(options), function(proxy) {
      resolve(proxy, this);
    });
  });
};

module.exports.Router = Router;
