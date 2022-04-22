const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const onerror = require('koa-onerror');
const serve = require('koa-static');
const path = require('path');
const router = require('koa-router')();
const setupRouter = require('./router');

const MAX_AGE = 1000 * 60 * 5;

module.exports = (server) => {
  const app = new Koa();
  app.proxy = true;
  app.silent = true;
  onerror(app);
  setupRouter(router);
  app.use(async (ctx, next) => {
    ctx.disableBodyParser = true;
    await next();
  });
  app.use(bodyParser());
  app.use(router.routes());
  app.use(router.allowedMethods());
  app.use(serve(path.join(__dirname, '../public'), { maxage: MAX_AGE }));
  server.on('request', app.callback());
};
