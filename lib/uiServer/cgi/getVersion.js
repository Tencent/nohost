const pkg = require('../../../package.json');

const { pid } = process;

module.exports = (ctx) => {
  ctx.body = {
    ec: 0,
    pid,
    version: pkg.version,
    latestVersion: ctx.storage.latestVersion,
  };
};
