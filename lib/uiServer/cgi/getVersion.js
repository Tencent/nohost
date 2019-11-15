const pkg = require('../../../package.json');

module.exports = (ctx) => {
  ctx.body = {
    ec: 0,
    version: pkg.version,
    latestVersion: ctx.storage.latestVersion,
  };
};
