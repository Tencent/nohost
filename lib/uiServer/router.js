const bodyParser = require('koa-bodyparser');
const { passThrough } = require('../util');
const login = require('./cgi/login');
const restart = require('./cgi/restart');
const getSettings = require('./cgi/getSettings');
const setAdmin = require('./cgi/setAdmin');
const setDomain = require('./cgi/setDomain');
const setToken = require('./cgi/setToken');
const setWhiteList = require('./cgi/setWhiteList');

module.exports = (router) => {
  router.all('/cgi-bin/**', async (ctx) => {
    const { req } = ctx;
    req.url = req.url.replace('/cgi-bin/', '/plugin.nohost/cgi-bin/');
    await passThrough(ctx);
  });
  router.all('/network/**', async (ctx) => {
    const { req } = ctx;
    req.url = req.url.replace('/network/', '/plugin.nohost/network/');
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

  router.all('/open-api/**', async (ctx) => {
    const { req } = ctx;
    req.url = req.url.replace('/open-api/', '/plugin.nohost/open-api/');
    await passThrough(ctx);
  });

  router.all('/follow', async (ctx) => {
    const { req } = ctx;
    req.url = req.url.replace('/follow', '/plugin.nohost/follow');
    await passThrough(ctx);
  });
  router.all('/unfollow', async (ctx) => {
    const { req } = ctx;
    req.url = req.url.replace('/unfollow', '/plugin.nohost/unfollow');
    await passThrough(ctx);
  });
  router.all('/redirect', async (ctx) => {
    const { req } = ctx;
    req.url = req.url.replace('/redirect', '/plugin.nohost/redirect');
    await passThrough(ctx);
  });
  router.all('/admin.html', login);
  router.all('/main/cgi-bin/**', login, bodyParser({ formLimit: '1mb' }));
  router.post('/main/cgi-bin/restart', restart);
  router.get('/main/cgi-bin/get-settings', getSettings);
  router.post('/main/cgi-bin/set-admin', setAdmin);
  router.post('/main/cgi-bin/set-domain', setDomain);
  router.post('/main/cgi-bin/set-token', setToken);
  router.post('/main/cgi-bin/set-white-list', setWhiteList);
};
