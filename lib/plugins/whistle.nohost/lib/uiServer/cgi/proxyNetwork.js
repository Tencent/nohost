const { transformWhistle, changeFilter } = require('../../util');
const initNetwork = require('../network');

module.exports = async (ctx) => {
  const { req } = ctx;
  req.url = req.url.replace('/network', '');
  req.headers.host = 'local.wproxy.org';
  req.headers['x-forwarded-for'] = ctx.ip || '127.0.0.1';
  const port = await initNetwork();
  changeFilter(req);
  await transformWhistle(ctx, port);
};
