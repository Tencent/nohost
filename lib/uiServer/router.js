const { passThrough } = require('../util');

module.exports = (router) => {
  router.all('/cgi-bin/**', async (ctx) => {
    const { req } = ctx;
    req.url = req.url.replace('/cgi-bin/', '/plugin.nohost/cgi-bin/');
    await passThrough(ctx);
  });
  router.all('/account/**', async (ctx) => {
    const { req } = ctx;
    req.url = req.url.replace('/account/', '/plugin.nohost/account/');
    await passThrough(ctx);
  });
  router.all('/whistle/**', async (ctx) => {
    await passThrough(ctx);
  });
};
