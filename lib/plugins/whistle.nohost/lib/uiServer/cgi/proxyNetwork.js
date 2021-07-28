const { transformWhistle } = require('../../util');
const initNetwork = require('../network');

module.exports = async (ctx) => {
  const { req } = ctx;
  req.url = req.url.replace('/network', '');
  req.headers.host = 'local.wproxy.org';
  req.headers['x-forwarded-for'] = ctx.ip || '127.0.0.1';
  const port = await initNetwork();
  if (!req.url.indexOf('/cgi-bin/get-data?') && req.url.indexOf('ip=self') !== -1) {
    req.url = req.url.replace('ip=self', 'ip=clientId');
  }
  await transformWhistle(ctx, port);
};
