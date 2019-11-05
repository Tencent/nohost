const { passThrough } = require('../util');
const restart = require('./cgi/restart');

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

  router.get('/main/cgi-bin/restart', restart);
};
