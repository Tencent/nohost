const bodyParser = require('koa-bodyparser');
const { passThrough } = require('../util');
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
  router.all('/account/**', async (ctx) => {
    const { req } = ctx;
    req.url = req.url.replace('/account/', '/plugin.nohost/account/');
    await passThrough(ctx);
  });
  router.all('/whistle/**', async (ctx) => {
    await passThrough(ctx);
  });
  router.all('/main/cgi-bin/**', bodyParser({ formLimit: '1mb' }));
  router.post('/main/cgi-bin/restart', restart);
  router.get('/main/cgi-bin/get-settings', getSettings);
  router.post('/main/cgi-bin/set-admin', setAdmin);
  router.post('/main/cgi-bin/set-domain', setDomain);
  router.post('/main/cgi-bin/set-token', setToken);
  router.post('/main/cgi-bin/set-white-list', setWhiteList);
};
