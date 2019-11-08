const Koa = require('koa');
const onerror = require('koa-onerror');
const serve = require('koa-static');
const path = require('path');
const router = require('koa-router')();
const setupRouter = require('./router');
const accountMgr = require('../accountMgr');
const envMgr = require('../envMgr');
const whistleMgr = require('../whistleMgr');
const { BASE_URL: baseUrl } = require('../util');

const MAX_AGE = 1000 * 60 * 5;
const success = function () {
  this.body = { ec: 0, baseUrl };
};
const error = function (em, ec) {
  em = em || '请求失败，请刷新页面重试';
  ec = ec || 2;
  this.body = { ec, em };
};

module.exports = (server, options) => {
  const { username, password } = options.data;
  const app = new Koa();
  app.proxy = true;
  onerror(app);
  app.use(async (ctx, next) => {
    ctx.success = success;
    ctx.error = error;
    ctx.accountMgr = accountMgr;
    ctx.envMgr = envMgr;
    ctx.config = options.config;
    ctx.updateRules = options.updateRules;
    ctx.whistleMgr = whistleMgr;
    ctx.admin = { username, password };
    ctx.set('x-nohost-base-url', baseUrl);
    const { path: pathname } = ctx;
    if (pathname === '/' || pathname === '/index.html') {
      ctx.req.url = '/select.html';
    } else if (pathname === '/js/nohost.js') {
      ctx.req.url = '/button.js';
    }
    await next();
  });
  setupRouter(router);
  app.use(router.routes());
  app.use(router.allowedMethods());
  app.use(serve(path.join(__dirname, '../../../../../public/'), { maxage: MAX_AGE }));
  server.on('request', app.callback());
};
